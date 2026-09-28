import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicSupabaseEnv } from "./env";

/**
 * Server client for Server Components, Route Handlers and Server Actions.
 * Session lives in HTTP cookies (P5-R1: no localStorage, no client-only state).
 * Returns null when auth is not configured — callers must treat null as
 * "no identity", never as "anonymous student".
 */
export async function createClient() {
  const env = publicSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Server Components cannot set cookies; the proxy refreshes the session instead. */
        }
      },
    },
  });
}
