/* ATTACK 3 (6.3, P6-R7): address the relationship reader with a STUDENT id.
 * EXPECT TS2353 — the address type has no field that can name a person. */
import { getRelationshipView } from "@/lib/tutor/relationship";

const STUDENT_B_ID = "00000000-0000-0000-0000-00000000000b";
// @ts-expect-error — 'studentId' does not exist in type 'RelationshipAddress'
void getRelationshipView({ subjectId: "physics", relationshipId: "x", studentId: STUDENT_B_ID });
