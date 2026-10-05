import { errorClassOf, logFailure } from "@/lib/state/log";
import { isIdentityReadFailure } from "@/lib/state/read-error";
import { returnPathFor } from "@/lib/state/settle";
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
    const { data, error } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
    /* P5-R9: an unreachable Auth server is NOT "no session". Redirecting here
       would claim "That session ended" about a read that failed. Let the
       request through unchanged: the page's own identity read throws the same
       failure and the honest page renders (never a fabricated sign-out). */
    if (!userId && isIdentityReadFailure(error)) {
      logFailure({ scope: "proxy:getUser", errorClass: errorClassOf(error), what: "identity read failed — passed through, page decides", ids: { path: pathname } });
      return response;
    }
  }

  if (isProtectedPath(pathname) && !userId) {
    /* 5.7 · Part 6: WHY they are at /login is knowable here and nowhere else.
       Auth cookies present but no valid user = a session that ENDED (expired
       or signed out elsewhere); no auth cookies at all = never signed in. The
       login page turns `reason=ended` into one plain sentence; `next` still
       carries where they were, so signing in returns them there (a GET —
       never a replay of a write). 6.5 (P6-R15): when the request that met the
       boundary was itself a WRITE (a form POST after the session ended),
       `next` is the write's SETTLING GET, not the write's URL — the write URL
       answers a GET with 405, a dead end after signing in. */
    const hadSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.search = `?next=${encodeURIComponent(returnPathFor(pathname, request.method))}${hadSession ? "&reason=ended" : ""}`;
    return NextResponse.redirect(url);
  }
  return response;
}
