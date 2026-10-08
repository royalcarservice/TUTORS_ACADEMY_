"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { STATE_COPY } from "@/components/state/copy";
import { logFailure } from "@/lib/state/log";
import { AUTH_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { consentAddressSource, hashConsentSource, isGuardianEmail, LEGAL_COPY } from "@/lib/legal/consent";
import { issueGuardianVerification } from "@/lib/auth/guardian-verification";
import { judgeOnboardingInput, ONBOARDING_COPY } from "@/lib/auth/onboarding";

export interface AuthResult {
  error: string | null;
  notice?: string | null;
}

/* Phase 10 · Step 2 (DEC-038): SIGNUP IS AGE-GATED. The student path
   computes the age server-side from the date of birth; an adult consents
   to terms_v1 + privacy_v1 and is provisioned real (is_test_account flips
   false); a minor lands pending_guardian — the guardian gate stands at
   /register/guardian and enrolment waits (migration 0012's trigger
   enforces the dormancy). The tutor path meets the invitation gate: a
   calm refusal, no self-service. Test accounts keep their own path
   (scripts/test-account.mjs, service role) — untouched. */

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : ROUTES.student;
}

/* 5.7 (P5-R8.4/6): the driver's message never reaches the page. A wrong
   password is answered vaguely ON PURPOSE (a security decision — which half
   was wrong is not disclosed). Every other failure becomes one sentence that
   claims only what is known: nothing was changed, repeating is safe. The
   class and status go to the log, never the student's email or password. */
function signInSentence(error: { message: string; status?: number; name?: string; code?: string }): string {
  if (/invalid login credentials/i.test(error.message)) return STATE_COPY.signInRefused;
  if (/email not confirmed/i.test(error.message)) return "This account's email has not been confirmed yet — the confirmation link is in that inbox.";
  logFailure({ scope: "action:signIn", errorClass: `${error.name ?? "AuthError"}${error.status ? `(${error.status})` : ""}`, what: "sign-in refused by the auth service" });
  return STATE_COPY.signInUnavailable;
}
function signUpSentence(error: { message: string; status?: number; name?: string }): string {
  if (/already registered|already exists/i.test(error.message)) return "An account with this email already exists — sign in instead.";
  if (/password/i.test(error.message)) return "That password is not accepted here — choose a longer one and send the form again.";
  logFailure({ scope: "action:signUp", errorClass: `${error.name ?? "AuthError"}${error.status ? `(${error.status})` : ""}`, what: "sign-up refused by the auth service" });
  return STATE_COPY.registerUnavailable;
}

export async function signIn(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: AUTH_NOT_CONFIGURED_MESSAGE };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: signInSentence(error) };
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: AUTH_NOT_CONFIGURED_MESSAGE };

  // The tutor invitation gate (DEC-038): tutors are opened by invitation;
  // self-service registration is refused here as visibly as in the form.
  if (formData.get("role") === "tutor") return { error: ONBOARDING_COPY.tutorGateRefusal };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const dobIso = String(formData.get("date_of_birth") ?? "").trim();
  const judgement = judgeOnboardingInput(
    {
      name,
      email,
      password,
      dobIso,
      termsAccepted: formData.get("terms_v1") === "on",
      privacyAccepted: formData.get("privacy_v1") === "on",
      isEmailShape: isGuardianEmail,
    },
    new Date(), // the server's clock decides the age, never the browser's
  );
  if (!judgement.ok) return { error: judgement.sentence };

  // No half-open doors: the consent writes need the service credentials, so
  // their absence refuses the whole act before anything is created.
  const service = createServiceClient();
  if (!service) return { error: ONBOARDING_COPY.onboardingUnavailable };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "student", display_name: name, date_of_birth: dobIso } },
  });
  if (error) return { error: signUpSentence(error) };
  const userId = data.user?.id;
  if (!userId) return { error: ONBOARDING_COPY.recordFailed };

  if (judgement.path === "adult") {
    // The verified onboarding path: consent recorded, account provisioned
    // real. Any failure rolls the account back — nothing lands half-done.
    const headerStore = await headers();
    const ipHash = hashConsentSource(
      consentAddressSource(headerStore.get("x-forwarded-for"), headerStore.get("x-real-ip")),
    );
    const writes = [
      await service.from("legal_consents").insert({ user_id: userId, consent_type: "terms_v1", ip_hash: ipHash }),
      await service.from("legal_consents").insert({ user_id: userId, consent_type: "privacy_v1", ip_hash: ipHash }),
      await service.from("profiles").update({ is_test_account: false }).eq("id", userId),
    ];
    if (writes.some((w) => w.error)) {
      await service.auth.admin.deleteUser(userId); // the rollback: the act never half-happens
      logFailure({
        scope: "action:signUp",
        errorClass: String(writes.find((w) => w.error)?.error?.code ?? "ConsentWriteError"),
        what: "consent record refused; account rolled back",
      });
      return { error: ONBOARDING_COPY.recordFailed };
    }
  }
  // judgement.path === "minor": the account exists pending_guardian; the
  // guardian gate at /register/guardian stands next. Nothing else is
  // written — enrolment is trigger-blocked until verification.

  if (data.session) redirect(ROUTES.student);
  // Email confirmation is on: no session until the link is followed (/auth/callback).
  return {
    error: null,
    notice: judgement.path === "minor"
      ? ONBOARDING_COPY.minorNextStep
      : "Check your email for a confirmation link. Until you follow it, no session exists.",
  };
}

/** The guardian gate's act (Phase 10 · Step 2): a signed-in pending student
 *  names their guardian; the verification link is issued (one pending link
 *  per student — issuing again replaces the standing one). The raw token
 *  never reaches the browser: delivery is owed to the email channel, and
 *  the outcome sentence says so honestly. */
export async function startGuardianVerification(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: AUTH_NOT_CONFIGURED_MESSAGE };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: LEGAL_COPY.signInRequired };

  const guardianEmail = String(formData.get("guardian_email") ?? "").trim();
  if (!isGuardianEmail(guardianEmail)) return { error: LEGAL_COPY.invalidEmail };

  const service = createServiceClient();
  if (!service) return { error: ONBOARDING_COPY.onboardingUnavailable };

  const issued = await issueGuardianVerification(service, user.id, guardianEmail);
  if (!issued.ok) {
    logFailure({ scope: "action:startGuardianVerification", errorClass: "LedgerWriteError", what: "verification row refused" });
    return { error: ONBOARDING_COPY.recordFailed };
  }
  // `issued.token` is deliberately dropped here — it exists in the link's
  // destination (the delivery channel) and nowhere else.
  return { error: null, notice: ONBOARDING_COPY.verificationRecorded };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect(ROUTES.login);
}
