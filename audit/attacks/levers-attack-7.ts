/* ATTACK 7 (6.4, P6-R10): READ environment settings SCOPED TO A STUDENT, or
 * ask the shell to render a student's environment. The reader takes ONE
 * SubjectId positional argument; the shell's `levers` prop has no reader
 * field. Rendering "settings for a student" is unrepresentable.
 * EXPECT TS2345 — a student object is not a SubjectId.
 * EXPECT TS2554 — a second (student) argument does not exist.
 * EXPECT TS2353 — 'studentId' does not exist in the shell's levers prop. */
import { getEnvironmentSettings } from "@/lib/environment/settings";
import type { SubjectShell } from "@/components/shell/subject-shell";

declare const student: { id: string; subjectId: "physics" };

// @ts-expect-error — Argument of type '{ id: string; subjectId: "physics" }' is not assignable to parameter of type 'SubjectId'
void getEnvironmentSettings(student);

// @ts-expect-error — Expected 1 arguments, but got 2
void getEnvironmentSettings("physics", student.id);

type Levers = NonNullable<Parameters<typeof SubjectShell>[0]["levers"]>;
// @ts-expect-error — 'studentId' does not exist in type Levers
void ({ density: "dense", motionChar: "energetic", source: "shaped", studentId: student.id } satisfies Levers);
