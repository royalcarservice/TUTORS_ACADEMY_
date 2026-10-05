import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/login-form";
import { STATE_COPY } from "@/components/state/copy";
import { getSubject } from "@/lib/subjects/subjects";
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
  /* 5.7 · Part 6: one plain sentence about WHY this page, when there is a why.
     `reason=ended` is set only by the proxy when auth cookies were present
     but no longer valid — so "that session ended" is a fact, not a guess. */
  const where = whereLabel(next);
  const context = sp.reason === "ended" ? STATE_COPY.sessionEnded(where) : typeof sp.next === "string" && next !== "/student" ? STATE_COPY.signInToContinue(where) : null;
  return <LoginForm configured={isAuthConfigured()} next={next} error={error} context={context} />;
}

/** A human name for the return path — a subject's name, or "your subjects". Never echoes an arbitrary path onto the page. */
function whereLabel(next: string): string {
  const m = next.match(/^\/subjects\/([a-z-]+)/);
  const s = m ? getSubject(m[1]) : null;
  if (s) return s.name;
  if (next.startsWith("/student/account") || next.startsWith("/tutor/account")) return "your account";
  const e = next.match(/^\/tutor\/([a-z-]+)\/environment/); // 6.5 (P6-R15): a write's settling GET, named as the place it is
  const es = e ? getSubject(e[1]) : null;
  if (es) return `the ${es.name} environment`;
  if (next.startsWith("/tutor")) return "your students"; // 6.2 (P6-R5): the tutor's return path opens their students, not "your subjects"
  return "your subjects";
}
