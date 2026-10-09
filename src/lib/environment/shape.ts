import type { SupabaseClient } from "@supabase/supabase-js";

import type { EnvironmentLevers } from "@/lib/environment/levers";
import type { SubjectId } from "@/lib/student/contract";

/* ════════════════════════════════════════════════════════════════════════
   THE WRITE (Phase 6 · Step 4, amended by P6-R21) — 5.5's shape, not a new one.
   Called ONLY from the POST handler with the REQUEST-SCOPED client carrying
   the TUTOR'S OWN SESSION. Never the service role: the INSERT/UPDATE/DELETE
   policies (at least one ACTIVE relationship in the subject; shaped_by =
   auth.uid()) are exercised on every write — that is the point of them.

   The address is { subjectId } and the values are the two levers. There is no
   student, no relationship, no tutor parameter: who is writing comes from
   the session, and whom it is for is EVERYONE IN THE SUBJECT (P6-R10).
   A write "for a student" cannot be expressed (attack 6).

   P6-R21 — REFUSE THE STALE WRITE. The surface carries a FRESHNESS TOKEN:
   the row's `updated_at` as it was read (`version`), or the empty token when
   no row existed. A save must prove it is writing over the state it saw:
     · token = a timestamp → a CONDITIONAL UPDATE touching only the row whose
       `updated_at` still equals the token; zero rows means the room moved
       (another shaping, or a revert) between load and submit → CONFLICT.
     · token = null (no row at load) → INSERT-UNLESS-EXISTS; a row that
       appeared since load → CONFLICT.
     · token omitted → the write cannot prove its freshness → CONFLICT.
   Last-write-wins was REJECTED by ruling (DEC-018 addendum, 2026-10-06): a
   silent overwrite of another tutor's shaping is a defect, not a default.
   The clock is the database's (default now() on insert, the touch trigger on
   update) — never the client's. REVERT stays tokenless by construction: a
   DELETE cannot overwrite a value, only remove one (P6-R12's default returns).
   ════════════════════════════════════════════════════════════════════════ */

/* The ruling's sentence — verbatim, single, factual. Names the fact, never the
   person (P6-R21). Rendered by the route's 409 document and quoted by the
   harness; changing it is a copy decision, not an implementation one. */
export const SHAPE_CONFLICT_SENTENCE =
  "The room settings were updated in another session. Reload to review the current state before applying changes.";

export interface ShapeAddress { subjectId: SubjectId }

export type ShapeResult =
  | { ok: true }
  | { ok: false; reason: "conflict" }
  | { ok: false; reason: "failed"; code: string };

/**
 * Save the levers, ONLY if the room is still in the state the surface read.
 * `version` is the freshness token (the row's `updated_at` at load; `null`
 * when no row existed). OMITTING it is not a neutral act: a write that cannot
 * prove its freshness is refused — so `undefined` is treated as stale.
 * Absent a conflict the write is still idempotent in effect: one row per
 * subject (PK), values from the closed authored sets (checked upstream).
 */
export async function shapeEnvironment(
  client: SupabaseClient,
  address: ShapeAddress,
  levers: EnvironmentLevers,
  shapedBy: string,
  version?: string | null,
): Promise<ShapeResult> {
  if (version === undefined) return { ok: false, reason: "conflict" };

  if (version === null) {
    /* No row when the surface loaded: this save is the FIRST shaping since.
       Insert unless a row appeared meanwhile; ignoreDuplicates makes the
       collision silent at the SQL layer and the empty result says CONFLICT. */
    const { data, error } = await client
      .from("environment_settings")
      .upsert(
        { subject_id: address.subjectId, density: levers.density, motion_char: levers.motionChar, shaped_by: shapedBy },
        { onConflict: "subject_id", ignoreDuplicates: true },
      )
      .select("subject_id");
    if (error) return { ok: false, reason: "failed", code: error.code || "write-failed" };
    return data && data.length > 0 ? { ok: true } : { ok: false, reason: "conflict" };
  }

  /* The row existed: touch ONLY the row that still carries the token. The
     comparison is instant-equality on timestamptz — the token is the value
     the read returned, so no formatting round-trip can disagree. The touch
     trigger stamps the new updated_at; the values belong to the subject. */
  const { data, error } = await client
    .from("environment_settings")
    .update({ density: levers.density, motion_char: levers.motionChar, shaped_by: shapedBy })
    .eq("subject_id", address.subjectId)
    .eq("updated_at", version)
    .select("subject_id");
  if (error) return { ok: false, reason: "failed", code: error.code || "write-failed" };
  return data && data.length > 0 ? { ok: true } : { ok: false, reason: "conflict" };
}

export async function revertEnvironment(client: SupabaseClient, address: ShapeAddress): Promise<ShapeResult> {
  const { error } = await client.from("environment_settings").delete().eq("subject_id", address.subjectId);
  return error ? { ok: false, reason: "failed", code: error.code || "write-failed" } : { ok: true };
}
