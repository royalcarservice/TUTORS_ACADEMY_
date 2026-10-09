"use client";

/* ════════════════════════════════════════════════════════════════════════
   THE VECTOR WHITEBOARD REPLAY ENGINE — Phase 8 · Step 3 (DEC-031)

   Reads back a saved chamber surface — the exact StrokePacket vocabulary of
   Phase 7 ({ id, tool, points, color, width }) — on the subject's OWN motif.
   One renderer for the whole house: it draws through the shared
   stroke-render module (same fluid quadratic line as the live surface) and
   takes its colors from the same CSS tokens, so the record glows exactly as
   the chamber did. No second stroke vocabulary, no player library.

   TWO MODES, chosen by buttons (never by hidden gesture alone):
   · BOARD — the whole record stands at once, crisp at any resolution
     (devicePixelRatio-aware), with pan and zoom; the default, and always
     the default under prefers-reduced-motion;
   · PLAYBACK — the strokes return in their recorded order along one
     restrained scrubber; each frame is DETERMINISTIC (pure replayFrame —
     same strokes, same position, same board) and advances on
     requestAnimationFrame only while playing: nothing ticks at rest.

   Keyboard-complete: the board pans with the arrow keys, zooms with + / −,
   resets with 0 (real focusable surface, not a mouse-only drag); the
   scrubber and every toggle are native controls.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Motif } from "@/components/motif/motif";
import { replayFrame } from "@/lib/archive/replay";
import { drawStroke, readStrokePalette, STROKE_COLOR_FALLBACK } from "@/lib/livekit/stroke-render";
import type { Density, MotifKind } from "@/lib/motif/types";
import type { StrokePacket, SurfacePoint } from "@/lib/livekit/surface-sync";

/** The replay's clock: how many recorded points stand per second. */
const POINTS_PER_SECOND = 12;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;
const PAN_STEP = 24;

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

const CONTROL: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "var(--ta-target-primary)",
  minWidth: "var(--ta-target-primary)",
  padding: "var(--ta-space-2) var(--ta-space-3)",
  border: "1px solid var(--ta-border-subtle)",
  borderRadius: "var(--ta-radius-2)",
  background: "var(--ta-surface-base)",
  color: "var(--ta-text-primary)",
  fontSize: "var(--ta-text-sm)",
  cursor: "pointer",
};

type Mode = "board" | "playback";

export interface CanvasReplayProps {
  subjectId: string;
  motif: MotifKind;
  density: Density;
  /** The record, exactly as the chamber synchronized it. */
  strokes: readonly StrokePacket[];
}

