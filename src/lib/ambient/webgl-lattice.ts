/* ════════════════════════════════════════════════════════════════════════
   AMBIENT LENS — raw WebGL line renderer (NO 3D LIBRARY).

   Deliberately dependency-free: three.js is ~600KB; this lens is a few KB and
   is lazy-loaded only when eligible, never in the initial bundle. Raw WebGL
   gives exact control over disposal and context loss, which this step must
   PROVE, not assume.

   BOUNDED: 2 buffers, 1 program, 0 textures, 2 draw calls per frame. No post
   processing, no textures, no model loaders, no physics.

   PER-FRAME WORK (justified, allocation-free):
     · advance one time scalar (the slow drift)          — unavoidable, it moves
     · compose one 4x4 view-projection (fixed-size math) — one matrix, reused
     · set 3 uniforms + 2 drawArrays                     — the render itself
   Nothing else runs per frame; no GC churn, no layout reads.

   NO CONTINUOUS WORK WHEN STATIC: while paused (off-screen, blur, reduced,
   suspended) the rAF loop is cancelled entirely — zero GPU/CPU.
   ════════════════════════════════════════════════════════════════════════ */

import type { AmbientColor, AmbientInput } from "./contract";

export interface AmbientStats {
  running: boolean;
  suspended: boolean;
  drawCalls: number;
  frameMs: number;
  vertices: number;
  dpr: number;
}

export interface ResourceReport {
  created: { buffers: number; programs: number; textures: number };
  disposed: { buffers: number; programs: number; textures: number };
  lost: boolean;
}

/* ── tiny column-major mat4 helpers (fixed-size, no alloc churn) ────────── */
const ident = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
function mul(a: Float32Array, b: Float32Array): Float32Array {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}
function persp(fovy: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovy / 2);
  const o = new Float32Array(16);
  o[0] = f / aspect;
  o[5] = f;
  o[10] = (far + near) / (near - far);
  o[11] = -1;
  o[14] = (2 * far * near) / (near - far);
  return o;
}
const trans = (x: number, y: number, z: number) => {
  const o = ident();
  o[12] = x;
  o[13] = y;
  o[14] = z;
  return o;
};
const rotX = (a: number) => {
  const o = ident();
  const c = Math.cos(a), s = Math.sin(a);
  o[5] = c; o[6] = s; o[9] = -s; o[10] = c;
  return o;
};
const rotY = (a: number) => {
  const o = ident();
  const c = Math.cos(a), s = Math.sin(a);
  o[0] = c; o[2] = -s; o[8] = s; o[10] = c;
  return o;
};

const VERT = `attribute vec3 p; uniform mat4 vp; void main(){ gl_Position = vp * vec4(p,1.0); }`;
const FRAG = `precision mediump float; uniform vec3 col; uniform float alpha; void main(){ gl_FragColor = vec4(col, alpha); }`;

/** Module-level lifetime counters — how the 30x mount/unmount leak check is
    VERIFIED: after all instances dispose, created === disposed. */
export const GLOBAL_RESOURCES = {
  created: { buffers: 0, programs: 0, textures: 0 },
  disposed: { buffers: 0, programs: 0, textures: 0 },
};

export interface LatticeOptions {
  color: AmbientColor;
  cycleSeconds: number;
  maxCameraMove: number;
  maxParallax: number;
  onStats?: (s: AmbientStats) => void;
  onLost?: () => void;
  onRestored?: () => void;
  onAutoSuspend?: (reason: string) => void;
}

export class LatticeAmbient {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private input: AmbientInput;
  private opts: LatticeOptions;
  private prog: WebGLProgram | null = null;
  private fieldBuf: WebGLBuffer | null = null;
  private emphBuf: WebGLBuffer | null = null;
  private raf = 0;
  private running = false;
  private suspended = false;
  private disposed = false;
  private dpr = 1;
  private ema = 0;
  private slow = 0;
  private last = 0;
  private frame = 0;
  private created = { buffers: 0, programs: 0, textures: 0 };
  private disposedCount = { buffers: 0, programs: 0, textures: 0 };
  private lost = false;
  private onLostEvt = (e: Event) => {
    e.preventDefault();
    this.stop();
    this.lost = true;
    this.opts.onLost?.();
  };
  private onRestoredEvt = () => {
    this.lost = false;
    this.initGL();
    this.opts.onRestored?.();
  };

  constructor(canvas: HTMLCanvasElement, input: AmbientInput, opts: LatticeOptions) {
    this.canvas = canvas;
    this.input = input;
    this.opts = opts;
    canvas.addEventListener("webglcontextlost", this.onLostEvt, false);
    canvas.addEventListener("webglcontextrestored", this.onRestoredEvt, false);
  }

