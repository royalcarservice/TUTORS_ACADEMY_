"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
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

export async function signIn(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { error: AUTH_NOT_CONFIGURED_MESSAGE };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
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
  if (error) return { error: error.message };
  if (data.session) redirect(role === "tutor" ? ROUTES.tutor : ROUTES.student);
  // Email confirmation is on: no session until the link is followed (/auth/callback).
  return { error: null, notice: "Check your email for a confirmation link. Until you follow it, no session exists." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect(ROUTES.login);
}
