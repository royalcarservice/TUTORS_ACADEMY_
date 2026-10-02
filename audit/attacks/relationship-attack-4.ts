/* ATTACK 4 (6.3, P6-R7): read a relationship WITHOUT a subject — the cross-
 * subject view. EXPECT TS2345 — subjectId is required; and a subject outside
 * the closed enum. EXPECT TS2322. */
import { getRelationshipView } from "@/lib/tutor/relationship";

// @ts-expect-error — Property 'subjectId' is missing in type
void getRelationshipView({ relationshipId: "x" });
// @ts-expect-error — Type '"all"' is not assignable to type 'SubjectId'
void getRelationshipView({ subjectId: "all", relationshipId: "x" });