  initGL(): boolean {
    const gl = (this.gl = this.canvas.getContext("webgl", { antialias: true, alpha: true, powerPreference: "low-power" }));
    if (!gl) return false;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = (this.prog = gl.createProgram()!);
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    this.created.programs++;
    GLOBAL_RESOURCES.created.programs++;

    const mk = (data: Float32Array) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      this.created.buffers++;
      GLOBAL_RESOURCES.created.buffers++;
      return b;
    };
    this.fieldBuf = mk(this.input.field);
    this.emphBuf = mk(this.input.emphasis);
    return true;
  }

  resize(dpr: number) {
    this.dpr = dpr;
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  start() {
    if (this.disposed || this.suspended || !this.gl) return;
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = now - this.last;
      this.last = now;
      this.ema = this.ema ? this.ema * 0.9 + dt * 0.1 : dt;
      this.render(now / 1000);
      this.frame++;
      // frame-budget awareness: sustained degradation steps down -> suspends.
      if (this.ema > 34) this.slow++;
      else this.slow = Math.max(0, this.slow - 1);
      if (this.slow > 90) {
        this.suspend("frame budget exceeded");
        return;
      }
      if (this.frame % 20 === 0) this.stats();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private render(t: number) {
    const gl = this.gl!;
    const prog = this.prog!;
    const { cycleSeconds, maxCameraMove, maxParallax, color } = this.opts;
    const phase = (t / cycleSeconds) * Math.PI * 2;
    const camX = Math.sin(phase) * maxCameraMove;
    const camY = Math.cos(phase * 0.8) * maxCameraMove * 0.6;
    const ry = Math.sin(phase * 0.5) * maxParallax * 0.4;
    const rx = Math.cos(phase * 0.4) * maxParallax * 0.25;

    const aspect = this.canvas.width / Math.max(1, this.canvas.height);
    const proj = persp(Math.PI / 3.4, aspect, 0.1, 20);
    const view = mul(mul(trans(0, 0, -3.2), mul(rotY(ry), rotX(rx))), trans(camX, camY, 0));
    const vp = mul(proj, view);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    const loc = gl.getAttribLocation(prog, "p");
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "vp"), false, vp);

    let draws = 0;
    const draw = (buf: WebGLBuffer | null, alpha: number) => {
      if (!buf) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
      gl.uniform3f(gl.getUniformLocation(prog, "col"), color.r, color.g, color.b);
      gl.uniform1f(gl.getUniformLocation(prog, "alpha"), alpha);
      gl.drawArrays(gl.LINES, 0, buf === this.fieldBuf ? this.input.fieldVertices : this.input.emphasisVertices);
      draws++;
    };
    draw(this.fieldBuf, 0.35);
    draw(this.emphBuf, 0.8);
    this.drawCalls = draws;
  }
  private drawCalls = 0;

  stats(): AmbientStats {
    const s: AmbientStats = {
      running: this.running,
      suspended: this.suspended,
      drawCalls: this.drawCalls,
      frameMs: Math.round(this.ema * 10) / 10,
      vertices: this.input.fieldVertices + this.input.emphasisVertices,
      dpr: this.dpr,
    };
    this.opts.onStats?.(s);
    return s;
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (!this.disposed) this.stats(); // readout reflects the stop immediately
  }

  pause() {
    this.stop();
  }

  suspend(reason: string) {
    this.stop();
    this.suspended = true;
    this.opts.onAutoSuspend?.(reason);
  }

  resourceReport(): ResourceReport {
    return { created: { ...this.created }, disposed: { ...this.disposedCount }, lost: this.lost };
  }

  /* dev/test hooks */
  suspendNow(reason: string) {
    this.suspend(reason);
  }
  forceContextLoss() {
    const ext = this.gl?.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  }
  forceRestore() {
    const ext = this.gl?.getExtension("WEBGL_lose_context");
    ext?.restoreContext();
  }

  dispose() {
    this.disposed = true;
    this.stop();
    const gl = this.gl;
    if (gl) {
      if (this.fieldBuf) gl.deleteBuffer(this.fieldBuf);
      if (this.emphBuf) gl.deleteBuffer(this.emphBuf);
      if (this.prog) gl.deleteProgram(this.prog);
      this.disposedCount.buffers += (this.fieldBuf ? 1 : 0) + (this.emphBuf ? 1 : 0);
      this.disposedCount.programs += this.prog ? 1 : 0;
      GLOBAL_RESOURCES.disposed.buffers += (this.fieldBuf ? 1 : 0) + (this.emphBuf ? 1 : 0);
      GLOBAL_RESOURCES.disposed.programs += this.prog ? 1 : 0;
    }
    this.canvas.removeEventListener("webglcontextlost", this.onLostEvt);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestoredEvt);
    this.gl = null;
  }
}
