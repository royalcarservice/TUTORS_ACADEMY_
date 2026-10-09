"use client";

/* ════════════════════════════════════════════════════════════════════════
   SURFACE PALETTE — Phase 7 · Step 4 (DEC-025)

   The disciplined academic toolset — four tools and three colours, and
   NOTHING ELSE. No stickers, no stamps, no emoji, no reaction overlays:
   this is a drawing-and-notation surface (chalk, ink, graphite), not a
   corporate diagramming toy. Every control is a real button (keyboard:
   Tab / Enter / Space), toggles announce aria-pressed, and the vocabulary
   is the brief's, verbatim.

   THE INK WIDTHS (fine / medium) belong to the Ink tool — a quality of the
   pen, not a fifth tool. The Reset action clears the whole surface; the
   Eraser removes strokes where it passes (the surface decides which).
   ════════════════════════════════════════════════════════════════════════ */

import { Button } from "@/components/ui";

import type { StrokeColorId, SurfaceTool } from "@/lib/livekit/surface-sync";

export type InkWidth = "fine" | "medium";

export interface SurfacePaletteProps {
  tool: SurfaceTool;
  inkWidth: InkWidth;
  color: StrokeColorId;
  onTool: (tool: SurfaceTool) => void;
  onInkWidth: (width: InkWidth) => void;
  onColor: (color: StrokeColorId) => void;
  onReset: () => void;
}

const TOOLS: { id: SurfaceTool; label: string; title: string }[] = [
  { id: "ink", label: "Ink", title: "The ink pen — for notation and text" },
  { id: "line", label: "Line", title: "The straightedge — for constructions and vectors" },
  { id: "erase", label: "Eraser", title: "The eraser — removes the strokes it passes" },
];

const COLORS: { id: StrokeColorId; label: string; token: string; title: string }[] = [
  { id: "ivory", label: "Ivory", token: "var(--ta-ivory-200)", title: "Ivory ink — light on the dark substrate" },
  { id: "slate", label: "Slate", token: "var(--ta-slate-300)", title: "Muted slate — for secondary lines" },
  { id: "accent", label: "Accent", token: "var(--ta-accent-1)", title: "The subject's own accent" },
];

const CHIP: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

export function SurfacePalette({ tool, inkWidth, color, onTool, onInkWidth, onColor, onReset }: SurfacePaletteProps) {
  return (
    <div
      data-surface-palette
      role="group"
      aria-label="Surface tools"
      style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-3)", alignItems: "center" }}
    >
      {TOOLS.map((t) => (
        <Button
          key={t.id}
          variant={tool === t.id ? "primary" : "secondary"}
          size="sm"
          aria-pressed={tool === t.id}
          aria-label={`${t.label} tool${tool === t.id ? ", active" : ""}`}
          title={t.title}
          onClick={() => onTool(t.id)}
        >
          {t.label}
        </Button>
      ))}

      {/* Ink's widths — a quality of the pen, shown while the pen is held. */}
      {tool === "ink" && (
        <span role="group" aria-label="Ink width" style={{ display: "inline-flex", gap: "var(--ta-space-1)", ...CHIP }}>
          {(["fine", "medium"] as const).map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={inkWidth === w}
              aria-label={`Ink width ${w}${inkWidth === w ? ", active" : ""}`}
              title={w === "fine" ? "A fine line" : "A medium line"}
              onClick={() => onInkWidth(w)}
              style={{
                ...CHIP,
                padding: "var(--ta-space-1) var(--ta-space-2)",
                borderRadius: "var(--ta-radius-1)",
                border: "1px solid color-mix(in srgb, var(--ta-accent-1) 30%, transparent)",
                background: inkWidth === w ? "color-mix(in srgb, var(--ta-accent-1) 18%, transparent)" : "transparent",
                color: inkWidth === w ? "var(--ta-text-primary)" : "var(--ta-text-muted)",
                cursor: "pointer",
              }}
            >
              {w}
            </button>
          ))}
        </span>
      )}

      <span aria-hidden="true" style={{ width: "1px", alignSelf: "stretch", background: "var(--ta-border-subtle)" }} />

      {/* Three restrained colours — token ids, never a picker. */}
      <span role="group" aria-label="Stroke colour" style={{ display: "inline-flex", gap: "var(--ta-space-2)" }}>
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={color === c.id}
            aria-label={`${c.label} stroke colour${color === c.id ? ", active" : ""}`}
            title={c.title}
            onClick={() => onColor(c.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--ta-space-1)",
              padding: "var(--ta-space-1) var(--ta-space-2)",
              borderRadius: "var(--ta-radius-1)",
              border: color === c.id ? "1px solid var(--ta-accent-1)" : "1px solid var(--ta-border-subtle)",
              background: "transparent",
              color: "var(--ta-text-secondary)",
              cursor: "pointer",
              ...CHIP,
            }}
          >
            <span aria-hidden="true" style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: c.token, border: "1px solid color-mix(in srgb, var(--ta-ink-950) 40%, transparent)" }} />
            {c.label}
          </button>
        ))}
      </span>

      <span aria-hidden="true" style={{ width: "1px", alignSelf: "stretch", background: "var(--ta-border-subtle)" }} />

      <Button
        variant="danger"
        size="sm"
        aria-label="Reset the surface — clears every stroke"
        title="Clear the whole surface"
        onClick={onReset}
      >
        Reset
      </Button>
    </div>
  );
}
