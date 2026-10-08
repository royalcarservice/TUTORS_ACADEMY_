/* ════════════════════════════════════════════════════════════════════════
   THE BOARD RECORD READER — Phase 8 · Step 3 (DEC-031)

   One stroke vocabulary for the whole house: a saved board record is read
   back through surface-sync's OWN validatePacket and applyPacket — never a
   second parser, never a second set of tools or colours. What the chamber
   synchronized is what the archive stands.

   The record may be stored as either:
   · an array of stroke packets { id, tool, points, color, width }; or
   · a full operation log { type: "stroke" | "remove" | "clear", … }.
   Both shapes are the protocol's own shapes; anything else is refused.
   Refusal is total: one malformed entry refuses the record — a partial
   board would be a fabrication, and the viewer says so in one calm
   sentence instead.

   The strokes are rebuilt through applyPacket, so idempotence and removal
   order reproduce EXACTLY the board as it stood when the session concluded.
   ════════════════════════════════════════════════════════════════════════ */

import {
  applyPacket,
  initialSurfaceState,
  validatePacket,
  type StrokePacket,
  type SurfacePacket,
  type SurfaceState,
} from "@/lib/livekit/surface-sync";

/** Parse unknown JSON into the strokes a board record preserves — or null. */
export function parseBoardRecord(value: unknown): StrokePacket[] | null {
  if (!Array.isArray(value)) return null;
  let state: SurfaceState = initialSurfaceState();
  for (const entry of value) {
    const packet = readEntry(entry);
    if (!packet) return null; // one bad entry refuses the whole record
    state = applyPacket(state, packet);
  }
  return [...state.strokes];
}

/** One entry → one protocol packet. The entry's own `type` field decides. */
function readEntry(entry: unknown): SurfacePacket | null {
  if (typeof entry === "object" && entry !== null && "type" in entry) {
    const verdict = validatePacket(entry);
    return verdict.ok ? verdict.packet : null;
  }
  /* A bare stroke object — the shape the brief names. */
  const verdict = validatePacket({ type: "stroke", stroke: entry });
  return verdict.ok ? verdict.packet : null;
}
