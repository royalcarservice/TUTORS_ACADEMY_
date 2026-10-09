import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { DataReadError, isIdentityReadFailure } from "@/lib/state/read-error";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "student" | "tutor" | "admin";

export interface Identity {
  id: string;
  email: string | null;
  role: UserRole;
  displayName: string;
  isTestAccount: boolean;
  approvalStatus: "approved" | "pending_payment" | "pending_approval" | "rejected";
}

/**
 * The identity for the current request, or null. Reads auth.getUser() (JWT
 * validated against the Auth server) and the profile row (RLS: own row only).
 * Null means NO IDENTITY. Callers never substitute a demo user.
 */
export async function getIdentity(): Promise<Identity | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  // P5-R9: "no session" is an absence; an unreachable Auth server is a failed read. They are never the same value.
  if (!user && isIdentityReadFailure(authError)) throw new DataReadError("auth.getUser", authError!);
  if (!user) return null;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, display_name, is_test_account, approval_status")
    .eq("id", user.id)
    .maybeSingle();
  // P5-R9: a failed profile read must not become role "student" / an empty name.
  if (profileError) throw new DataReadError("profiles", profileError);
  return {
    id: user.id,
    email: user.email ?? null,
    role: (profile?.role as UserRole | undefined) ?? "student",
    displayName: profile?.display_name ?? "",
    isTestAccount: profile?.is_test_account ?? true,
    approvalStatus: (profile?.approval_status as Identity["approvalStatus"] | undefined) ?? "pending_approval",
  };
}

/** Server-side guard for a page. The proxy already redirects; this is defence in depth + role check. */
export async function requireIdentity(role?: UserRole, nextPath?: string): Promise<Identity> {
  const identity = await getIdentity();
  if (!identity) redirect(`${ROUTES.login}?next=${encodeURIComponent(nextPath ?? ROUTES.student)}`);
  if (role && identity.role !== role) redirect(ROUTES[identity.role]);
  if (identity.role === "tutor" && identity.approvalStatus !== "approved") {
    redirect(ROUTES.tutorApplyPayment);
  }
  return identity;
}
