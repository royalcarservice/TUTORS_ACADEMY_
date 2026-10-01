import { DataReadError } from "@/lib/state/read-error";
import { createClient } from "@/lib/supabase/server";

import { nextActionFor, type Candidate, type ProviderInput } from "@/lib/next-action";
import type { EnvironmentFacts } from "@/lib/progress";
import { SUBJECTS } from "@/lib/subjects/subjects";

import { deriveShellState, type Enrolment, type EnvironmentState, type ShellState, type SubjectId } from "./contract";

export interface StudentContext {
  enrolments: Enrolment[];
  environmentStates: EnvironmentState[];
  state: ShellState;
  /** The engine's one answer for this student, resolved once per request. */
  candidate: Candidate;
  /** Provider ids that threw this request (isolated; the answer still resolved). */
  failedProviders: string[];
}

/** Everything the engine is allowed to know, assembled ONCE per request. The clock is read here and nowhere below. */
export function providerInputFor(enrolments: readonly Enrolment[], environmentStates: readonly EnvironmentState[], now: string): ProviderInput {
  return {
    enrolments,
    environmentStates,
    subjects: SUBJECTS.map((s) => ({ id: s.id as SubjectId, name: s.name, environmentName: s.tagline.split(" — ")[0].trim() })),
    now,
    hrefs: { subject: (id) => `/subjects/${id}`, choose: "/subjects" },
  };
}

export { DataReadError };

/**
 * Everything the student shell needs, for the CURRENT user only. Both reads
 * go through the anon-key client, so RLS bounds them — and, since 6.1, the
 * query SAYS "mine" (`student_id = user.id`) instead of relying on RLS to mean
 * it: a related tutor's policy now admits other rows through the same client,
 * and "my enrolments" must not silently become "every enrolment I may read".
 * RLS stays the boundary (it still refuses anyone else's rows); the predicate
 * states the question. (Post-6.1 defect, found by the E-23 check.)
 */
export async function getStudentContext(): Promise<StudentContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: enr, error: enrErr }, { data: env, error: envErr }] = await Promise.all([
    supabase.from("enrolments").select("subject_id, status, enrolled_at").eq("student_id", user.id).order("enrolled_at"),
    supabase.from("environment_state").select("subject_id, first_entered_at, last_entered_at, entry_count, position").eq("student_id", user.id),
  ]);
  /* 5.7 (P5-R8.1/9): a failed read is NOT an empty read. Rendering state A
     ("no enrolments") from a database error would be a claim we cannot make;
     the primary answer needs BOTH rows truthfully, so the page fails honestly
     (root error boundary) rather than answering wrongly. */
  if (enrErr) throw new DataReadError("enrolments", enrErr);
  if (envErr) throw new DataReadError("environment_state", envErr);
  const enrolments: Enrolment[] = (enr ?? []).map((r) => ({ subjectId: r.subject_id as SubjectId, status: r.status as Enrolment["status"], enrolledAt: r.enrolled_at }));
  const environmentStates: EnvironmentState[] = (env ?? []).map((r) => ({ subjectId: r.subject_id as SubjectId, firstEnteredAt: r.first_entered_at, lastEnteredAt: r.last_entered_at, entryCount: r.entry_count, position: r.position ?? null }));
  const state = deriveShellState(enrolments, environmentStates);
  const engine = nextActionFor(providerInputFor(enrolments, environmentStates, new Date().toISOString()));
  return { enrolments, environmentStates, state, candidate: engine.action, failedProviders: engine.failedProviders };
}

/**
 * Records a real entry into an environment. Called ONLY by
 * POST /subjects/[subject]/enter (5.5) — never by a page render. Keyed on
 * (student, subject); `position` is never written because nothing supplies
 * one; `entry_count` is bookkeeping that no surface renders (P5-R2).
 */
export async function recordEnvironmentEntry(userId: string, subjectId: SubjectId): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "auth not configured" };
  const { data: existing, error: readError } = await supabase.from("environment_state").select("entry_count").eq("student_id", userId).eq("subject_id", subjectId).maybeSingle();
  // P5-R9: a failed read is not "no row yet" — it must not choose the INSERT branch. Refuse the write; the caller logs and the GET shows the truth.
  if (readError) return { ok: false, error: `read:${readError.code ?? "?"}` };
  const now = new Date().toISOString();
  const { error } = existing
    ? await supabase.from("environment_state").update({ last_entered_at: now, entry_count: existing.entry_count + 1 }).eq("student_id", userId).eq("subject_id", subjectId)
    : await supabase.from("environment_state").insert({ student_id: userId, subject_id: subjectId, first_entered_at: now, last_entered_at: now, entry_count: 1 });
  return error ? { ok: false, error: error.code ?? "write failed" } : { ok: true }; // 5.7: the code, never the message (it is only ever logged)
}

/**
 * Subject ids the CURRENT identity is actively enrolled in — empty when
 * there is no identity. Used by the environment route's draft guard (5.3
 * decision: enrolment is a stronger relationship than public availability,
 * so an enrolled student is never locked out of their own draft environment;
 * the draft status is labelled there, not enforced).
 */
export async function getEnrolledSubjectIds(): Promise<Set<string>> {
  const supabase = await createClient();
  if (!supabase) return new Set();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  // 6.1: "mine" stated, not assumed (a related tutor may read a student's enrolment row through this client).
  const { data, error } = await supabase.from("enrolments").select("subject_id").eq("student_id", user.id).eq("status", "active");
  // 5.7: a failed read must not become "not enrolled" — that would 404 a student's own draft environment or offer Begin to someone already enrolled.
  if (error) throw new DataReadError("enrolments", error);
  return new Set((data ?? []).map((r) => r.subject_id as string));
}

/**
 * 5.6: the facts the arc region stands on, for the CURRENT identity and ONE
 * environment. Reads through the anon client (RLS-bounded). `firstEnteredAt`
 * is null when there is no environment_state row — MISSING, a state; a
 * present-but-malformed value is passed through so the pure module can
 * report it as a defect rather than silently treating it as missing.
 * Reads nothing else: no counts, no events (there is no event table).
 */
export async function getEnvironmentFacts(subjectId: SubjectId, enrolled: boolean): Promise<EnvironmentFacts> {
  const supabase = await createClient();
  if (!supabase) return { subjectId, hasAccount: false, enrolled, firstEnteredAt: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { subjectId, hasAccount: false, enrolled, firstEnteredAt: null };
  // 6.1: "mine" stated — a related tutor may read another row for this subject through this client.
  const { data, error } = await supabase.from("environment_state").select("first_entered_at").eq("student_id", user.id).eq("subject_id", subjectId).maybeSingle();
  // 5.7: a failed read is not "never entered". The caller (a SUPPLEMENTAL region) isolates this throw: silence + log.
  if (error) throw new DataReadError("environment_state", error);
  return { subjectId, hasAccount: true, enrolled, firstEnteredAt: data?.first_entered_at ?? null };
}
