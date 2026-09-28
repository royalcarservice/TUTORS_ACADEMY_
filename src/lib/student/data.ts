import { createClient } from "@/lib/supabase/server";

import { nextActionFor, type Candidate, type ProviderInput } from "@/lib/next-action";
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

/**
 * Everything the student shell needs, for the CURRENT user only. Both reads
 * go through the anon-key client, so RLS bounds them to auth.uid() — this
 * function cannot read another student even if asked to.
 */
export async function getStudentContext(): Promise<StudentContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const [{ data: enr }, { data: env }] = await Promise.all([
    supabase.from("enrolments").select("subject_id, status, enrolled_at").order("enrolled_at"),
    supabase.from("environment_state").select("subject_id, first_entered_at, last_entered_at, entry_count, position"),
  ]);
  const enrolments: Enrolment[] = (enr ?? []).map((r) => ({ subjectId: r.subject_id as SubjectId, status: r.status as Enrolment["status"], enrolledAt: r.enrolled_at }));
  const environmentStates: EnvironmentState[] = (env ?? []).map((r) => ({ subjectId: r.subject_id as SubjectId, firstEnteredAt: r.first_entered_at, lastEnteredAt: r.last_entered_at, entryCount: r.entry_count, position: r.position ?? null }));
  const state = deriveShellState(enrolments, environmentStates);
  const engine = nextActionFor(providerInputFor(enrolments, environmentStates, new Date().toISOString()));
  return { enrolments, environmentStates, state, candidate: engine.action, failedProviders: engine.failedProviders };
}

/**
 * Records a real entry into an environment (called by the environment route
 * once 5.5 wires it — NOT called anywhere yet). Upsert keyed on (student,
 * subject); `position` is never written here because nothing supplies one.
 */
export async function recordEnvironmentEntry(userId: string, subjectId: SubjectId): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "auth not configured" };
  const { data: existing } = await supabase.from("environment_state").select("entry_count").eq("student_id", userId).eq("subject_id", subjectId).maybeSingle();
  const now = new Date().toISOString();
  const { error } = existing
    ? await supabase.from("environment_state").update({ last_entered_at: now, entry_count: existing.entry_count + 1 }).eq("student_id", userId).eq("subject_id", subjectId)
    : await supabase.from("environment_state").insert({ student_id: userId, subject_id: subjectId, first_entered_at: now, last_entered_at: now, entry_count: 1 });
  return error ? { ok: false, error: error.message } : { ok: true };
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
  const { data } = await supabase.from("enrolments").select("subject_id").eq("status", "active");
  return new Set((data ?? []).map((r) => r.subject_id as string));
}
