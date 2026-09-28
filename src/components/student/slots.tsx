import type { ReactElement } from "react";

import type { StudentSlotRegion } from "@/config/student-slots";
import type { StudentContext } from "@/lib/student/data";

/* STUDENT SHELL — SLOT REGISTRY = THE EXTENSION CONTRACT (Phase 5 · Step 3)
 *
 * A later phase populates a slot by adding ONE entry here. The shell file
 * (`student-shell.tsx`) is never edited for features. The contract:
 *
 *   1. `load(ctx)` runs on the server with the CURRENT student's context and
 *      the RLS-bounded client. It returns real data or NULL.
 *   2. NULL means the slot is ABSENT: nothing renders, no heading, no box. A
 *      region whose slots are all null is omitted from the DOM.
 *   3. `render(data)` returns a server-renderable element. No skeletons, no
 *      shimmer, no "coming soon" — if the data is not there, return null from
 *      `load` instead.
 *   4. The slot's id and region MUST exist in `src/config/student-slots.ts`
 *      (the written map); `resolveSlots` ignores unknown ids and reports them
 *      in development.
 *
 * Today the registry is EMPTY on purpose: no capability beyond identity,
 * enrolments and environment state exists, so nothing here may render.      */

export interface StudentSlotComponent<T = unknown> {
  region: StudentSlotRegion;
  load: (ctx: StudentContext) => Promise<T | null>;
  render: (data: T) => ReactElement;
}

export const STUDENT_SLOT_COMPONENTS: Record<string, StudentSlotComponent> = {};

/** A slot that resolved to real data. The shell renders ONLY these. */
export interface ResolvedSlot {
  id: string;
  region: StudentSlotRegion;
  element: ReactElement;
}

export async function resolveSlots(ctx: StudentContext): Promise<ResolvedSlot[]> {
  const out: ResolvedSlot[] = [];
  for (const [id, slot] of Object.entries(STUDENT_SLOT_COMPONENTS)) {
    const data = await slot.load(ctx);
    if (data === null || data === undefined) continue;
    out.push({ id, region: slot.region, element: slot.render(data) });
  }
  return out;
}
