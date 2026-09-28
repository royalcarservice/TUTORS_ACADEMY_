/**
 * Supabase environment (P5-R1). Two PUBLIC values and one SERVER-ONLY secret.
 *
 *   NEXT_PUBLIC_SUPABASE_URL        public — project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   public — anon key; every read it performs is bounded by RLS
 *   SUPABASE_SERVICE_ROLE_KEY       SERVER ONLY — bypasses RLS. Read exclusively in service.ts.
 *                                   Never NEXT_PUBLIC_, never imported by a client component,
 *                                   never used for a student-facing read.
 *
 * When the public pair is absent, auth is NOT CONFIGURED: every entry point
 * says so in plain words. There is no fallback session, no demo identity.
 */
export function publicSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isAuthConfigured(): boolean {
  return publicSupabaseEnv() !== null;
}

export const AUTH_NOT_CONFIGURED_MESSAGE =
  "Authentication is not configured in this deployment (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set). No request was made and no session exists.";
