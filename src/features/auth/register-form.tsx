"use client";

import Link from "next/link";
import { useState } from "react";
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

/**
 * Registration form.
 *
 * Foundation scope: role selection, validation attributes and layout only.
 * Nothing is posted and no account is created — the identity service is a
 * later task.
 */
export function RegisterForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        One account covers every portal. You can change your role later.
      </p>

      <div className="mt-6">
        {submitted ? (
          <Alert variant="success" title="Form validated — nothing was sent">
            <p>
              Your details passed the client-side checks. No account was
              created because the identity service is not part of this
              foundation build.
            </p>
          </Alert>
        ) : (
          <Alert variant="info" title="Account creation is not connected yet">
            <p>
              This screen is part of the foundation build. The fields work and
              validate, but submitting does not call an API.
            </p>
          </Alert>
        )}
      </div>

      <form
        className="mt-6 flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
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
          <Checkbox name="terms" required className="mt-0.5" />
          <span className="text-sm leading-relaxed text-foreground-muted">
            I agree to the terms of use and privacy policy.{" "}
            <span className="text-foreground-subtle">
              (Policy pages ship with the legal module.)
            </span>
          </span>
        </label>

        <Button type="submit" size="lg" className="mt-1 w-full">
          <UserPlus className="size-4" aria-hidden />
          Create account
        </Button>
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
