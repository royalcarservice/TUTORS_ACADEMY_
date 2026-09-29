import { errorClassOf, logFailure } from "./log";

/* REGION / PROVIDER ISOLATION (Phase 5 · Step 7 · Part 4) — ONE pattern,
 * named once, used in both places:
 *   · 5.4's providers (collectCandidates): a provider that throws contributes
 *     nothing; the others continue; its id is reported as failed.
 *   · 5.3/5.5's regions (resolveSlots, resolveEnvironmentSlots): a slot whose
 *     loader or resolver throws renders NOTHING — like an unpopulated region —
 *     and the failure is LOGGED (P5-R8.9).
 * The interface is silent; the system is not. Never used for the PRIMARY
 * answer: that has its own rule (benign action, then honest page failure). */

export interface Isolated<T> {
  ok: true; value: T;
}
export interface IsolatedFailure {
  ok: false; errorClass: string;
}

/** Run `fn`; a throw becomes a logged failure instead of propagating. */
export function isolate<T>(scope: string, fn: () => T, ids?: Record<string, string | null | undefined>): Isolated<T> | IsolatedFailure {
  try {
    return { ok: true, value: fn() };
  } catch (e) {
    const errorClass = errorClassOf(e);
    logFailure({ scope, errorClass, what: "isolated failure — rendered nothing", ids });
    return { ok: false, errorClass };
  }
}

/** Async twin for loaders that await data. */
export async function isolateAsync<T>(scope: string, fn: () => Promise<T>, ids?: Record<string, string | null | undefined>): Promise<Isolated<T> | IsolatedFailure> {
  try {
    return { ok: true, value: await fn() };
  } catch (e) {
    const errorClass = errorClassOf(e);
    logFailure({ scope, errorClass, what: "isolated failure — rendered nothing", ids });
    return { ok: false, errorClass };
  }
}
