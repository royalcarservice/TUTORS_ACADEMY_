/* ATTACK 5 (6.3, P6-R2 amendment): put RECENCY into the view the surface
 * renders. EXPECT TS2353 — the view has no field for a date of behaviour. */
import type { RelationshipView } from "@/lib/tutor/relationship";

declare const view: RelationshipView;
// @ts-expect-error — 'lastEnteredAt' does not exist in type 'RelationshipView'
void ({ ...view, lastEnteredAt: "2026-10-01T00:00:00Z" } satisfies RelationshipView);
