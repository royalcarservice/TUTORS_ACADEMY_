/* ATTACK 2 (6.2 locked decision 3): render a RELATED student's OTHER subject
 * (one with no relationship) through the shell. Must NOT compile: a row
 * cannot be placed in a group whose subject the reader did not emit, and the
 * shell has no prop for enrolments at all. */
import { TutorShell } from "@/components/tutor/tutor-shell";
import { shellSubjectInfo } from "@/lib/student/subject-info";

declare const groupsFromReader: Parameters<typeof TutorShell>[0]["groups"];

// @ts-expect-error — no `enrolments` prop exists on the tutor shell (the student's does; this one cannot receive them).
void TutorShell({ state: { kind: "B-relationships-no-events", subjects: ["physics"] }, groups: groupsFromReader, subjects: shellSubjectInfo(), slots: [], enrolments: [{ subjectId: "mathematics" }] });

// @ts-expect-error — a row has no `subjectId` of its own: subject is the GROUP; a row cannot claim another subject.
void ({ studentId: "x", displayName: "y", subjectId: "mathematics" } satisfies (typeof groupsFromReader)[number]["rows"][number]);
