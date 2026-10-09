"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAuthConfigured } from "@/lib/supabase/env";
import { SUBJECTS } from "@/lib/subjects/subjects";
import {
  createTutorApplicationAccessToken,
  createTutorRegistrationCheckoutUrl,
  getTutorApplicationAccess,
  setTutorApplicationAccessCookie,
  type TutorApplicationActionResult,
} from "./registration";

const CLASS_LEVELS = Array.from({ length: 12 }, (_, index) => String(index + 1));

export async function saveTutorApplicationAction(
  _previous: TutorApplicationActionResult | null,
  formData: FormData,
): Promise<TutorApplicationActionResult> {
  void _previous;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const background = String(formData.get("background") ?? "").trim();
  const subjects = Array.from(new Set(formData.getAll("subjects").map(String)));
  const board = String(formData.get("board") ?? "").trim();
  const classes = Array.from(new Set(formData.getAll("classes").map(String)));

  if (!name || name.length > 80) return { ok: false, note: "Enter your name (up to 80 characters). Nothing was saved." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, note: "Enter a valid email address. Nothing was saved." };
  if (!background || background.length > 2000) return { ok: false, note: "Add your academic background (up to 2,000 characters). Nothing was saved." };
  if (!board || board.length > 100) return { ok: false, note: "Enter the board you teach or studied under. Nothing was saved." };
  const allowedSubjects = new Set(SUBJECTS.map((subject) => subject.id));
  if (subjects.length === 0 || subjects.some((subject) => !allowedSubjects.has(subject))) return { ok: false, note: "Select at least one valid subject. Nothing was saved." };
  if (classes.length === 0 || classes.some((level) => !CLASS_LEVELS.includes(level))) return { ok: false, note: "Select at least one class level from 1 to 12. Nothing was saved." };

  const access = await getTutorApplicationAccess();
  if (access.hasCookie && !access.application) {
    return { ok: false, note: "The saved application could not be verified. No new application was created; return to the payment page or contact the academy." };
  }
  if (access.application && access.application.status !== "pending_payment") {
    redirect(ROUTES.tutorApplyPayment);
  }
  if (access.application && access.application.email !== email) {
    return { ok: false, note: "This saved account's email cannot be changed in the application form. Nothing was changed." };
  }

  const supabase = await createClient();
  const service = createServiceClient();
  if (!isAuthConfigured() || !supabase || !service) {
    return { ok: false, note: "Preview/test mode: application storage is not configured. Your details were not saved and no payment page was opened." };
  }

  if (access.application && access.tokenHash) {
    const { error } = await service.rpc("save_tutor_application", {
      p_id: access.application.id,
      p_name: name,
      p_email: email,
      p_background: background,
      p_subject_ids: subjects,
      p_board: board,
      p_class_levels: classes,
      p_token_hash: access.tokenHash,
    });
    if (error) return { ok: false, note: "The database did not save these edits. Your previous Pending Payment application is unchanged." };
    redirect(ROUTES.tutorApplyPayment);
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || password.length > 128) return { ok: false, note: "Choose a password between 8 and 128 characters. Nothing was saved." };

  const { data, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "tutor", display_name: name } },
  });
  if (signupError) {
    return {
      ok: false,
      note: /already registered|already exists/i.test(signupError.message)
        ? "An account with this email already exists. Sign in or contact the academy; no application was saved."
        : "The account could not be created. Nothing was saved and no payment was attempted.",
    };
  }
  const user = data.user;
  const userId = user?.id;
  if (!user || !userId) return { ok: false, note: "The account service returned no applicant identity. Nothing was saved." };
  if (Array.isArray(user.identities) && user.identities.length === 0) {
    return { ok: false, note: "An account with this email already exists. Sign in or contact the academy; no application was saved." };
  }
  const createdByThisSignup = Array.isArray(user.identities) && user.identities.length > 0;

  const accessToken = createTutorApplicationAccessToken();
  const { error: saveError } = await service.rpc("save_tutor_application", {
    p_id: userId,
    p_name: name,
    p_email: email,
    p_background: background,
    p_subject_ids: subjects,
    p_board: board,
    p_class_levels: classes,
    p_token_hash: accessToken.tokenHash,
  });

  if (saveError) {
    if (data.session) await supabase.auth.signOut();
    let accountRolledBack = false;
    if (createdByThisSignup) {
      const { error: rollbackError } = await service.auth.admin.deleteUser(userId);
      accountRolledBack = !rollbackError;
    }
    return {
      ok: false,
      note: accountRolledBack
        ? "The application could not be saved as Pending Payment. The temporary account was rolled back; no payment was attempted."
        : "The application could not be saved as Pending Payment. No payment was attempted; contact the academy before retrying this email.",
    };
  }

  await setTutorApplicationAccessCookie(userId, accessToken.token);
  redirect(ROUTES.tutorApplyPayment);
}

export async function startTutorRegistrationPaymentAction(
  _previous: TutorApplicationActionResult | null,
  _formData: FormData,
): Promise<TutorApplicationActionResult> {
  void _previous;
  void _formData;
  const access = await getTutorApplicationAccess();
  if (!access.application) {
    return { ok: false, note: "No saved tutor application was found in this browser. Nothing was charged." };
  }
  if (access.application.status !== "pending_payment") {
    return { ok: false, note: "This application is no longer awaiting payment. No new charge was attempted." };
  }

  const result = await createTutorRegistrationCheckoutUrl(access.application);
  if (!result.ok) return result;
  redirect(result.url);
}
