/* EVERY WRITE HAS A GET THAT SETTLES IT (P6-R15, Phase 6 · Step 5).
 *
 * A write's outcome can be unknown (network cut), refused (session ended),
 * or failed. In every case the person is sent to a READING that shows what
 * is actually true — never to the write's own URL, which answers a GET with
 * 405 and is a dead end. This table is that rule made explicit: a write that
 * is not listed here does not ship (the check for Phase 7's writes).
 *
 *   write (POST)                              settling GET
 *   /subjects/[subject]/enter                 /subjects/[subject]      (5.5; not behind the proxy's boundary)
 *   /tutor/[subject]/environment/shape        /tutor/[subject]/environment (6.4)
 *   /subjects/[subject]/live/settle           /subjects/[subject]/live (7.5 — the settlement surface re-reads the truth)
 *   /auth/signout                             /login                   (the login page IS the state)
 *
 * Used by the proxy: when a protected write arrives without a session, the
 * `next` it hands to /login is the settling GET, so signing in again lands
 * on the settled state (a read) and never replays the write. */

const WRITES: ReadonlyArray<{ pattern: RegExp; settlesAt: (m: RegExpMatchArray) => string }> = [
  { pattern: /^\/subjects\/([a-z-]+)\/enter$/, settlesAt: (m) => `/subjects/${m[1]}` },
  { pattern: /^\/tutor\/([a-z-]+)\/environment\/shape$/, settlesAt: (m) => `/tutor/${m[1]}/environment` },
  { pattern: /^\/subjects\/([a-z-]+)\/live\/settle$/, settlesAt: (m) => `/subjects/${m[1]}/live` },
  { pattern: /^\/auth\/signout$/, settlesAt: () => "/login" },
];

/** The GET that settles a write at `pathname`; null when the path is not a known write. */
export function settlingGetFor(pathname: string): string | null {
  for (const w of WRITES) { const m = pathname.match(w.pattern); if (m) return w.settlesAt(m); }
  return null;
}

/** Where a request should return to after sign-in: a write's settling GET, otherwise the path itself. */
export function returnPathFor(pathname: string, method: string): string {
  if (method === "GET" || method === "HEAD") return pathname;
  return settlingGetFor(pathname) ?? pathname;
}
