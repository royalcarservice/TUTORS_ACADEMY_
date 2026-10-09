"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, Button, Checkbox, Input, Label, Textarea } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { SUBJECTS } from "@/lib/subjects/subjects";
import { saveTutorApplicationAction } from "@/lib/tutor/registration-actions";
import type { TutorApplicationActionResult, TutorApplicationRecord } from "@/lib/tutor/registration";

const CLASSES = Array.from({ length: 12 }, (_, index) => String(index + 1));

export function ApplyForm({
  storageConfigured,
  initialApplication,
  applicationAccessNeedsRecovery,
}: {
  storageConfigured: boolean;
  initialApplication: TutorApplicationRecord | null;
  applicationAccessNeedsRecovery: boolean;
}) {
  const [result, action, pending] = useActionState<TutorApplicationActionResult | null, FormData>(saveTutorApplicationAction, null);

  if (initialApplication && initialApplication.status !== "pending_payment") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#D8BD78]/50 bg-white/90 p-7 shadow-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9A7830]">Tutor registration</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#0A192F]" style={{ fontFamily: "var(--ta-font-display)" }}>
          Your application is already submitted
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {initialApplication.status === "pending_approval"
            ? "Your payment was verified and your application is awaiting review. Payment does not mean that you have been approved or hired."
            : initialApplication.status === "approved"
              ? "Your application has been approved by the academy."
              : "The academy has recorded a decision on this application."}
        </p>
        <Link className="mt-6 inline-flex text-sm font-semibold text-[#8A6820] underline underline-offset-4" href={ROUTES.tutorApplyPayment}>
          View registration status
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#D8BD78]/50 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9A7830]">Tutor application</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0A192F] sm:text-4xl" style={{ fontFamily: "var(--ta-font-display)" }}>
        Apply to teach
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        Your application is reviewed by the academy. A verified registration payment submits it for review; it does not mean you have been approved or hired.
      </p>

      {!storageConfigured ? (
        <Alert variant="warning" title="Preview/test mode · application storage unavailable" className="mt-6">
          <p>Your details cannot be saved in this deployment yet. No payment will be attempted. Configure the server-side Supabase backend and apply migration 0016 before accepting applications.</p>
        </Alert>
      ) : applicationAccessNeedsRecovery ? (
        <Alert variant="warning" title="Saved application could not be verified" className="mt-6">
          <p>No new application will be created from this page. Refresh once, sign in to the account used for the application, or contact the academy to recover the saved details.</p>
        </Alert>
      ) : initialApplication ? (
        <Alert variant="success" title="Saved as Pending Payment" className="mt-6">
          <p>Your details were loaded from the saved application. You can edit them below, then continue to the registration payment page.</p>
        </Alert>
      ) : null}

      <form action={action} className="mt-7 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-name">Full name</Label>
          <Input id="apply-name" name="name" autoComplete="name" defaultValue={initialApplication?.name ?? ""} maxLength={80} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-email">Email address</Label>
          <Input
            id="apply-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={initialApplication?.email ?? ""}
            readOnly={Boolean(initialApplication)}
            required
          />
          {initialApplication ? <p className="text-xs text-slate-600">This email is attached to the account created for the saved application.</p> : null}
        </div>
        {!initialApplication ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="apply-password">Password</Label>
            <Input id="apply-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
            <p className="text-xs leading-relaxed text-slate-600">At least 8 characters. Your password is handled by the account provider and is never stored in the application record.</p>
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-background">Academic background</Label>
          <Textarea id="apply-background" name="background" rows={5} maxLength={2000} defaultValue={initialApplication?.background ?? ""} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-board">Board</Label>
          <Input id="apply-board" name="board" autoComplete="organization-title" maxLength={100} placeholder="e.g. CBSE, ICSE, State Board" defaultValue={initialApplication?.board ?? ""} required />
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[#0A192F]">Classes you teach</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {CLASSES.map((level) => (
              <label key={level} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-[#FDFBF7] px-3 py-2 text-sm text-slate-800">
                <Checkbox name="classes" value={level} defaultChecked={initialApplication?.classes.includes(level)} />
                Class {level}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[#0A192F]">Subjects you would teach</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUBJECTS.map((subject) => (
              <label key={subject.id} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-[#FDFBF7] px-3 py-2 text-sm text-slate-800">
                <Checkbox name="subjects" value={subject.id} defaultChecked={initialApplication?.subjects.includes(subject.id)} />
                {subject.name}
              </label>
            ))}
          </div>
        </fieldset>

        <Alert variant="info" title="Registration fee" className="mt-1">
          <p>A registration fee of ₹699 is required to complete your tutor application.</p>
        </Alert>

        {result ? (
          <p role={result.ok ? "status" : "alert"} className={`text-sm leading-relaxed ${result.ok ? "text-emerald-800" : "text-rose-800"}`}>
            {result.note}
          </p>
        ) : null}
        <Button type="submit" loading={pending} disabled={pending || !storageConfigured || applicationAccessNeedsRecovery} className="self-start">
          {pending ? "Saving application…" : "Submit Tutor Application"}
        </Button>
      </form>
    </div>
  );
}
