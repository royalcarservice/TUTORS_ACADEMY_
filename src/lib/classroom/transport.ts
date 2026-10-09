/* ════════════════════════════════════════════════════════════════════════
   CLASSROOM TRANSPORT — Phase 7 · Step 6 (DEC-028)

   What carries a ClassroomSignal from one participant to another. PURE —
   no clock, no I/O beyond the signals themselves, no React.

   ONE IMPLEMENTATION TODAY: the in-memory transport. A registry keyed by
   ROOM — every transport instance subscribed to the same room hears every
   signal sent there, the sender included (loopback: the local participant
   sees exactly what a remote one would). Signals addressed to another room
   never arrive: isolation is structural, not best-effort.

   THE LIVEKIT SEAM — named, not built. DEC-023 ruled: no livekit-client
   dependency, no speculative wiring — untestable integration refuses to
   ship. When credentials are staged the room is called "configured", and a
   wired transport takes this file's shape verbatim (the session data
   channel per docs/proposed/livekit_recon.md); until then the brief's
   resilience rule IS the behaviour: unconfigured, offline, or dropped —
   the room degrades to local working mode, no modal, no error loop.
   ════════════════════════════════════════════════════════════════════════ */

import type { LiveKitReadiness } from "@/lib/livekit/config";
import { validateSignal, type ClassroomSignal, type SignalVerdict } from "./types";

export type TransportMode = "memory" | "livekit-seam";

export interface ClassroomTransport {
  /** The room this transport is bound to — `{subject}:{session}`. */
  readonly room: string;
  /** Which carrier serves the room today. */
  readonly mode: TransportMode;
  /**
   * Speak into the room. The signal is validated FOR THIS ROOM first —
   * malformed or oversized signals are refused with their named defect and
   * never delivered. Returns the verdict so a caller may log, never guess.
   */
  signal: (signal: ClassroomSignal) => SignalVerdict;
  /** Hear the room. Returns the unsubscribe — departure is real. */
  subscribe: (receive: (signal: ClassroomSignal) => void) => () => void;
}

/* The registry: room name → the listeners standing in that room. Module
   scope by design — two transport instances for one room must hear each
   other, and nothing outside this module may reach the registry. */
const rooms = new Map<string, Set<(signal: ClassroomSignal) => void>>();

function listenersOf(room: string): Set<(signal: ClassroomSignal) => void> {
  let set = rooms.get(room);
  if (!set) {
    set = new Set();
    rooms.set(room, set);
  }
  return set;
}

/**
 * THE IN-MEMORY TRANSPORT — the whole carrier while no session bus exists.
 * Delivery is synchronous and total within the room, sender included;
 * nothing crosses rooms; unsubscribe removes the listener completely, so an
 * unmounted chamber leaves no zombie ears behind.
 */
export function createMemoryTransport(room: string): ClassroomTransport {
  return {
    room,
    mode: "memory",
    signal(input: ClassroomSignal): SignalVerdict {
      const verdict = validateSignal(input, room);
      if (!verdict.ok) return verdict;
      for (const receive of listenersOf(room)) receive(verdict.signal);
      return verdict;
    },
    subscribe(receive) {
      const set = listenersOf(room);
      set.add(receive);
      return () => {
        set.delete(receive);
        if (set.size === 0) rooms.delete(room);   // an empty room does not linger
      };
    },
  };
}

/**
 * Which transport serves the room. TODAY the answer is always the memory
 * carrier — the LiveKit branch is the seam DEC-023 named: it opens the day
 * a wiring step is ruled AND credentials are staged AND the carrier can be
 * tested; until then configured-or-not, the room works locally (the brief's
 * resilience rule), and nothing in this file pretends otherwise.
 */
export function chooseTransport(room: string, readiness: LiveKitReadiness): ClassroomTransport {
  void readiness;   // the seam reads it the day the carrier is wired
  return createMemoryTransport(room);
}
