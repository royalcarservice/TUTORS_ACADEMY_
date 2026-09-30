/* P5-R9 — AN ERROR IS NEVER AN ABSENCE.
 * A missing value and a failed read must never be the same value. Every
 * reader in the data layer throws THIS when the driver reports an error, so
 * the caller can tell the difference and decide: page failure (primary) or
 * silence + log (region, via src/lib/state/isolate.ts). Never rendered. */
import { logFailure } from "./log";

/** A read that returned an error. Carries the table (an internal for the LOG only — never rendered) and the driver's code; never the row content. */
export class DataReadError extends Error {
  readonly code: string;
  constructor(readonly table: string, cause: { code?: string; message?: string; status?: number; name?: string }) {
    super(`read failed: ${table}`);
    this.name = "DataReadError";
    this.code = cause.code ?? (typeof cause.status === "number" ? String(cause.status) : "");
    const cls = cause.name && cause.name !== "Error" ? cause.name : "PostgrestError";
    // The system knows what the interface will not say (P5-R8.9/11): class + table, never a row.
    logFailure({ scope: `read:${table}`, errorClass: `${cls}(${this.code || "?"})`, what: "read failed — the caller decides: page failure (primary) or silence (region)" });
  }
}

/**
 * auth.getUser() answers "no user" for two unrelated reasons: NO SESSION
 * (missing/expired/invalid token — status 400/401/403, a state) and a FAILED
 * READ (Auth server unreachable or 5xx — an error). Only the first is an
 * absence. Callers pass the error through here before treating null as "not
 * signed in".
 */
export function isIdentityReadFailure(error: { name?: string; status?: number } | null | undefined): boolean {
  if (!error) return false;
  if (error.name === "AuthRetryableFetchError") return true;
  const status = typeof error.status === "number" ? error.status : 0;
  return status === 0 || status >= 500;
}
