"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { STATE_COPY } from "@/components/state/copy";
import { logFailure } from "@/lib/state/log";
import { AUTH_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error: string | null;
  notice?: string | null;
}

/* Phase 5: SIGNUP IS FOR TEST ACCOUNTS ONLY (P5-R1 Part 7). The legal
   blockers (privacy, terms, contact, DPDP) are the owner's to resolve; no
   real student is onboarded in Phase 5. The mechanism is built, not opened. */

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
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const role = formData.get("role") === "tutor" ? "tutor" : "student"; // admin is never self-serve
  if (!email || password.length < 8) return { error: "Enter an email and a password of at least 8 characters." };
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { role, display_name: name } } });
  if (error) return { error: signUpSentence(error) };
  if (data.session) redirect(role === "tutor" ? ROUTES.tutor : ROUTES.student);
  // Email confirmation is on: no session until the link is followed (/auth/callback).
  return { error: null, notice: "Check your email for a confirmation link. Until you follow it, no session exists." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect(ROUTES.login);
}
