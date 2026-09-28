"use client";

import { createBrowserClient } from "@supabase/ssr";

import { publicSupabaseEnv } from "./env";

/** Browser client. Anon key only; every query is bounded by RLS. Returns null when unconfigured. */
export function createClient() {
  const env = publicSupabaseEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.anonKey);
}
