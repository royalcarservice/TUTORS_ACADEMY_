import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/login-form";
import { isAuthConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Tutors Academy to reach your portal.",
};

/** Server component: reads configuration + the ?next target, renders the client form. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/student";
  const error = typeof sp.error === "string" ? sp.error : null;
  return <LoginForm configured={isAuthConfigured()} next={next} error={error} />;
}
