"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn } from "lucide-react";

import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Input,
  Label,
} from "@/components/ui";
import { PORTAL_ENTRIES } from "@/config/navigation";
import { ROUTES } from "@/config/routes";

/**
 * Sign-in form.
 *
 * Foundation scope: fully interactive and validated markup, but deliberately
 * NOT wired to any authentication service — nothing is sent anywhere and no
 * session is created. Wiring it to a real provider is the next task.
 */
export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Sign in
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        Use your Tutors Academy account to reach your portal.
      </p>

      <div className="mt-6">
        {submitted ? (
          <Alert variant="success" title="Form validated — nothing was sent">
            <p>
              The form captured your input correctly. There is no
              authentication service in this foundation build, so no request
              was made and no session was created.
            </p>
          </Alert>
        ) : (
          <Alert variant="info" title="Authentication is not connected yet">
            <p>
              This screen is part of the foundation build. The fields work and
              validate, but submitting does not call an API.
            </p>
          </Alert>
        )}
      </div>

      <form
        className="mt-6 flex flex-col gap-4"
        noValidate={false}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="login-password">Password</Label>
            <button
              type="button"
              disabled
              title="Password reset ships with the authentication service"
              className="text-sm font-medium text-foreground-subtle disabled:cursor-not-allowed"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 pt-1">
          <Checkbox name="remember" defaultChecked />
          <span className="text-sm text-foreground-muted">
            Keep me signed in on this device
          </span>
        </label>

        <Button type="submit" size="lg" className="mt-2 w-full">
          <LogIn className="size-4" aria-hidden />
          Sign in
        </Button>
      </form>

      <Divider label="or go directly to" className="my-8" />

      <ul className="grid gap-2 sm:grid-cols-3">
        {PORTAL_ENTRIES.map((entry) => (
          <li key={entry.id}>
            <Link
              href={entry.href}
              className="block rounded-lg border border-border px-3 py-2.5 text-center text-sm font-medium text-foreground-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {entry.id.charAt(0).toUpperCase() + entry.id.slice(1)}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        New to Tutors Academy?{" "}
        <Link
          href={ROUTES.register}
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
