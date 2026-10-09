/* ════════════════════════════════════════════════════════════════════════
   THE ONBOARDING LOGIC — pure age and consent-state machinery
   (Phase 10 · Step 2, DEC-038)

   The testable half of age-gated onboarding, kept PURE (no crypto, no
   network, no clock of its own — every function takes the instant it
   judges by) so the offline suite proves it and the registration form can
   import it client-side for honest UX. The server actions in
   src/features/auth/actions.ts apply these guards; migration 0012's
   trigger enforces the same boundary in the database.

   THE AGE BOUNDARY, pinned: a student is a minor while
   dob + 18 years > the day it is judged. On the exact 18th birthday the
   comparison is EQUAL, not greater — the student is an adult that day.
   A 29 February birth clamps to 28 February in common years, mirroring
   Postgres interval arithmetic exactly, so the form, the action and the
   trigger can never disagree (test-onboarding-logic.mjs pins it).

   THE REGISTER: every sentence an onboarding act can speak is defined
   here, verbatim — calm, zero exclamation marks, zero coercion.
   ════════════════════════════════════════════════════════════════════════ */

/** The earliest birth date the form accepts — a sanity bound, not a rule. */
export const DOB_MIN_ISO = "1900-01-01";

/** How long a guardian verification link stands before it expires. */
export const VERIFICATION_TTL_DAYS = 7;

/** The closed vocabulary every onboarding act may speak (swept: no
 *  exclamation marks, no coercion). Surfaces render these verbatim. */
export const ONBOARDING_COPY = {
  /** The tutor invitation gate — the door is closed, with dignity. */
  tutorGateRefusal:
    "Tutor accounts are opened by invitation. Self-service registration for tutors is not open in this deployment.",
  tutorGateOwed:
    "The invitation and credential-review flow stands owed to the environment that hires tutors; until then this gate says so rather than collecting credentials it cannot review.",
  /** Track 2: the credential-review door now stands at /tutor/apply. */
  tutorApplyDoor:
    "Applications for review are open. A prospective tutor submits their academic background and subjects; an administrator decides each application before any subject opens.",
  tutorApplySubjectsRequired:
    "Name at least one subject you would teach — the review needs somewhere to look.",
  tutorApplySubmitted:
    "The application stands recorded for administrator review. Nothing opens until it is approved.",
  tutorApplyDemonstration:
    "This deployment holds no database, so the application is recorded in the demonstration ledger an administrator can review at the operations console, and in no production store.",
  /** The date-of-birth refusals. */
  missingDob: "Enter your date of birth — the academy must know whether a guardian's consent is needed.",
  futureDob: "That date of birth is in the future — enter the date you were born.",
  implausibleDob: "That date of birth is not accepted here — check the day, month and year.",
  /** The consent-checkbox refusals (adult path). */
  termsRequired: "Read and accept the Terms of Academy Practice to continue.",
  privacyRequired: "Read and accept the Privacy & Data Protection Notice to continue.",
  /** The deployment honesty — no half-open doors. */
  onboardingUnavailable:
    "Onboarding cannot complete in this deployment — the service credentials that record consent are not configured. Nothing was created.",
  /** The minor's next step, stated once. */
  minorNextStep:
    "Your account is created. Confirm your email and sign in — the guardian consent gate stands next, and enrolment waits for your guardian's confirmation.",
  /** The minor notice shown while the form is being filled. */
  minorFormNotice:
    "You are under 18. A guardian will be asked to confirm consent before you can enrol in subject chambers.",
  /** The guardian gate's recorded outcome — honest about delivery. */
  verificationRecorded:
    "The verification link stands recorded. The delivery channel is not wired in this deployment, so the link is not shown here — it will be emailed to the guardian when the channel opens.",
  /** The verification handler's outcomes. */
  verifyConfirmed: "Consent has been confirmed. The student's academy access is now active.",
  verifyAlready: "This consent was already confirmed. Nothing was changed.",
  verifyExpired: "This verification link has expired. A new one can be requested from the guardian gate.",
  verifyUnknown: "This verification link is not recognised. If you expected one, ask for it to be sent again.",
  verifyUnavailable: "Verification cannot run in this deployment — the service credentials are not configured. Nothing was changed.",
  /** The guardian gate's states on /register/guardian. */
  guardianGateDone: "A guardian's consent already stands on this account. The subject chambers are open.",
  guardianGateNotNeeded: "This gate stands for accounts whose recorded birth date is under 18. This account needs no guardian confirmation.",
  /** The closed failure, shared. */
  recordFailed: "That could not be recorded. Nothing was changed; repeating is safe.",
} as const;

