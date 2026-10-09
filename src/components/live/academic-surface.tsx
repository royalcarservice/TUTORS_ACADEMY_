"use client";

/* ════════════════════════════════════════════════════════════════════════
   ACADEMIC SURFACE — Phase 7 · Step 4 (DEC-025)

   The shared working plane of the chamber: a drawing-and-notation surface
   (chalk, ink, graphite) — NOT a corporate diagramming tool and not a toy.
   No sticky notes, no stamps, no emoji, no reaction overlays; the palette
   (surface-palette.tsx) is the discipline, and this file renders it.

   THE SUBSTRATE IS THE SUBJECT'S OWN. The 3.3 motif renderer draws the
   environment's authored structure faintly beneath a transparent canvas:
   Mathematics gets its lattice, Physics its field, Chemistry its bonds —
   identity inherited, never invented a second time (DEC-025). Inverted
   highlighting falls out of the palette: ivory ink on the dark graphite
   substrate IS the highlight.

   THE ENGINE IS A CANVAS AND NOTHING ELSE — no library, no dependency.
   High-DPI by devicePixelRatio; strokes are stored NORMALIZED (0..1), so
   resizing, density changes and different displays re-render the same
   geometry; rendering is quadratic-midpoint smoothing; pen pressure (where
   a device reports it) modulates the ink width; speed shapes the sampling.

   SYNC IS OPTIMISTIC AND LOCAL-FIRST (surface-sync.ts): every stroke applies
   instantly, then its packet goes to the bus — the in-memory bus today,
   the session's data channel when the wiring step lands. Unconfigured IS
   fully functional; that is the honest state, not a degraded one.

   KEYBOARD: every palette control is a real button. Stroke capture is a
   pointer act by nature; keyboard stroke input is owed (DEC-025), recorded
   rather than faked with an affordance that cannot draw.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";

import { SurfacePalette, type InkWidth } from "@/components/live/surface-palette";
import { Motif } from "@/components/motif/motif";
import type { MotifKind } from "@/lib/motif/types";
import type { Density } from "@/lib/subjects/subjects";
import {
  hitTest,
  newPacketId,
  useSurfaceSync,
  type StrokeColorId,
  type SurfaceBus,
  type SurfacePoint,
  type SurfaceTool,
} from "@/lib/livekit/surface-sync";
import { drawStroke, readStrokePalette } from "@/lib/livekit/stroke-render";

const INK_WIDTH: Record<InkWidth, number> = { fine: 2, medium: 3.5 };
const ERASER_RADIUS = 0.02;        // normalized — scales with the surface
const MIN_STEP = 0.0025;           // normalized sampling threshold (speed shaping)

interface ActiveStroke {
  tool: SurfaceTool;
  color: StrokeColorId;
  width: number;
  points: SurfacePoint[];
  pressureSum: number;
  pressureCount: number;
}

export function AcademicSurface({
  subjectId,
  motif,
  density,
  bus,
}: {
  subjectId: string;
  /** The subject's authored motif — the substrate's identity. */
  motif: MotifKind;
  /** The room's effective density lever (authored or shaped, 6.4). */
  density: Density;
  /**
   * THE ROOM'S CANVAS CHANNEL (Step 6) — the session's shared bus, handed
   * down by the chamber when a session stands. Absent, the surface keeps
   * its own private memory bus: LOCAL WORKING MODE, fully functional,
   * unchanged (DEC-025).
   */
  bus?: SurfaceBus;
}) {
  const { state, act } = useSurfaceSync(bus);
  const [tool, setTool] = useState<SurfaceTool>("ink");
  const [inkWidth, setInkWidth] = useState<InkWidth>("fine");
  const [color, setColor] = useState<StrokeColorId>("ivory");
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [revision, setRevision] = useState(0);   // redraws while a stroke is in flight

  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef<ActiveStroke | null>(null);
  const paletteRef = useRef<Record<StrokeColorId, string> | null>(null);

  /* ── the box measures itself; the canvas follows, at display density ──── */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize((s) => (Math.abs(s.w - rect.width) < 1 && Math.abs(s.h - rect.height) < 1 ? s : { w: rect.width, h: rect.height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── the subject resolves its own colours (tokens, not hex, in packets) ── */
  const resolvePalette = useCallback((): Record<StrokeColorId, string> => {
    if (paletteRef.current) return paletteRef.current;
    paletteRef.current = readStrokePalette(boxRef.current);
    return paletteRef.current;
  }, []);
  useEffect(() => {
    paletteRef.current = null;   // a different subject resolves different tokens
  }, [subjectId]);

  /* ── the redraw: substrate stays DOM; the canvas carries strokes only ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const dpr = typeof devicePixelRatio === "number" && devicePixelRatio > 0 ? devicePixelRatio : 1;
    const pw = Math.round(size.w * dpr);
    const ph = Math.round(size.h * dpr);
    if (canvas.width !== pw) canvas.width = pw;
    if (canvas.height !== ph) canvas.height = ph;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    const palette = resolvePalette();
    for (const s of state.strokes) drawStroke(ctx, s.points, size.w, size.h, s.width, palette[s.color]);
    const active = activeRef.current;
    if (active && active.points.length > 0) {
      drawStroke(ctx, active.points, size.w, size.h, active.width, palette[active.color]);
    }
  }, [state, size, revision, resolvePalette]);

  /* ── capture: normalized, pressure-aware, speed-shaped ─────────────────── */
  const toNormalized = useCallback((e: React.PointerEvent): SurfacePoint | null => {
    const el = boxRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  const eraseAt = useCallback((point: SurfacePoint) => {
    for (const id of hitTest(state, point, ERASER_RADIUS)) {
      act({ type: "remove", id: newPacketId(), target: id });
    }
  }, [act, state]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const point = toNormalized(e);
    if (!point) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (tool === "erase") {
      eraseAt(point);
      activeRef.current = null;
      return;
    }
    const pressure = typeof e.pressure === "number" && e.pressure > 0 && e.pressure < 1 ? e.pressure : 0.5;
    activeRef.current = {
      tool,
      color,
      width: tool === "line" ? INK_WIDTH[inkWidth] : INK_WIDTH[inkWidth],
      points: [point],
      pressureSum: pressure,
      pressureCount: 1,
    };
    setRevision((r) => r + 1);
  }, [color, eraseAt, inkWidth, toNormalized, tool]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (tool === "erase") {
      if (e.buttons === 0 && e.pointerType === "mouse") return;
      const point = toNormalized(e);
      if (point) eraseAt(point);
      return;
    }
    const active = activeRef.current;
    if (!active) return;
    const point = toNormalized(e);
    if (!point) return;
    if (typeof e.pressure === "number" && e.pressure > 0 && e.pressure < 1) {
      active.pressureSum += e.pressure;
      active.pressureCount += 1;
    }
    if (active.tool === "line") {
      // the straightedge: anchor and current end, nothing between
      active.points = [active.points[0], point];
    } else {
      const last = active.points[active.points.length - 1];
      if (Math.hypot(point.x - last.x, point.y - last.y) >= MIN_STEP) active.points.push(point);
    }
    setRevision((r) => r + 1);
  }, [eraseAt, toNormalized, tool]);

  const finishStroke = useCallback(() => {
    const active = activeRef.current;
    activeRef.current = null;
    if (!active || active.points.length === 0) return;
    // Pen pressure, where reported, modulates the ink width — averaged over
    // the stroke; a mouse's constant 0.5 leaves the width exactly as chosen.
    const pressureFactor = active.pressureCount > 0 ? Math.min(1.4, Math.max(0.7, 0.6 + (active.pressureSum / active.pressureCount) * 0.8)) : 1;
    const points = active.points.length === 1 ? [active.points[0], { x: active.points[0].x + 0.0001, y: active.points[0].y }] : active.points;
    act({
      type: "stroke",
      stroke: {
        id: newPacketId(),
        tool: active.tool,
        points,
        color: active.color,
        width: Math.round(active.width * pressureFactor * 100) / 100,
      },
    });
    setRevision((r) => r + 1);
  }, [act]);

  const onPointerUp = useCallback(() => finishStroke(), [finishStroke]);
  const onPointerCancel = useCallback(() => {
    activeRef.current = null;   // cancelled means unfinished: nothing is claimed
    setRevision((r) => r + 1);
  }, []);

  const onReset = useCallback(() => {
    act({ type: "clear", id: newPacketId() });
  }, [act]);

  return (
    <section data-academic-surface aria-label="The shared academic surface" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
      <div
        ref={boxRef}
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          borderRadius: "var(--ta-radius-2)",
          overflow: "clip",
          background: "var(--ta-surface-sunken)",
          border: "1px solid color-mix(in srgb, var(--ta-accent-1) 22%, transparent)",
        }}
      >
        {/* THE SUBJECT'S SUBSTRATE — authored motif, faint, aria-hidden by its
            own contract. The canvas above is transparent: strokes sit ON it. */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }}>
          <Motif subject={subjectId} kind={motif} role="substrate" density={density} purpose="surface" index={0} />
        </div>
        <canvas
          ref={canvasRef}
          aria-label="Drawing area"
          role="img"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: tool === "erase" ? "cell" : "crosshair" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        />
      </div>

      <SurfacePalette
        tool={tool}
        inkWidth={inkWidth}
        color={color}
        onTool={setTool}
        onInkWidth={setInkWidth}
        onColor={setColor}
        onReset={onReset}
      />
    </section>
  );
}
