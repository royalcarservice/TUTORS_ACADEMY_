import { liveModuleIds } from "@/components/student/environment-regions";
import { arcPosition, type ArcPosition, type EnvironmentFacts } from "@/lib/progress";
import { DataReadError } from "@/lib/state/read-error";
import type { SubjectId } from "@/lib/student/contract";
import { createClient } from "@/lib/supabase/server";

/* ════════════════════════════════════════════════════════════════════════
   THE RELATIONSHIP'S READER (Phase 6 · Step 3) — the second and last read
   path of the tutor's side, built on the 6.2 pattern (src/lib/tutor/data.ts)
   and gated the same way (P6-R7: audit/attacks/*.ts must keep failing tsc).

   THE ARGUMENT IS AN ADDRESS OF AN ARRANGEMENT, NEVER OF A PERSON.
   `RelationshipAddress` = { subjectId, relationshipId }. There is no field
   through which a caller could name a student, and no call without a subject:
   the cross-subject view is unrepresentable in the type as it is in the URL.

   RESOLUTION is one query answered by the 6.1 predicate's data:
     relationships WHERE id = :relationship AND tutor_id = me
                     AND subject_id = :subject AND state = 'active'
   Zero rows → null. Never-related, ended and nonexistent are ONE code path
   with ONE result (P6-R9): the surface cannot confirm or deny that a person
   exists. A malformed id is null too — never a database error, which would
   be a distinguishable response.

   WHAT IT READS for the one related student, in the one subject (6.1 §2, the
   permitted column): profiles.display_name · enrolments (active?) ·
   environment_state.first_entered_at. Four tables, every row admitted by an
   RLS policy gated on the active relationship.

   WHAT IT DOES NOT READ, BY RULING (P6-R2 amendment): last_entered_at,
   entry_count, any timestamp of behaviour. Position is a state of the
   learning; recency is a measure of the person. The column list below is
   the enforcement: `select("first_entered_at")` — the arc's "entered" step
   is the only use of a date, and it is a state, not a measure.
   ════════════════════════════════════════════════════════════════════════ */

export interface RelationshipAddress {
  subjectId: SubjectId;
  relationshipId: string;
}

export interface RelationshipView {
  subjectId: SubjectId;
  displayName: string;
  /** The arc: the same seven steps as Scene 7 and the student's region, computed by the same function. */
  position: ArcPosition;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Pure: facts → the view's position. Shared with the dev fixtures so a fixture cannot take a path production cannot. */
export function positionFor(facts: EnvironmentFacts): ArcPosition {
  return arcPosition(facts, [], liveModuleIds());
}

/**
 * null = no such relationship FOR THIS TUTOR IN THIS SUBJECT (whatever the reason).
 * Throws DataReadError on a failed read (P5-R9: a failure is never "nobody here").
 */
export async function getRelationshipView(address: RelationshipAddress): Promise<RelationshipView | null> {
  if (!UUID.test(address.relationshipId)) return null;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rel, error: relErr } = await supabase
    .from("relationships")
    .select("student_id")
    .eq("id", address.relationshipId)
    .eq("tutor_id", user.id)
    .eq("subject_id", address.subjectId)
    .eq("state", "active")
    .maybeSingle();
  if (relErr) throw new DataReadError("relationships", relErr);
  if (!rel) return null;
  const studentId = rel.student_id as string;

  const { data: profile, error: profErr } = await supabase.from("profiles").select("display_name").eq("id", studentId).maybeSingle();
  if (profErr) throw new DataReadError("profiles", profErr);
  const { data: enr, error: enrErr } = await supabase.from("enrolments").select("status").eq("student_id", studentId).eq("subject_id", address.subjectId).eq("status", "active").maybeSingle();
  if (enrErr) throw new DataReadError("enrolments", enrErr);
  const { data: env, error: envErr } = await supabase.from("environment_state").select("first_entered_at").eq("student_id", studentId).eq("subject_id", address.subjectId).maybeSingle();
  if (envErr) throw new DataReadError("environment_state", envErr);

  const facts: EnvironmentFacts = { subjectId: address.subjectId, hasAccount: true, enrolled: !!enr, firstEnteredAt: (env?.first_entered_at as string | null) ?? null };
  return { subjectId: address.subjectId, displayName: (profile?.display_name as string) ?? "", position: positionFor(facts) };
}
