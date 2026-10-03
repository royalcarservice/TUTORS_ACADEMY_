import { DataReadError } from "@/lib/state/read-error";
import type { SubjectId } from "@/lib/student/contract";
import { SUBJECTS } from "@/lib/subjects/subjects";
import { createClient } from "@/lib/supabase/server";

/* ════════════════════════════════════════════════════════════════════════
   THE RELATIONSHIP-SCOPED READER (Phase 6 · Step 2) — the tutor shell's ONLY
   data access. Everything a tutor's surface may render arrives through this
   module, and this module can name exactly two tables:

     public.relationships   WHERE tutor_id = me AND state = 'active'
     public.profiles        display_name of the students those rows name

   It cannot name enrolments, environment_state, auth.users, or any table a
   later phase adds. It takes NO student id, NO subject id, NO filter and NO
   sort argument from a caller: there is no parameter through which the shell
   could ask for a non-related student, another subject, or an ordering by
   anything a student did. Reach is the RLS policy (6.1); shape is this type.

   SHAPE (P6-R1 made structural): the result is SUBJECTS containing
   relationships. There is no top-level array of students — a flat, cross-
   subject list is not a view this type can express. (Locked decision 1.)

   A ROW is the student's display name and the subject. Nothing evaluative is
   read, so nothing evaluative can be rendered: no arc, no position, no
   entry, no recency, no count. (Locked decision 2; P6-R2 "arc position is
   permitted to a tutor" lands on the relationship's own surface, 6.3.)

   ORDER is fixed and non-evaluative: subjects in the 3.1 config order (the
   same order the whole product uses), rows by the student's display name
   (locale compare), ties by the opaque student id. Never by start date (a
   timeline is a proxy for "newest/oldest"), never by anything a student did.
   ════════════════════════════════════════════════════════════════════════ */

export interface RelationshipRow {
  /** Opaque; used as the React key and the tie-break. Never rendered. */
  studentId: string;
  displayName: string;
  /** 6.3: the relationship's own id — the address of its surface
   *  (/tutor/[subject]/[relationship]). An address of an ARRANGEMENT, never
   *  of a person: the URL cannot name a student. Never rendered as text. */
  relationshipId: string;
}

export interface SubjectGroup {
  subjectId: SubjectId;
  rows: RelationshipRow[];
}

/** The three shell states (mirrors 5.3). C is unreachable today: no events table exists (5.6). */
export type TutorShellState =
  | { kind: "A-no-relationships" }
  | { kind: "B-relationships-no-events"; subjects: SubjectId[] }
  | { kind: "C-relationships-and-events"; subjects: SubjectId[] };

export interface TutorContext {
  state: TutorShellState;
  /** Subjects that hold at least one active relationship, in config order. Never empty when state is B/C. */
  groups: SubjectGroup[];
}

/** The ONE sort. Pasted in the 6.2 report; demonstrated with a shuffled fixture on /dev/tutor-shell. */
export function orderRows(rows: readonly RelationshipRow[]): RelationshipRow[] {
  return [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }) || (a.studentId < b.studentId ? -1 : a.studentId > b.studentId ? 1 : 0));
}

/** Pure: raw relationship facts → the subject-grouped shape. Used by the reader and by the dev fixtures (the only way to build a context). */
export function groupBySubject(rels: ReadonlyArray<{ studentId: string; subjectId: string; relationshipId: string }>, names: ReadonlyMap<string, string>): TutorContext {
  const groups: SubjectGroup[] = [];
  for (const s of SUBJECTS) {
    const rows = rels.filter((r) => r.subjectId === s.id).map((r) => ({ studentId: r.studentId, displayName: names.get(r.studentId) ?? "", relationshipId: r.relationshipId }));
    if (rows.length > 0) groups.push({ subjectId: s.id as SubjectId, rows: orderRows(rows) });
  }
  const subjects = groups.map((g) => g.subjectId);
  const state: TutorShellState = groups.length === 0 ? { kind: "A-no-relationships" } : { kind: "B-relationships-no-events", subjects };
  return { state, groups };
}

/**
 * The CURRENT tutor's context. Reads through the anon-key client (RLS-bounded,
 * 6.1 policies) and states "mine" explicitly (`tutor_id = user.id`), as the
 * student reads do since the E-23 fix.
 * A failed read throws DataReadError (P5-R9): a failure is never rendered as
 * "no relationships".
 */
export async function getTutorContext(): Promise<TutorContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rels, error: relErr } = await supabase
    .from("relationships")
    .select("id, student_id, subject_id")
    .eq("tutor_id", user.id)
    .eq("state", "active");
  if (relErr) throw new DataReadError("relationships", relErr);

  const studentIds = Array.from(new Set((rels ?? []).map((r) => r.student_id as string)));
  const names = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: profiles, error: profErr } = await supabase.from("profiles").select("id, display_name").in("id", studentIds);
    if (profErr) throw new DataReadError("profiles", profErr);
    for (const p of profiles ?? []) names.set(p.id as string, (p.display_name as string) ?? "");
  }
  return groupBySubject((rels ?? []).map((r) => ({ studentId: r.student_id as string, subjectId: r.subject_id as string, relationshipId: r.id as string })), names);
}

/* ── 6.5 · P6-R19: THE RELATIONSHIP AS A DOOR ─────────────────────────────
   The subjects in which the signed-in tutor holds an ACTIVE relationship —
   nothing else: no student id, no name, no row. Read through the same
   session client and the same 6.1 policy as getTutorContext (a tutor sees
   only their own rows), projected to subject ids. Argument-free, like every
   reader here: there is no parameter through which a caller could ask about
   another tutor or another subject. Used by the environment route to admit a
   tutor to a draft room they shape (P6-R19) and to show the shaping link
   only where the write permission exists (P6-R17). A visitor or a student
   gets an empty set without a query. */
export async function getTutorSubjectIds(): Promise<Set<SubjectId>> {
  const supabase = await createClient();
  if (!supabase) return new Set();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await supabase.from("relationships").select("subject_id").eq("tutor_id", user.id).eq("state", "active");
  if (error) throw new DataReadError("relationships", error);
  return new Set((data ?? []).map((r) => r.subject_id as SubjectId));
}