export function CanvasReplay({ subjectId, motif, density, strokes }: CanvasReplayProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 1, h: 1 });

  /* The STATIC board is the opening state for every reader — the reduced
     motion contract is honored by default, never by special case: nothing
     moves until the reader chooses Playback, and even then the frames are
     discrete recorded strokes, not decorative motion. */
  const [mode, setMode] = useState<Mode>("board");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 });

  /* The record, once. Erase packets carry no pixels — the live surface
     answered them by lifting whole strokes out of the state, so the saved
     record stands without them; replay never invents a brush they had not. */
  const drawPackets = useMemo(() => strokes.filter((s) => s.tool === "ink" || s.tool === "line"), [strokes]);
  const pointSets = useMemo(
    () => drawPackets.map((s) => s.points).filter((p): p is readonly SurfacePoint[] => Array.isArray(p) && p.length > 0),
    [drawPackets],
  );
  const total = useMemo(() => pointSets.reduce((n, p) => n + p.length, 0), [pointSets]);
  const durationSeconds = total > 0 ? total / POINTS_PER_SECOND : 0;

  /* ── high-DPI sizing (identical discipline to the live surface) ─────── */
  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const dpr = typeof window !== "undefined" && window.devicePixelRatio > 0 ? Math.min(window.devicePixelRatio, 3) : 1;
    const size = () => {
      const r = box.getBoundingClientRect();
      sizeRef.current = { w: Math.max(1, r.width), h: Math.max(1, r.height) };
      canvas.width = Math.max(1, Math.round(sizeRef.current.w * dpr));
      canvas.height = Math.max(1, Math.round(sizeRef.current.h * dpr));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  /* ── draw the frame (deterministic; same input, same board) ─────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = typeof window !== "undefined" && window.devicePixelRatio > 0 ? Math.min(window.devicePixelRatio, 3) : 1;
    const { w, h } = sizeRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const palette = readStrokePalette(boxRef.current);
    const frame = mode === "board" ? pointSets : replayFrame(pointSets, progress);
    ctx.save();
    ctx.translate(view.tx, view.ty);
    ctx.scale(view.scale, view.scale);
    for (const s of drawPackets) {
      const points = mode === "board" ? s.points : findInFrame(frame, s.points);
      if (!points || points.length === 0) continue;
      drawStroke(ctx, points, w, h, s.width, palette[s.color] ?? STROKE_COLOR_FALLBACK);
    }
    ctx.restore();
  });

  /* ── the playback clock: requestAnimationFrame ONLY while playing ────── */
  useEffect(() => {
    if (!playing || mode !== "playback" || durationSeconds <= 0) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setProgress((p) => {
        const next = p + dt / durationSeconds;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, mode, durationSeconds]);

  const togglePlay = useCallback(() => {
    setPlaying((was) => {
      if (!was && progress >= 1) setProgress(0); // a second reading starts again
      return !was;
    });
  }, [progress]);

  /* ── pan / zoom: keyboard first, pointer as the enhancement ─────────── */
  const zoomBy = useCallback((factor: number) => {
    setView((v) => {
      const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * factor));
      const { w, h } = sizeRef.current;
      const cx = w / 2;
      const cy = h / 2;
      return { scale, tx: cx - (scale / v.scale) * (cx - v.tx), ty: cy - (scale / v.scale) * (cy - v.ty) };
    });
  }, []);

  const resetView = useCallback(() => setView({ scale: 1, tx: 0, ty: 0 }), []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const key = e.key;
    if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") {
      e.preventDefault();
      const dx = key === "ArrowLeft" ? PAN_STEP : key === "ArrowRight" ? -PAN_STEP : 0;
      const dy = key === "ArrowUp" ? PAN_STEP : key === "ArrowDown" ? -PAN_STEP : 0;
      setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
    } else if (key === "+" || key === "=") {
      e.preventDefault();
      zoomBy(ZOOM_STEP);
    } else if (key === "-" || key === "_") {
      e.preventDefault();
      zoomBy(1 / ZOOM_STEP);
    } else if (key === "0") {
      e.preventDefault();
      resetView();
    }
  }, [zoomBy, resetView]);

  /* Drag-to-pan in board mode — an enhancement, never the only route. */
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (mode !== "board") return;
    dragRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [mode]);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setView((v) => ({ ...v, tx: v.tx + (e.clientX - d.x), ty: v.ty + (e.clientY - d.y) }));
    dragRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  const percent = Math.round(progress * 100);

  return (
    <div data-canvas-replay data-mode={mode} style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
      {/* THE BOARD — the subject's substrate beneath, the record above. */}
      <div
        ref={boxRef}
        tabIndex={0}
        role="img"
        aria-label={`Board record for ${subjectId}. Arrow keys pan, plus and minus zoom, zero resets.`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          borderRadius: "var(--ta-radius-2)",
          overflow: "clip",
          background: "var(--ta-surface-sunken)",
          border: "1px solid color-mix(in srgb, var(--ta-accent-1) 22%, transparent)",
          touchAction: "none",
          cursor: mode === "board" ? "grab" : "default",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }}>
          <Motif subject={subjectId} kind={motif} role="substrate" density={density} purpose="surface" index={0} />
        </div>
        <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      </div>

      {/* THE CONTROLS — buttons and ranges; every action keyboard-reachable. */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ta-space-3)" }}>
        <div role="group" aria-label="Reading mode" style={{ display: "inline-flex", gap: "var(--ta-space-1)" }}>
          <button type="button" data-replay-mode="board" onClick={() => { setMode("board"); setPlaying(false); }} aria-pressed={mode === "board"} style={{ ...CONTROL, color: mode === "board" ? "var(--ta-accent-1)" : "var(--ta-text-secondary)" }}>
            Board
          </button>
          <button type="button" data-replay-mode="playback" onClick={() => setMode("playback")} aria-pressed={mode === "playback"} style={{ ...CONTROL, color: mode === "playback" ? "var(--ta-accent-1)" : "var(--ta-text-secondary)" }}>
            Playback
          </button>
        </div>

        {mode === "board" ? (
          <div role="group" aria-label="Pan and zoom" style={{ display: "inline-flex", gap: "var(--ta-space-1)" }}>
            <button type="button" data-replay-zoom="in" onClick={() => zoomBy(ZOOM_STEP)} style={CONTROL} aria-label="Zoom in">+</button>
            <button type="button" data-replay-zoom="out" onClick={() => zoomBy(1 / ZOOM_STEP)} style={CONTROL} aria-label="Zoom out">−</button>
            <button type="button" data-replay-zoom="reset" onClick={resetView} style={CONTROL} aria-label="Reset view">Reset</button>
          </div>
        ) : (
          <>
            <button type="button" data-replay-toggle onClick={togglePlay} aria-pressed={playing} disabled={total === 0} style={CONTROL}>
              {playing ? "Pause" : "Play"}
            </button>
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(progress * 1000)}
              onChange={(e) => { setPlaying(false); setProgress(Number(e.target.value) / 1000); }}
              aria-label="Replay position"
              disabled={total === 0}
              style={{ flex: 1, minWidth: "8rem", accentColor: "var(--ta-accent-1)" }}
            />
            <p style={MONO} aria-hidden="true">{percent}%</p>
          </>
        )}
      </div>
    </div>
  );
}

/** The playback frame holds truncated point arrays; find the original set a
    packet belongs to so board and playback share one drawing path. */
function findInFrame(frame: readonly (readonly SurfacePoint[])[], original: readonly SurfacePoint[]): readonly SurfacePoint[] | null {
  for (const f of frame) {
    if (f.length > 0 && original.length > 0 && f[0] === original[0]) return f;
  }
  return null;
}
