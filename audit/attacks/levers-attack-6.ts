/* ATTACK 6 (6.4, P6-R10): WRITE environment settings FOR A STUDENT. The
 * writer's address is { subjectId } and nothing else — there is no slot for
 * a student, so a per-student environment cannot be expressed, let alone
 * stored (the DDL has no student column either; see rls_test 6.4).
 * EXPECT TS2353 — 'studentId' does not exist in type 'ShapeAddress'.
 * EXPECT TS2353 — the same for an unauthored lever value smuggled as a field. */
import type { EnvironmentLevers } from "@/lib/environment/levers";
import { shapeEnvironment } from "@/lib/environment/shape";

declare const client: Parameters<typeof shapeEnvironment>[0];
declare const levers: EnvironmentLevers;
declare const studentId: string;

// @ts-expect-error — 'studentId' does not exist in type 'ShapeAddress'
void shapeEnvironment(client, { subjectId: "physics", studentId }, levers, "tutor-id");

// @ts-expect-error — 'accent' does not exist in type 'EnvironmentLevers' (identity is not a lever)
void shapeEnvironment(client, { subjectId: "physics" }, { ...levers, accent: "#b08d57" } satisfies EnvironmentLevers, "tutor-id");
