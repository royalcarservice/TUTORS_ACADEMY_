"use client";

import { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import {
  Alert,
  Button,
  Checkbox,
  FieldHint,
  Input,
  Label,
  RadioCard,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { isMinorAt, ONBOARDING_COPY, parseDob } from "@/lib/auth/onboarding";

import { TutorGate } from "./tutor-gate";
import { signUp, type AuthResult } from "./actions";

/**
 * Registration form (Phase 5 · 5.1; age-gated in Phase 10 · Step 2,
 * DEC-038). Posts to the `signUp` server action (Supabase Auth).
 *
 * STUDENT PATH — the age gate: the form asks for the date of birth; the
 * SERVER computes the age (the browser's opinion is UX only). An adult
 * consents to the terms and privacy notice plainly — two unticked boxes,
 * never pre-checked — and is provisioned real. A minor lands
 * pending_guardian: the account is created, enrolment waits, and the
 * guardian gate at /register/guardian stands next (the form says so).
 *
 * TUTOR PATH — the invitation gate: self-service tutor registration is
 * refused with dignity (DEC-038); the action refuses it server-side too.
 *
 * RETIRED BY THIS STEP (declared, DEC-038): the test-era "Test accounts
 * only" alert and the test_ack checkbox — real onboarding stands, so the
 * form no longer claims every account is a test account. Test accounts
 * keep their own provisioning path (scripts/test-account.mjs, service
 * role), untouched.
 */
export function RegisterForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<AuthResult, FormData>(signUp, { error: null });
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [dob, setDob] = useState("");

  // UX only — the server recomputes the age from the same pure logic.
  const dobJudged = dob ? parseDob(dob, new Date()) : null;
  const isMinorUx = dobJudged?.ok ? isMinorAt(dobJudged.date, new Date()) : false;
  const isStudent = role === "student";

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        Student registration is age-gated under the DPDP Act 2023; tutors
        join by invitation.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {!configured && (
          <Alert variant="info" title="Account creation is not configured in this deployment">
            <p>The Supabase environment variables are not set, so no account can be created. Nothing is sent anywhere.</p>
          </Alert>
        )}
        {state.notice && (
          <Alert variant="success" title="Almost there" role="status">
            <p>{state.notice}</p>
          </Alert>
        )}
      </div>

      <form className="mt-6 flex flex-col gap-5" action={action}>
        <fieldset
          className="flex flex-col gap-2"
          onChange={(event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement && target.name === "role") {
              setRole(target.value === "tutor" ? "tutor" : "student");
            }
          }}
        >
          <legend className="mb-1 text-sm font-medium text-foreground">
            I am joining as
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <RadioCard
              name="role"
              value="student"
              title="Student"
              description="Learn inside a subject's environment." /* 5.8 gate fix: "submit work and track progress" named two capabilities that do not exist and used the banned "track progress" family (5.6) */
              defaultChecked
            />
            <RadioCard
              name="role"
              value="tutor"
              title="Tutor"
              description="Teach inside a subject's environment." /* 5.8 gate fix: "grade and manage your sessions" named capabilities that do not exist */
            />
          </div>
        </fieldset>

        {!isStudent && <TutorGate />}

        {isStudent && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-name">Full name</Label>
              <Input
                id="register-name"
                name="name"
                autoComplete="name"
                placeholder="Ananya Sharma"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-email">Email address</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              <FieldHint>
                Use at least 8 characters with a mix of letters and numbers.
              </FieldHint>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-dob">Date of birth</Label>
              <Input
                id="register-dob"
                name="date_of_birth"
                type="date"
                autoComplete="bday"
                max={new Date().toISOString().slice(0, 10)}
                min="1900-01-01"
                required
                onChange={(event) => setDob(event.target.value)}
              />
              <FieldHint>
                The server computes your age from this date. Under 18, a
                guardian confirms consent before you can enrol in subjects.
              </FieldHint>
              {isMinorUx && (
                <p role="note" className="text-sm leading-relaxed text-foreground-muted">
                  {ONBOARDING_COPY.minorFormNotice}
                </p>
              )}
            </div>

            {!isMinorUx && (
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Consent</legend>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <Checkbox name="terms_v1" required className="mt-0.5" />
                  <span className="text-sm leading-relaxed text-foreground-muted">
                    I have read and accept the{" "}
                    <Link href={ROUTES.legalTerms} className="font-semibold text-brand-600 hover:text-brand-900">
                      Terms of Academy Practice
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <Checkbox name="privacy_v1" required className="mt-0.5" />
                  <span className="text-sm leading-relaxed text-foreground-muted">
                    I have read and accept the{" "}
                    <Link href={ROUTES.legalPrivacy} className="font-semibold text-brand-600 hover:text-brand-900">
                      Privacy &amp; Data Protection Notice
                    </Link>
                    .
                  </span>
                </label>
              </fieldset>
            )}

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={pending || !configured} aria-describedby={state.error ? "register-outcome" : undefined}>
              <UserPlus className="size-4" aria-hidden />
              {pending ? "Creating…" : "Create account"}
            </Button>
          </>
        )}

        {/* 5.7 · ACTION scope: one sentence beside the control, running type, no panel. */}
        {state.error && (
          <p id="register-outcome" role="alert" data-form-outcome className="text-sm leading-relaxed text-foreground">
            {state.error}
          </p>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-semibold text-brand-600 hover:text-brand-900" /* P5-R9: brand-600 = the themed brand text token (was brand-700 = brass-600, 3.77:1 light) */
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
