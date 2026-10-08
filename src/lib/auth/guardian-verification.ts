/* ════════════════════════════════════════════════════════════════════════
   THE GUARDIAN VERIFICATION MECHANICS (Phase 10 · Step 2, DEC-038)

   Server-only. The two acts of the guardian consent flow:

   ISSUE  — a signed-in student names their guardian; a verification row
            lands in migration 0012's ledger with a ONE-WAY hash of a
            fresh token and a 7-day expiry. The raw token never lands
            anywhere: it exists in the link and nowhere else. One pending
            link per student: issuing again replaces the standing one.

   REDEEM — the guardian's link arrives at /auth/verify-guardian; the
            handler hashes the token, finds the row, judges it
            (redeemable / already / expired) through the pure state
            machine, and on confirmation performs the three service-role
            writes: the ledger marks verified, the consent audit gains
            guardian_consent_v1, and the profile's guardian_verified
            stands true (with is_test_account's flip — the verified
            onboarding path completed with consent).

   Every write rides the service client (RLS bypass, the posture of
   src/lib/supabase/service.ts); the ledger itself admits no other role.
   ════════════════════════════════════════════════════════════════════════ */

import { createHash, randomBytes } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { judgeVerification, VERIFICATION_TTL_DAYS } from "./onboarding";

export type VerificationOutcome = "confirmed" | "already" | "expired" | "unknown" | "failed";

export interface IssuedVerification {
  ok: boolean;
  /** Present only for tests/logs-shapes; NEVER returned to a browser. */
  token?: string;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Issue (or replace) the pending verification for one student. */
export async function issueGuardianVerification(
  service: SupabaseClient,
  userId: string,
  guardianEmail: string,
): Promise<IssuedVerification> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // One pending link per student: a standing unverified, unexpired row is
  // replaced (the old token dies — its hash can still never be redeemed,
  // because redemption also checks the state machine).
  const { data: pending, error: findError } = await service
    .from("guardian_verifications")
    .select("id, verified_at, expires_at")
    .eq("user_id", userId)
    .is("verified_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  if (findError) return { ok: false };

  const standing = (pending ?? [])[0];
  if (standing) {
    const { error } = await service
      .from("guardian_verifications")
      .update({ guardian_email: guardianEmail, token_hash: tokenHash, expires_at: expiresAt })
      .eq("id", standing.id);
    if (error) return { ok: false };
    return { ok: true, token };
  }

  const { error } = await service.from("guardian_verifications").insert({
    user_id: userId,
    guardian_email: guardianEmail,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (error) return { ok: false };
  return { ok: true, token };
}

/** Redeem a token from the guardian's link. Performs all three writes only
 *  when the state machine says redeemable; the ledger update is guarded by
 *  `verified_at is null`, so a double-click cannot double-record. */
export async function redeemGuardianToken(
  service: SupabaseClient,
  token: string,
  ipHash: string,
): Promise<VerificationOutcome> {
  const { data: row, error: findError } = await service
    .from("guardian_verifications")
    .select("id, user_id, guardian_email, verified_at, expires_at")
    .eq("token_hash", sha256Hex(token))
    .maybeSingle();
  if (findError) return "failed";
  if (!row) return "unknown";

  const judgement = judgeVerification(
    { verifiedAt: row.verified_at, expiresAt: row.expires_at },
    new Date(),
  );
  if (judgement === "already") return "already";
  if (judgement === "expired") return "expired";

  const { data: marked, error: markError } = await service
    .from("guardian_verifications")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", row.id)
    .is("verified_at", null)
    .select("id");
  if (markError) return "failed";
  if ((marked ?? []).length === 0) return "already"; // lost a harmless race

  const { error: consentError } = await service.from("legal_consents").insert({
    user_id: row.user_id,
    consent_type: "guardian_consent_v1",
    guardian_email: row.guardian_email,
    ip_hash: ipHash,
  });
  if (consentError) return "failed";

  const { error: profileError } = await service
    .from("profiles")
    .update({ guardian_verified: true, is_test_account: false })
    .eq("id", row.user_id);
  if (profileError) return "failed";

  return "confirmed";
}
