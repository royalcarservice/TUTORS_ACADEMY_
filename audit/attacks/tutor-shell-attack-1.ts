/* ATTACK 1 (6.2 locked decision 3): render a NON-RELATED student's name
 * through the tutor shell's own code path. Must NOT compile. */
import { getTutorContext } from "@/lib/tutor/data";

const STUDENT_B_ID = "00000000-0000-0000-0000-00000000000b";
// @ts-expect-error — the reader takes no student id: there is no parameter through which to ask for someone.
void getTutorContext(STUDENT_B_ID);
