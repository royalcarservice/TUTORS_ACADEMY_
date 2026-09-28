import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/config/routes";

import { publicSupabaseEnv } from "./env";

/** Route prefixes that require an identity: something here must be remembered (P5-R1 boundary). */
export const PROTECTED_PREFIXES = [ROUTES.student, ROUTES.tutor, ROUTES.admin] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Refreshes the cookie session on every matched request and enforces the
 * visitor → student boundary: a protected path with no user redirects to
 * /login?next=<path>. Public paths (/, /subjects, /dev/*) are never gated.
 * When auth is unconfigured there is no identity, so protected paths still
 * redirect — /login then states plainly that auth is not configured.
 */
export async function updateSession(request: NextRequest) {
  const env = publicSupabaseEnv();
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  let userId: string | null = null;
  if (env) {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    // getUser() validates the JWT against the Auth server; never trust getSession() here.
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }

  if (isProtectedPath(pathname) && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return response;
}
