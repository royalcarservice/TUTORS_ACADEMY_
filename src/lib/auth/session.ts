import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "student" | "tutor" | "admin";

export interface Identity {
  id: string;
  email: string | null;
  role: UserRole;
  displayName: string;
  isTestAccount: boolean;
}

/**
 * The identity for the current request, or null. Reads auth.getUser() (JWT
 * validated against the Auth server) and the profile row (RLS: own row only).
 * Null means NO IDENTITY. Callers never substitute a demo user.
 */
export async function getIdentity(): Promise<Identity | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, is_test_account")
    .eq("id", user.id)
    .maybeSingle();
  return {
    id: user.id,
    email: user.email ?? null,
    role: (profile?.role as UserRole | undefined) ?? "student",
    displayName: profile?.display_name ?? "",
    isTestAccount: profile?.is_test_account ?? true,
  };
}

/** Server-side guard for a page. The proxy already redirects; this is defence in depth + role check. */
export async function requireIdentity(role?: UserRole, nextPath?: string): Promise<Identity> {
  const identity = await getIdentity();
  if (!identity) redirect(`${ROUTES.login}?next=${encodeURIComponent(nextPath ?? ROUTES.student)}`);
  if (role && identity.role !== role) redirect(ROUTES[identity.role]);
  return identity;
}
