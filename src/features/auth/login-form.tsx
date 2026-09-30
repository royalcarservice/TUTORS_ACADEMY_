"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogIn } from "lucide-react";

import {
  Alert,
  Button,
  Checkbox,
  Input,
  Label,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";

import { signIn, type AuthResult } from "./actions";

/**
 * Sign-in form (Phase 5 · 5.1). Posts to the `signIn` server action, which
 * creates a COOKIE session via Supabase Auth (@supabase/ssr). When the
 * deployment has no Supabase configuration the action says so in plain words
 * and no session is created — there is no demo identity.
 *
 * Phase 5 accounts are TEST ACCOUNTS ONLY (ruling P5-R1 Part 7).
 */
export function LoginForm({ configured, next, error, context }: { configured: boolean; next: string; error?: string | null; context?: string | null }) {
  const [state, action, pending] = useActionState<AuthResult, FormData>(signIn, { error: null });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Sign in
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        Use your Tutors Academy account to reach your portal.
      </p>
      {/* 5.7 · Part 6: why this page, in the same type — no panel, no colour. */}
      {context && (
        <p data-login-context className="mt-2 text-sm leading-relaxed text-foreground">
          {context}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {!configured && (
          <Alert variant="info" title="Authentication is not configured in this deployment">
            <p>
              The Supabase environment variables are not set, so signing in
              cannot create a session. Nothing is sent anywhere.
            </p>
          </Alert>
        )}
        {configured && (
          <Alert variant="info" title="Test accounts only">
            <p>
              Phase 5 sign-in is for test accounts. Real student onboarding
              waits on the privacy, terms and data-protection work.
            </p>
          </Alert>
        )}
        {error === "confirmation" && (
          <Alert variant="info" title="That confirmation link did not work">
            <p>It may have expired. Sign in, or create the account again.</p>
          </Alert>
        )}
      </div>

      <form className="mt-6 flex flex-col gap-4" action={action}>
        <input type="hidden" name="next" value={next} />
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

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending || !configured} aria-describedby={state.error ? "login-outcome" : undefined}>
          <LogIn className="size-4" aria-hidden />
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        {/* 5.7 · ACTION scope: the outcome is ONE sentence beside the control, in the
            running type — not a panel (the 5.1 info panel's body sat at 4.21:1 and
            carried a verdict title). role=alert so it is announced when it arrives. */}
        {state.error && (
          <p id="login-outcome" role="alert" data-form-outcome className="text-sm leading-relaxed text-foreground">
            {state.error}
          </p>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-foreground-muted">
        New to Tutors Academy?{" "}
        <Link
          href={ROUTES.register}
          className="font-semibold text-brand-600 hover:text-brand-900" /* P5-R9: brand-600 = the themed brand text token (was brand-700 = brass-600, 3.77:1 light) */
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
