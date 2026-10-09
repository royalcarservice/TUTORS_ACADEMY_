/**
 * PROGRESS RECORD DATA ACCESS — Phase 7 · Step 2 (server only); the
 * milestone synthesis reader joins in Phase 8 · Step 4 (DEC-032).
 *
 * The first reader of public.progress_record (migration 0004). Scope: the
 * student's OWN rows — the only SELECT a student holds. The related tutor's
 * read, long present in RLS, gained its surface with the synthesis: the
 * relationship's record region names the student whose record it reads.
 *
 * Rows are mapped to the 5.6 ProgressEvent shape and handed to the pure
 * module (src/lib/progress) for interpretation. Malformed rows are NOT
 * dropped here: a present-but-wrong value is a defect the pure layer names,
 * never a silent absence (the 5.6 rule).
 *
 * THE SYNTHESIS READER (DEC-032) — fetchSubjectMilestonesWithArtifacts
 * spells BOTH the subject and the student whose record is meant (the 6.1
 * rule: never assumed), then lets RLS decide whether the viewer may read
 * it: a student's own policy admits their own rows, the related-tutor
 * policy admits the subject of an active relationship, and nothing else
 * returns anything. The second argument is the record's SUBJECT — never
 * the viewer's identity, which rides the cookie session alone.
 */

import { liveModuleIds } from "@/components/student/environment-regions";
import { DataReadError } from "@/lib/state/read-error";
import { createClient } from "@/lib/supabase/server";

import { EVENT_KINDS, type ProgressEvent, type ProgressEventKind } from "./events";
import { composeMilestoneRecord, type MilestoneEntry, type SessionFact } from "./synthesis";

/**
 * The student's own events — for ONE subject when `subjectId` is given, else
 * across subjects (the next-action engine reads the whole record) — oldest
 * first, id tie-break (the 5.6 ordering rule). Throws DataReadError on a
 * failed read (5.7); the calling surface isolates the throw and renders as
 * if the record were silent — never as if it were empty on purpose.
 */
export async function getOwnProgressEvents(subjectId?: string): Promise<ProgressEvent[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase
    .from("progress_record")
    .select("id, subject_id, kind, at, ref_id")
    .eq("student_id", user.id);           // "mine" spelled (6.1), RLS re-checks
  if (subjectId) query = query.eq("subject_id", subjectId);
  const { data, error } = await query
    .order("at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new DataReadError("progress_record", error);
  return (data ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    // An unknown kind survives as a string here so validateEvents can name it
    // as a defect; the cast is bounded by the check at the interpreting edge.
    kind: row.kind as ProgressEventKind,
    at: row.at,
    refId: row.ref_id,
  })).filter((e) => typeof e.id === "string" && typeof e.at === "string") as ProgressEvent[];
}

/**
 * THE MILESTONE SYNTHESIS — one student's record in one subject, joined to
 * what those sessions left behind (DEC-032). Three RLS-bounded reads, every
 * one spelling the subject it means:
 *   · the student's progress facts in the subject (0004's policies);
 *   · the sessions those facts name, for their titles (0007's policies);
 *   · the artifacts preserved from those sessions (0008's policies).
 * The join is the pure composer's (synthesis.ts); a session the boundary
 * withholds still leaves its fact standing — title null, artifacts absent.
 * No identity → no record; a failed read THROWS DataReadError (5.7).
 */
export async function fetchSubjectMilestonesWithArtifacts(subjectId: string, studentId: string): Promise<MilestoneEntry[]> {
  const supabase = await createClient();
  if (!supabase) return []; // no identity, no record — the honest empty
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  if (typeof subjectId !== "string" || subjectId.length === 0 || typeof studentId !== "string" || studentId.length === 0) return [];

  const { data: rows, error } = await supabase
    .from("progress_record")
    .select("id, subject_id, kind, at, ref_id")
    .eq("student_id", studentId)            // whose record is meant — spelled
    .eq("subject_id", subjectId)            // which environment — spelled
    .order("at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new DataReadError("progress_record", error);
  const events = ((rows ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    kind: row.kind as ProgressEventKind,
    at: row.at,
    refId: row.ref_id,
  })).filter((e) => typeof e.id === "string" && typeof e.at === "string") as ProgressEvent[]);
  if (events.length === 0) return [];

  /* The sessions the facts name — titles only, the boundary deciding all. */
  const refIds = Array.from(new Set(events.map((e) => e.refId)));
  const { data: sessionRows, error: sessionError } = await supabase
    .from("cohort_sessions")
    .select("id, title")
    .eq("subject_id", subjectId)
    .in("id", refIds);
  if (sessionError) throw new DataReadError("cohort_sessions", sessionError);

  /* The artifacts those sessions preserved — the substantiation. */
  const { data: artifactRows, error: artifactError } = await supabase
    .from("session_artifacts")
    .select("id, session_id, artifact_type, metadata, created_at")
    .eq("subject_id", subjectId)
    .in("session_id", refIds)
    .order("created_at", { ascending: true });
  if (artifactError) throw new DataReadError("session_artifacts", artifactError);

  const titles = new Map<string, string | null>((sessionRows ?? []).map((r) => [r.id as string, (r.title as string | null) ?? null]));
  const bySession = new Map<string, SessionFact>();
  for (const id of refIds) {
    bySession.set(id, { sessionId: id, title: titles.has(id) ? titles.get(id) ?? null : null, artifacts: [] });
  }
  for (const a of artifactRows ?? []) {
    const fact = bySession.get(a.session_id as string);
    if (!fact) continue; // an artifact of a session no fact names: unreadable join, never a guess
    const metadata = a.metadata !== null && typeof a.metadata === "object" && !Array.isArray(a.metadata) ? (a.metadata as Record<string, unknown>) : {};
    fact.artifacts = [...fact.artifacts, { id: a.id as string, type: a.artifact_type as string, metadata, createdAt: a.created_at as string }];
  }

  /* The registry gate: the arc's own rule — a kind is spoken of only while
     the module owning its referent is live. The chronology obeys it too. */
  return composeMilestoneRecord(events, subjectId as import("@/lib/student/contract").SubjectId, liveModuleIds(), [...bySession.values()]);
}

export { EVENT_KINDS };
