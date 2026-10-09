"use client";

/* ════════════════════════════════════════════════════════════════════════
   ROOM LAYOUT — Phase 7 · Step 4 (DEC-025)

   Composes the chamber's two working planes: the participant pane (tiles,
   controls) and the shared academic surface. RESPONSIVE BY CONSTRUCTION:

     · desktop-class widths → SPLIT PANE: the chamber keeps a quiet column,
       the surface takes the remaining width;
     · small widths → ONE PLANE AT A TIME, chosen by two real buttons
       (Chamber / Surface) — a toggle, not a router, keyboard-reachable,
       aria-pressed, no animation beyond what the motion contract allows.

   The decision comes from matchMedia, observed live: a resized window moves
   between the two compositions without a reload. Until the first
   measurement the panes stack (the safe rendering), so nothing jumps
   incorrectly on first paint.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";

const SPLIT_QUERY = "(min-width: 900px)";

export function RoomLayout({
  chamber,
  surface,
}: {
  /** The participant pane — tiles, controls, state language. */
  chamber: React.ReactNode;
  /** The shared academic surface — canvas, palette. */
  surface: React.ReactNode;
}) {
  const [wide, setWide] = useState<boolean | null>(null);
  const [pane, setPane] = useState<"chamber" | "surface">("surface");

  useEffect(() => {
    if (typeof matchMedia !== "function") { setWide(false); return; }
    const mq = matchMedia(SPLIT_QUERY);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  if (wide === true) {
    return (
      <div data-room-layout="split" style={{ display: "grid", gridTemplateColumns: "minmax(16rem, 22rem) 1fr", gap: "var(--ta-space-6)", alignItems: "start" }}>
        <div data-room-pane="chamber">{chamber}</div>
        <div data-room-pane="surface">{surface}</div>
      </div>
    );
  }

  return (
    <div data-room-layout="panes" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-4)" }}>
      <div role="group" aria-label="Room planes" style={{ display: "flex", gap: "var(--ta-space-2)" }}>
        {([["chamber", "Chamber"], ["surface", "Surface"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={pane === id}
            aria-label={`Show the ${label.toLowerCase()}${pane === id ? ", active" : ""}`}
            onClick={() => setPane(id)}
            style={{
              fontFamily: "var(--ta-font-mono)",
              fontSize: "var(--ta-text-2xs)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "var(--ta-space-1) var(--ta-space-3)",
              borderRadius: "var(--ta-radius-1)",
              border: pane === id ? "1px solid var(--ta-accent-1)" : "1px solid var(--ta-border-subtle)",
              background: pane === id ? "color-mix(in srgb, var(--ta-accent-1) 14%, transparent)" : "transparent",
              color: pane === id ? "var(--ta-text-primary)" : "var(--ta-text-muted)",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {pane === "chamber" ? <div data-room-pane="chamber">{chamber}</div> : <div data-room-pane="surface">{surface}</div>}
    </div>
  );
}
