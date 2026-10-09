/**
 * STROKE RENDER — Phase 8 · Step 3 (DEC-031).
 *
 * The ONE canvas renderer for the academy's stroke vocabulary. Extracted from
 * the academic surface (DEC-025) so the live chamber and the archive's replay
 * engine draw from the SAME code — the "never a second stroke vocabulary"
 * discipline (DEC-028) carried from the wire to the pixel.
 *
 * PURE CANVAS, no React, no DOM storage, no timers:
 *   · points are NORMALIZED (0..1) — the renderer scales them to the box, so
 *     high-DPI displays and resizes re-render the same geometry;
 *   · the line is quadratic-midpoint smoothed — the fluid academic stroke;
 *   · colours arrive as TOKEN IDs resolved by the subject at draw time, so the
 *     same packet glows indigo in Mathematics and ember in Physics.
 *
 * Two consumers, one implementation:
 *   · src/components/live/academic-surface.tsx — the live working plane;
 *   · src/components/archive/canvas-replay.tsx — the archive's vector replay.
 */

import type { StrokeColorId, SurfacePoint } from "@/lib/livekit/surface-sync";

/** Colour-token CSS custom properties — the subject resolves them at draw time. */
export const STROKE_COLOR_TOKEN: Record<StrokeColorId, string> = {
  ivory: "--ta-ivory-200",
  slate: "--ta-slate-300",
  accent: "--ta-accent-1",
};

/** Fallbacks when no computed style is available (server / bare rehearsal). */
export const STROKE_COLOR_FALLBACK: Record<StrokeColorId, string> = {
  ivory: "#efebe3",
  slate: "#9aa4b0",
  accent: "#efebe3",
};

/**
 * Resolve the subject's stroke palette from an element's computed style.
 * Pure over the DOM read: same element, same tokens, same palette.
 */
export function readStrokePalette(el: Element | null): Record<StrokeColorId, string> {
  if (!el || typeof getComputedStyle !== "function") return STROKE_COLOR_FALLBACK;
  const cs = getComputedStyle(el);
  const read = (token: string, fallback: string) => cs.getPropertyValue(token).trim() || fallback;
  return {
    ivory: read(STROKE_COLOR_TOKEN.ivory, STROKE_COLOR_FALLBACK.ivory),
    slate: read(STROKE_COLOR_TOKEN.slate, STROKE_COLOR_FALLBACK.slate),
    accent: read(STROKE_COLOR_TOKEN.accent, read(STROKE_COLOR_TOKEN.ivory, STROKE_COLOR_FALLBACK.ivory)),
  };
}

/**
 * Quadratic-midpoint smoothing — the fluid line, drawn from normalized points.
 * `w`/`h` are the CSS-pixel box; points are 0..1 of that box; `color` is the
 * subject-resolved stroke colour.
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: readonly SurfacePoint[],
  w: number,
  h: number,
  width: number,
  color: string,
): void {
  if (points.length === 0) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const px = (p: SurfacePoint) => ({ x: p.x * w, y: p.y * h });
  if (points.length === 1) {
    const p = px(points[0]);
    ctx.fillStyle = color;
    ctx.arc(p.x, p.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const first = px(points[0]);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length - 1; i++) {
    const cur = px(points[i]);
    const next = px(points[i + 1]);
    ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + next.x) / 2, (cur.y + next.y) / 2);
  }
  const last = px(points[points.length - 1]);
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}
