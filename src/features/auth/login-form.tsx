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
export function LoginForm({ configured, next, error }: { configured: boolean; next: string; error?: string | null }) {
  const [state, action, pending] = useActionState<AuthResult, FormData>(signIn, { error: null });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Sign in
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        Use your Tutors Academy account to reach your portal.
      </p>

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
        {state.error && (
          <Alert variant="info" title="Could not sign in" role="alert">
            <p>{state.error}</p>
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

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending || !configured}>
          <LogIn className="size-4" aria-hidden />
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

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
