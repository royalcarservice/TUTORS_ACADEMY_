import type { SupabaseClient } from "@supabase/supabase-js";

import type { EnvironmentLevers } from "@/lib/environment/levers";
import type { SubjectId } from "@/lib/student/contract";

/* ════════════════════════════════════════════════════════════════════════
   THE WRITE (Phase 6 · Step 4) — 5.5's shape, not a new one.
   Called ONLY from the POST handler with the REQUEST-SCOPED client carrying
   the TUTOR'S OWN SESSION. Never the service role: the INSERT/UPDATE/DELETE
   policies (at least one ACTIVE relationship in the subject; shaped_by =
   auth.uid()) are exercised on every write — that is the point of them.

   The address is { subjectId } and the values are the two levers. There is no
   student, no relationship, no tutor parameter: who is writing comes from
   the session, and whom it is for is EVERYONE IN THE SUBJECT (P6-R10).
   A write "for a student" cannot be expressed (attack 6).

   IDEMPOTENT: upsert on the primary key (subject_id). Save twice = one row.
   REVERT: delete the row. Absence = the authored default (P6-R12).
   ════════════════════════════════════════════════════════════════════════ */

export interface ShapeAddress { subjectId: SubjectId }

export type ShapeResult = { ok: true } | { ok: false; code: string };

export async function shapeEnvironment(client: SupabaseClient, address: ShapeAddress, levers: EnvironmentLevers, shapedBy: string): Promise<ShapeResult> {
  const { error } = await client
    .from("environment_settings")
    .upsert({ subject_id: address.subjectId, density: levers.density, motion_char: levers.motionChar, shaped_by: shapedBy, updated_at: new Date().toISOString() }, { onConflict: "subject_id" });
  return error ? { ok: false, code: error.code || "write-failed" } : { ok: true };
}

export async function revertEnvironment(client: SupabaseClient, address: ShapeAddress): Promise<ShapeResult> {
  const { error } = await client.from("environment_settings").delete().eq("subject_id", address.subjectId);
  return error ? { ok: false, code: error.code || "write-failed" } : { ok: true };
}