/** True when the string is a well-formed YYYY-MM-DD shape. */
export function isDobShape(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/** Parse a birth date. Returns the UTC-midnight Date, or the calm refusal.
 *  `asOf` is the instant the judgement is made — the action passes the
 *  server's clock; the suite passes fixed instants. */
export function parseDob(
  value: string,
  asOf: Date,
): { ok: true; date: Date } | { ok: false; sentence: string } {
  const v = value.trim();
  if (!isDobShape(v)) return { ok: false, sentence: ONBOARDING_COPY.implausibleDob };
  const [y, m, d] = v.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // The calendar round-trip refuses 31 February and its kin.
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return { ok: false, sentence: ONBOARDING_COPY.implausibleDob };
  }
  if (date.getTime() < Date.parse(DOB_MIN_ISO)) {
    return { ok: false, sentence: ONBOARDING_COPY.implausibleDob };
  }
  const todayUtc = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  if (date.getTime() > todayUtc) return { ok: false, sentence: ONBOARDING_COPY.futureDob };
  return { ok: true, date };
}

/** Add years with end-of-month clamping — the Postgres interval
 *  convention: 29 February + 18 years lands on 28 February in a common
 *  year. The trigger and this function can never disagree. */
export function addYearsClamped(date: Date, years: number): Date {
  const y = date.getUTCFullYear() + years;
  const m = date.getUTCMonth();
  const candidate = new Date(Date.UTC(y, m, date.getUTCDate()));
  if (candidate.getUTCMonth() !== m) {
    // The day overflowed the month (29 Feb in a common year) → last day.
    return new Date(Date.UTC(y, m + 1, 0));
  }
  return candidate;
}

/** The boundary itself: a minor while dob + 18 years is STRICTLY AFTER the
 *  day it is judged. The 18th birthday is the first adult day. */
export function isMinorAt(dob: Date, asOf: Date): boolean {
  const eighteenth = addYearsClamped(dob, 18);
  const dayUtc = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  return eighteenth.getTime() > dayUtc;
}

/** The verification state machine: a link is redeemable exactly while it
 *  stands unverified and unexpired. */
export type VerificationJudgement = "redeemable" | "already" | "expired";

export function judgeVerification(
  state: { verifiedAt: string | Date | null | undefined; expiresAt: string | Date },
  now: Date,
): VerificationJudgement {
  if (state.verifiedAt) return "already";
  const expires = typeof state.expiresAt === "string" ? new Date(state.expiresAt) : state.expiresAt;
  if (expires.getTime() <= now.getTime()) return "expired";
  return "redeemable";
}

/** The full onboarding input guard, pure. The action applies it verbatim;
 *  the form mirrors it for honest UX. */
export type OnboardingJudgement =
  | { ok: false; sentence: string }
  | { ok: true; path: "adult" | "minor" };

export function judgeOnboardingInput(
  input: {
    name: string;
    email: string;
    password: string;
    dobIso: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    isEmailShape: (value: string) => boolean;
  },
  asOf: Date,
): OnboardingJudgement {
  if (!input.name.trim()) return { ok: false, sentence: "Enter your name." };
  if (!input.isEmailShape(input.email)) {
    return { ok: false, sentence: "Enter one complete email address." };
  }
  if (input.password.length < 8) {
    return { ok: false, sentence: "Use a password of at least 8 characters." };
  }
  if (!input.dobIso.trim()) return { ok: false, sentence: ONBOARDING_COPY.missingDob };
  const dob = parseDob(input.dobIso, asOf);
  if (!dob.ok) return dob;
  if (isMinorAt(dob.date, asOf)) return { ok: true, path: "minor" };
  // An adult's consent is asked plainly, never pre-ticked.
  if (!input.termsAccepted) return { ok: false, sentence: ONBOARDING_COPY.termsRequired };
  if (!input.privacyAccepted) return { ok: false, sentence: ONBOARDING_COPY.privacyRequired };
  return { ok: true, path: "adult" };
}
