/**
 * HONEST RELATIVE DATES (moved here from the shell in 5.4 so the providers
 * and the surface share one phrase). Nothing finer than a day is claimed,
 * and a phrase is only produced from a REAL timestamp — callers pass silence
 * (undefined) when the field is null. Pure: `now` is an argument.
 */
const DAY = 86_400_000;

function calendarDays(fromIso: string, nowIso: string): number {
  const a = new Date(fromIso), b = new Date(nowIso);
  const ad = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bd = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.max(0, Math.round((bd - ad) / DAY));
}

function absDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** "today" · "yesterday" · "3 days ago" · "on 12 Sep 2026". Returns null for an invalid timestamp — never a filler phrase. */
export function whenPhrase(iso: string, nowIso: string): string | null {
  if (!Number.isFinite(Date.parse(iso)) || !Number.isFinite(Date.parse(nowIso))) return null;
  const d = calendarDays(iso, nowIso);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d <= 14) return `${d} days ago`;
  return `on ${absDate(iso)}`;
}
