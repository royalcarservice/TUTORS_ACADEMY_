"use client";

/* ════════════════════════════════════════════════════════════════════════
   PARTICIPANT DOCK — Phase 7 · Milestone 3 (DEC-026)

   The restrained strip where participant tiles stand — the dock the brief
   names for the chamber's bottom edge. It is deliberately ONLY a container:
   it owns no media, no state, no presence logic. Tiles are facts the room
   hands it; the dock arranges them, labels the group, and stays out of the
   way. One implementation for every composition: the production room and
   the rehearsal room both dock their tiles here.
   ════════════════════════════════════════════════════════════════════════ */

export function ParticipantDock({
  children,
  label = "Participants",
}: {
  /** The participant tiles — the room's facts, rendered by room-participant. */
  children: React.ReactNode;
  /** The group's accessible name. */
  label?: string;
}) {
  return (
    <section
      data-participant-dock
      aria-label={label}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "var(--ta-space-3)", maxWidth: "48rem" }}
    >
      {children}
    </section>
  );
}
