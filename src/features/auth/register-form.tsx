"use client";

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

import { signUp, type AuthResult } from "./actions";

/**
 * Registration form (Phase 5 · 5.1). Posts to the `signUp` server action
 * (Supabase Auth). Role is student or tutor; admin is never self-serve.
 *
 * PHASE 5: TEST ACCOUNTS ONLY (ruling P5-R1 Part 7). No privacy policy, terms
 * or contact route exist yet, so this form does not pretend to collect
 * agreement to them. Real onboarding is out of scope for all of Phase 5.
 */
export function RegisterForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<AuthResult, FormData>(signUp, { error: null });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        One account covers every portal. You can change your role later.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {!configured && (
          <Alert variant="info" title="Account creation is not configured in this deployment">
            <p>The Supabase environment variables are not set, so no account can be created. Nothing is sent anywhere.</p>
          </Alert>
        )}
        {configured && (
          <Alert variant="info" title="Test accounts only">
            <p>
              Accounts created here are test accounts. There is no privacy
              policy or terms of use yet, so this is not open to real students.
            </p>
          </Alert>
        )}
        {state.notice && (
          <Alert variant="success" title="Almost there" role="status">
            <p>{state.notice}</p>
          </Alert>
        )}
      </div>

      <form className="mt-6 flex flex-col gap-5" action={action}>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">
            I am joining as
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <RadioCard
              name="role"
              value="student"
              title="Student"
              description="Learn, submit work and track progress."
              defaultChecked
            />
            <RadioCard
              name="role"
              value="tutor"
              title="Tutor"
              description="Teach, grade and manage your sessions."
            />
          </div>
        </fieldset>

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

        <label className="flex cursor-pointer items-start gap-2.5">
          <Checkbox name="test_ack" required className="mt-0.5" />
          <span className="text-sm leading-relaxed text-foreground-muted">
            I understand this is a test account and may be deleted.
          </span>
        </label>

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={pending || !configured} aria-describedby={state.error ? "register-outcome" : undefined}>
          <UserPlus className="size-4" aria-hidden />
          {pending ? "Creating…" : "Create test account"}
        </Button>
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
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
