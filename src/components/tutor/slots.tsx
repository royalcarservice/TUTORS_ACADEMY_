import type { ReactElement } from "react";

import type { TutorRegion } from "@/config/student-slots";
import { isolate, isolateAsync } from "@/lib/state/isolate";
import type { TutorContext } from "@/lib/tutor/data";

/* TUTOR SHELL — SLOT REGISTRY = THE EXTENSION CONTRACT (6.2), the same
 * contract as the student's (components/student/slots.tsx):
 *   1. `load(ctx)` receives ONLY the relationship-scoped TutorContext. It has
 *      no client of its own; anything it needs beyond the context must come
 *      through src/lib/tutor/data.ts, which can name two tables.
 *   2. NULL = absent: nothing renders, no heading, no box, no count.
 *   3. A loader or renderer that throws renders nothing and is logged (5.7).
 *   4. The id and region MUST exist in TUTOR_SLOTS (config/student-slots.ts).
 * Today the registry is EMPTY on purpose. */

export interface TutorSlotComponent<T = unknown> {
  region: TutorRegion;
  load: (ctx: TutorContext) => Promise<T | null>;
  render: (data: T) => ReactElement;
}

export const TUTOR_SLOT_COMPONENTS: Record<string, TutorSlotComponent> = {};

export interface ResolvedTutorSlot { id: string; region: TutorRegion; element: ReactElement }

export async function resolveTutorSlots(ctx: TutorContext): Promise<ResolvedTutorSlot[]> {
  const out: ResolvedTutorSlot[] = [];
  for (const [id, slot] of Object.entries(TUTOR_SLOT_COMPONENTS)) {
    const res = await isolateAsync(`slot:tutor:${id}`, () => slot.load(ctx));
    const data = res.ok ? res.value : null;
    if (data === null || data === undefined) continue;
    const el = isolate(`slot:tutor:${id}:render`, () => slot.render(data));
    if (el.ok) out.push({ id, region: slot.region, element: el.value });
  }
  return out;
}
