import { createClient as createAnonClient } from "@supabase/supabase-js";

import { authoredLevers, isDensity, isMotionChar, type EnvironmentLevers } from "@/lib/environment/levers";
import { DataReadError } from "@/lib/state/read-error";
import { errorClassOf, logFailure } from "@/lib/state/log";
import type { SubjectId } from "@/lib/student/contract";
import { publicSupabaseEnv } from "@/lib/supabase/env";

/* ════════════════════════════════════════════════════════════════════════
   THE SETTINGS READ (Phase 6 · Step 4 · Part 2)

   The environment reads ONE row by the subject's id, with the ANON key and NO
   COOKIES: the settings are public design config (RLS: select to anon) and
   the environment must be the same bytes for every reader class (P6-R10) —
   so the read does not even know who is asking. One round trip. The page
   runs it in parallel with the identity read, so the wall-clock cost for a
   signed-in reader is the longer of the two, not the sum.

   ┌─────────────────────────────────────────────────────────────────────┐
   │ ABSENCE = THE AUTHORED DEFAULT, AND THAT IS NOT AN INFERENCE.         │
   │ No row for a subject means "as authored in src/lib/subjects/subjects. │
   │ ts" — a real value that exists BY DESIGN (P6-R12). Contrast P5-R6's   │
   │ never-emit-a-zero: there a missing row means "we do not know" and    │
   │ nothing may be rendered in its place. Here the default is not a     │
   │ guess about the world; it is the design, and the row is a departure │
   │ from it. This is the ONE read site in the product where a missing   │
   │ row legitimately yields a value. Do not generalise it.              │
   └─────────────────────────────────────────────────────────────────────┘

   A FAILED READ IS NOT "NO ENVIRONMENT". If the read fails, the room renders
   the AUTHORED DEFAULT and one log line records the failure class — the
   room is design config, and the design has a value without the database.
   A broken room would punish every student in the subject for a transient
   fault in a table that holds two words. (Rule stated here and in
   docs/TUTOR_VISIBILITY.md; test 23.) The failure is still logged as a
   failure, never silently equal to "as authored" in the system's own record.
   ════════════════════════════════════════════════════════════════════════ */

export interface EnvironmentSettingsView {
  subjectId: SubjectId;
  levers: EnvironmentLevers;
  /** The authored default for this subject (so a surface can say "as authored" and offer the revert). */
  authored: EnvironmentLevers;
  /** True when a settings row exists; false means the room is as authored. */
  shaped: boolean;
  /** The tutor who last shaped it (their own action on design config — nothing about a student), or null when as authored. */
  shapedBy: string | null;
  /** Source of the levers: "row" · "authored" · "authored-after-failed-read" (the last is logged). */
  source: "row" | "authored" | "authored-after-failed-read";
}

interface Row { subject_id: string; density: string; motion_char: string; shaped_by: string; updated_at: string }

/** The one reader. Takes a SubjectId and nothing else — a student-scoped read is unrepresentable (attack 7). */
export async function getEnvironmentSettings(subjectId: SubjectId): Promise<EnvironmentSettingsView> {
  const authored = authoredLevers(subjectId);
  const env = publicSupabaseEnv();
  if (!env) return { subjectId, levers: authored, authored, shaped: false, shapedBy: null, source: "authored" };
  try {
    const anon = createAnonClient(env.url, env.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await anon.from("environment_settings").select("subject_id, density, motion_char, shaped_by, updated_at").eq("subject_id", subjectId).maybeSingle<Row>();
    if (error) throw new DataReadError("environment_settings", error);
    if (!data) return { subjectId, levers: authored, authored, shaped: false, shapedBy: null, source: "authored" }; // ABSENCE = AUTHORED (see header)
    // The DB CHECKs make an unauthored value unstorable; this guard is the TS-side closed set, not a second policy.
    const levers: EnvironmentLevers = { density: isDensity(data.density) ? data.density : authored.density, motionChar: isMotionChar(data.motion_char) ? data.motion_char : authored.motionChar };
    return { subjectId, levers, authored, shaped: true, shapedBy: data.shaped_by, source: "row" };
  } catch (e) {
    // A FAILED READ: the room renders the authored default (see header) — logged, never equal to "as authored" in the record.
    if (!(e instanceof DataReadError)) logFailure({ scope: "read:environment_settings", errorClass: errorClassOf(e), what: "settings read failed — environment renders the AUTHORED DEFAULT (design has a value without the database)", ids: { subject: subjectId } });
    else logFailure({ scope: "region:environment-settings", errorClass: `DataReadError(${e.code || "?"})`, what: "settings read failed — environment renders the AUTHORED DEFAULT", ids: { subject: subjectId } });
    return { subjectId, levers: authored, authored, shaped: false, shapedBy: null, source: "authored-after-failed-read" };
  }
}
