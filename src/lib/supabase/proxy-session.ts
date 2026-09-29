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
    /* 5.7 · Part 6: WHY they are at /login is knowable here and nowhere else.
       Auth cookies present but no valid user = a session that ENDED (expired
       or signed out elsewhere); no auth cookies at all = never signed in. The
       login page turns `reason=ended` into one plain sentence; `next` still
       carries where they were, so signing in returns them there (a GET —
       never a replay of a write). */
    const hadSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.search = `?next=${encodeURIComponent(pathname)}${hadSession ? "&reason=ended" : ""}`;
    return NextResponse.redirect(url);
  }
  return response;
}
