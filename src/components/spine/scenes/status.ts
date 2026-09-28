/* ════════════════════════════════════════════════════════════════════════
   THE HONESTY TREATMENT — STATUS VOCABULARY (Phase 4 · Step 6 · Part 3)

   THREE STATES, IN VISITOR LANGUAGE, extending the 3.6 convention (mono
   label, hairline, never red, never smaller than the text it describes):

     live        "Live today"             — shipped and reachable now.
     foundation  "In foundation"          — the ground exists (an environment
                                            is built; work is under way) but
                                            the thing is not open yet. Same
                                            words Scenes 3 and 4 use for draft
                                            subjects.
     next        "Next · not built yet"   — not built; placed in order, never
                                            on a date. Same words the 4.1
                                            skeleton and the 3.6 shell use.

   RULES: the label is real text adjacent to what it describes, in the DOM
   order, server-rendered; it carries no icon, no colour meaning (state is
   in the words; the underline weight is decoration); nothing is scheduled
   — sequencing, not scheduling.

   DERIVED, NOT AUTHORED: a beat's state comes from the module registry
   statuses passed by the route (`planned` → next, `in-progress` →
   foundation, `live` → live). A beat that spans modules takes the least
   advanced. Flip a registry status and the page corrects itself.
   ════════════════════════════════════════════════════════════════════════ */

export type StatusState = "live" | "foundation" | "next";

export interface ModuleEntry {
  id: string;
  name: string;
  status: "planned" | "in-progress" | "live";
}

export const STATUS_LABEL: Record<StatusState, string> = {
  live: "Live today",
  foundation: "In foundation",
  next: "Next · not built yet",
};

export const STATUS_RULES = [
  "Live today — shipped and reachable now.",
  "In foundation — the ground exists; the thing itself is not open yet (draft subjects in Scenes 3–4; modules in progress here).",
  "Next · not built yet — not built; placed in order, never on a date.",
  "The label is text, adjacent, server-rendered, never an icon, never red, never smaller than the copy it describes.",
  "States are derived from the module registry; nothing here is hand-set.",
] as const;

const RANK: Record<StatusState, number> = { live: 2, foundation: 1, next: 0 };

export function stateOf(m: ModuleEntry | undefined): StatusState {
  if (!m) return "next";
  return m.status === "live" ? "live" : m.status === "in-progress" ? "foundation" : "next";
}

/** Least-advanced state across the modules a beat depends on. */
export function statusFor(modules: ModuleEntry[], ids: readonly string[]): StatusState {
  let s: StatusState = "live";
  for (const id of ids) {
    const st = stateOf(modules.find((m) => m.id === id));
    if (RANK[st] < RANK[s]) s = st;
  }
  return ids.length ? s : "next";
}
