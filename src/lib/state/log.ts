/* THE LOGGER (Phase 5 · Step 7 · Part 5). One function, no dependency, no
 * third-party service, stdout only. Silence in the interface must never mean
 * silence in the system (P5-R8.9) — and the system must never observe the
 * student (P5-R8.11): a line carries an ERROR CLASS, a ROUTE/SCOPE and IDS
 * (subject ids, provider/slot names, a request-scoped identity id at most),
 * NEVER student content, never form values, never a person's data, never a
 * stack trace with request bodies in it. */

export interface FailureLine {
  /** Where: a route or a named scope ("region:progress", "provider:enrolment", "route:/subjects/[subject]/enter"). */
  scope: string;
  /** The error's class/name — "TypeError", "PostgrestError", "AuthApiError" — never its message verbatim if that could carry content. */
  errorClass: string;
  /** A short, content-free description chosen by the caller (not the raw message). */
  what: string;
  /** Opaque ids only (subject id, slot id, identity id). */
  ids?: Record<string, string | null | undefined>;
}

const CONTENT_KEYS = /email|password|name|display|token|cookie|body|content|message|text|value/i;

/** Class name of an unknown thrown value, without touching its message. */
export function errorClassOf(e: unknown): string {
  if (e && typeof e === "object") {
    const o = e as { name?: unknown; code?: unknown; constructor?: { name?: string } };
    if (typeof o.name === "string" && o.name) return typeof o.code === "string" && o.code ? `${o.name}(${o.code})` : o.name;
    // supabase-js returns plain PostgREST error objects ({ code, message, details, hint }) — the SQLSTATE is the class.
    if (typeof o.code === "string" && o.code) return `PostgrestError(${o.code})`;
    if (o.constructor?.name) return o.constructor.name;
  }
  return typeof e;
}

/** Emit one structured line to stderr. Returns the line (for tests). */
export function logFailure(line: FailureLine): string {
  const ids = Object.fromEntries(Object.entries(line.ids ?? {}).filter(([k]) => !CONTENT_KEYS.test(k)));
  const out = JSON.stringify({ level: "error", at: new Date().toISOString(), scope: line.scope, errorClass: line.errorClass, what: line.what, ids });
  console.error(out);
  return out;
}
