/* ════════════════════════════════════════════════════════════════════════
   THE LEGAL FRAMEWORK — server actions for the consent audit
   (Phase 10 · Step 1, DEC-037 · resolves E-07)

   The persistence half of the consent machinery. One action records a
   consent — terms, privacy, or a guardian's consent for a minor — into
   migration 0011's `legal_consents`.

   THE CLASSROOM POSTURE, unchanged (P5-R1): the signature carries no
   userId parameter. Identity rides the cookie session; RLS is the ONLY
   boundary (migration 0011 — own SELECT, own INSERT; everyone else denied
   by absence). A consent is always recorded by the account it belongs to.

   THE ADDRESS IS NEVER STORED. The action hashes the connecting address
   server-side (first x-forwarded-for entry, else x-real-ip, else the
   honest sentinel) and writes ONLY the digest. The raw value never reaches
   the table, the client, or the log (see consent.ts — DEC-037 declares the
   residual risk and the HMAC upgrade path).

   THE AUDIT IS APPEND-ONLY by deliberation, so idempotency lives HERE, not
   in a DB constraint: the action reads the standing consent first and
   refuses a duplicate calmly. If a future withdrawal-and-regrant flow
   lands, both events deserve rows — a unique constraint would have eaten
   the second one.

   PURE AT THE EDGES: no client → the honest configured-message; a thrown
   write → the closed failure sentence. The class goes to the log, never
   the person's email.
   ════════════════════════════════════════════════════════════════════════ */

"use server";

import { headers } from "next/headers";

import { AUTH_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { logFailure } from "@/lib/state/log";

import {
  consentAddressSource,
  hashConsentSource,
  LEGAL_COPY,
  validateConsentInput,
} from "./consent";

/** The outcome shape the gate and any future consent surface share. */
export interface LegalConsentResult {
  error: string | null;
  notice?: string | null;
}

/** Record one consent for the signed-in account. The form names the consent
 *  type (a hidden field the surfaces own); a guardian consent additionally
 *  carries the guardian's email — required there, ignored elsewhere. */
export async function recordLegalConsent(
  _prev: LegalConsentResult,
  formData: FormData,
): Promise<LegalConsentResult> {
  const supabase = await createClient();
  if (!supabase) return { error: AUTH_NOT_CONFIGURED_MESSAGE };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: LEGAL_COPY.signInRequired };

  const validation = validateConsentInput(
    String(formData.get("consent_type") ?? ""),
    typeof formData.get("guardian_email") === "string" ? (formData.get("guardian_email") as string) : null,
  );
  if (!validation.ok) return { error: validation.sentence };

  // Idempotency by deliberation (DEC-037): the standing consent is read
  // first; a duplicate is refused calmly and the audit keeps one row.
  const { data: standing, error: readError } = await supabase
    .from("legal_consents")
    .select("id")
    .eq("consent_type", validation.consentType)
    .limit(1);
  if (readError) {
    logFailure({
      scope: "action:recordLegalConsent",
      errorClass: readError.code ?? "ReadError",
      what: "consent read refused",
    });
    return { error: LEGAL_COPY.recordFailed };
  }
  if ((standing ?? []).length > 0) return { error: LEGAL_COPY.alreadyRecorded };

  const headerStore = await headers();
  const ipHash = hashConsentSource(
    consentAddressSource(headerStore.get("x-forwarded-for"), headerStore.get("x-real-ip")),
  );

  const { error: insertError } = await supabase.from("legal_consents").insert({
    user_id: user.id,
    consent_type: validation.consentType,
    guardian_email: validation.guardianEmail,
    ip_hash: ipHash,
  });
  if (insertError) {
    if (insertError.code === "23505") return { error: LEGAL_COPY.alreadyRecorded };
    logFailure({
      scope: "action:recordLegalConsent",
      errorClass: insertError.code ?? "InsertError",
      what: "consent write refused",
    });
    return { error: LEGAL_COPY.recordFailed };
  }

  if (validation.consentType === "guardian_consent_v1") {
    return { error: null, notice: LEGAL_COPY.guardianRecorded };
  }
  return { error: null, notice: LEGAL_COPY.consentRecorded };
}
