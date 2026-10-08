/* ════════════════════════════════════════════════════════════════════════
   THE LEGAL FRAMEWORK — pure consent logic
   (Phase 10 · Step 1, DEC-037 · resolves E-07)

   The testable half of the consent machinery, kept pure so the offline
   suite can prove it (scripts/test-legal-logic.mjs). The server actions in
   ./data.ts assemble rows through these guards; nothing here touches the
   network, the clock beyond defaults, or the database.

   THE POSTURES THIS MODULE PINS
   · The consent union is CLOSED: terms_v1 · privacy_v1 · guardian_consent_v1
     · terms_v2 · privacy_v2 (Track 3, DEC-044): the commerce revision — v1 rows
       remain readable history; new acceptances record the v2 versions.
     A future terms revision is a NEW type (terms_v2), never a mutation.
   · guardian_email belongs to ONE consent type. Required there, forbidden
     elsewhere — the column means one thing (migration 0011 CHECKs it too).
   · The consent audit stores a ONE-WAY hash of the connecting address,
     computed server-side. The raw address is never stored, never returned.
     When no address is visible to the app, the literal sentinel is hashed —
     the audit records absence honestly rather than inventing an address.
   · Every sentence a consent act can speak is defined here, verbatim. The
     register is calm: zero exclamation marks, zero coercion, zero dark
     patterns (the brief's requirement, swept by test).
   ════════════════════════════════════════════════════════════════════════ */

import { createHash } from "node:crypto";

/** The closed consent union (migration 0011 mirrors this CHECK verbatim). */
export const CONSENT_TYPES = ["terms_v1", "privacy_v1", "guardian_consent_v1", "terms_v2", "privacy_v2"] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

/** The type-guard the actions and the suite share. */
export function isConsentType(value: string): value is ConsentType {
  return (CONSENT_TYPES as readonly string[]).includes(value);
}

/** RFC-c conservative cap: the DB CHECK mirrors this figure. */
export const GUARDIAN_EMAIL_MAX = 254;

/** One clean guardian email: trimmed, bounded, one @ between non-empty
 *  halves, a dotted tail. Deliberately simple — this gate verifies consent,
 *  not deliverability. */
export function isGuardianEmail(value: string): boolean {
  const v = value.trim();
  if (v.length === 0 || v.length > GUARDIAN_EMAIL_MAX) return false;
  if (/\s/.test(v)) return false;
  const at = v.indexOf("@");
  if (at <= 0 || at !== v.lastIndexOf("@")) return false;
  const domain = v.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return dot > 0 && dot < domain.length - 1;
}

/** What the action hashes when no address is visible. Hashed like any other
 *  source, so the column's shape never reveals which case occurred. */
export const NO_ADDRESS_SOURCE = "no-address";

/** One-way SHA-256 hex digest. The ONLY form an address ever reaches the
 *  audit in. */
export function hashConsentSource(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("hex");
}

/** Extract the connecting address the platform hands over: the first
 *  x-forwarded-for entry, else x-real-ip, else the honest sentinel. Pure:
 *  takes header values, returns the source to hash — nothing else reads it. */
export function consentAddressSource(
  forwardedFor: string | null | undefined,
  realIp: string | null | undefined,
): string {
  const first = (forwardedFor ?? "").split(",")[0]?.trim();
  if (first) return first;
  const real = (realIp ?? "").trim();
  if (real) return real;
  return NO_ADDRESS_SOURCE;
}

/** The closed vocabulary every consent act may speak (swept: no exclamation
 *  marks, no coercion). Surfaces render these verbatim. */
export const LEGAL_COPY = {
  /** The gate's legal sentence — the brief's requirement, verbatim. */
  guardianDpdpSentence:
    "As a student under 18, the Digital Personal Data Protection Act requires verified guardian consent before enrolling in subject chambers.",
  /** What the email is for, stated once, beside the field. */
  guardianEmailPurpose:
    "Used only to verify this consent. Never for marketing, never shared with the student's tutors.",
  /** The recorded outcome — honest about the delivery channel's state. */
  guardianRecorded:
    "Guardian consent recorded. The confirmation email channel is not wired in this deployment, so the link stands recorded but unsent; it will be delivered when the channel opens.",
  /** The recorded outcome for terms and privacy consents. */
  consentRecorded: "Consent recorded. It stands on this account from this instant.",
  /** A consent that already stands. */
  alreadyRecorded: "A consent of this kind already stands on this account. Nothing was written again.",
  /** The field's calm refusal. */
  invalidEmail: "Enter the guardian's email address — one complete address, nothing else.",
  /** The closed failure: nothing changed, repeating is safe. */
  recordFailed: "The consent could not be recorded. Nothing was changed; repeating is safe.",
  /** No session, no consent — identity rides the cookie, as everywhere. */
  signInRequired: "Sign in first: a consent is always recorded by the account it belongs to.",
} as const;

/** The validated row one consent act produces — or the calm refusal. Pure,
 *  so the suite proves the guard exactly as the action applies it. */
export type ConsentValidation =
  | { ok: true; consentType: ConsentType; guardianEmail: string | null }
  | { ok: false; sentence: string };

export function validateConsentInput(rawType: string, rawGuardianEmail: string | null): ConsentValidation {
  if (!isConsentType(rawType)) return { ok: false, sentence: LEGAL_COPY.recordFailed };
  if (rawType === "guardian_consent_v1") {
    const email = (rawGuardianEmail ?? "").trim();
    if (!isGuardianEmail(email)) return { ok: false, sentence: LEGAL_COPY.invalidEmail };
    return { ok: true, consentType: rawType, guardianEmail: email.slice(0, GUARDIAN_EMAIL_MAX) };
  }
  // terms_v1 / privacy_v1 carry no guardian email — the column means one thing.
  return { ok: true, consentType: rawType, guardianEmail: null };
}
