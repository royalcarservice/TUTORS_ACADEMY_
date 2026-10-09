/**
 * LIVEKIT READINESS — Phase 7 · Step 2 (reconnaissance applied, DEC-023).
 *
 * The only thing this module knows about LiveKit is what
 * docs/proposed/livekit_recon.md recorded: three env variable NAMES, and the
 * fact that a room can be called "configured" only when all three exist.
 *
 * PURE BY DESIGN: the caller (a server component) reads process.env and hands
 * the values in. This file never touches process.env, never logs a value, and
 * never echoes one into an error or a sentence. Variable NAMES only — the
 * security rule from the Phase 6 gate runs applies to LiveKit exactly.
 *
 * NO livekit-client dependency exists in this repository, and no connection
 * code ships with this step: nothing can connect (no credentials exist; the
 * live-classroom module is not live). The surface renders the standby state
 * (src/components/live/live-stage.tsx) until a wiring step — session table,
 * credentials, module flip — is ruled. This module is the seam that step
 * reads first.
 */

/** The three env variable NAMES (never their values). */
export const LIVEKIT_ENV_KEYS = {
  url: "LIVEKIT_URL",
  apiKey: "LIVEKIT_API_KEY",
  apiSecret: "LIVEKIT_API_SECRET",
} as const;

export interface LiveKitReadiness {
  /** true only when every key holds a non-empty value. */
  configured: boolean;
  /** The NAMES of the missing (or empty) keys — safe to render or log. */
  missing: readonly string[];
}

/** Pure readiness check. Same env object in, same answer out. */
export function liveKitReadiness(env: Readonly<Record<string, string | undefined>>): LiveKitReadiness {
  const missing = Object.values(LIVEKIT_ENV_KEYS).filter((key) => {
    const v = env[key];
    return typeof v !== "string" || v.trim().length === 0;
  });
  return { configured: missing.length === 0, missing };
}
