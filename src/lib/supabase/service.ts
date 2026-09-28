import { createClient as createBareClient } from "@supabase/supabase-js";

/**
 * SERVICE-ROLE CLIENT — bypasses RLS. Server only.
 *
 * The only file that reads SUPABASE_SERVICE_ROLE_KEY. Guarded three ways:
 *   1. throws if evaluated in a browser bundle,
 *   2. the variable has no NEXT_PUBLIC_ prefix so Next never inlines it client-side,
 *   3. no student-facing read path imports this module (grep in the 5.1 report).
 * Intended uses: admin tooling, migrations, account deletion. None exist yet.
 */
export function createServiceClient() {
  if (typeof window !== "undefined") throw new Error("service client must never run in the browser");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createBareClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
