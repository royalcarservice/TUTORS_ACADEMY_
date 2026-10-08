/**
 * PROGRESS RECORD DATA ACCESS — Phase 7 · Step 2 (server only).
 *
 * The first reader of public.progress_record (migration 0004). Scope: the
 * student's OWN rows — the only SELECT a student holds. A related tutor's
 * read exists in RLS but has no surface yet; nothing here anticipates it.
 *
 * Rows are mapped to the 5.6 ProgressEvent shape and handed to the pure
 * module (src/lib/progress) for interpretation. Malformed rows are NOT
 * dropped here: a present-but-wrong value is a defect the pure layer names,
 * never a silent absence (the 5.6 rule).
 */

import { DataReadError } from "@/lib/state/read-error";
import { createClient } from "@/lib/supabase/server";

import { EVENT_KINDS, type ProgressEvent, type ProgressEventKind } from "./events";

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

export { EVENT_KINDS };
