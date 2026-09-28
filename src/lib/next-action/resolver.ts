/**
 * THE NEXT-ACTION RESOLVER (Phase 5 · Step 4) — A PURE FUNCTION.
 * --------------------------------------------------------------------------
 * Given a student's state, a set of candidates and a clock value, returns
 * EXACTLY ONE candidate (or null, which the providers make impossible — see
 * the origin provider). No I/O, no clock read, no database, no randomness,
 * no process.env. Same input → deep-equal output, across requests and
 * restarts. Every answer is reconstructable: `explainResolution` returns the
 * verdict for every candidate considered.
 *
 * THE PRIORITY ORDER IS DECLARED, NOT COMPUTED. Urgency means EXPIRY and
 * nothing else — not importance, not interest, not a score.
 *
 *   TIER 1 — NOW       available only in a window · REQUIRES expiresAt
 *   TIER 2 — SOON      scheduled, or just finished · REQUIRES a real timestamp (`at`)
 *   TIER 3 — WHENEVER  durable: resume or begin · everything shipped today
 *   TIER 4 — ORIGIN    no enrolment: the choice · requires nothing
 *
 * 5.1's six rungs map onto these tiers without contradiction:
 *   rung 1 class now, rung 2 class within the hour → Tier 1 (the window)
 *   rung 3 work due                                 → Tier 2
 *   rung 4 resume, rung 5 begin                     → Tier 3 (entered first)
 *   rung 6 choose                                   → Tier 4
 *
 * The resolver may NOT return a list. There is no resolveNextActions. If a
 * future phase needs three things on screen, that is a composition decision
 * taken deliberately in a design step — not a signature changed in passing.
 */

/* ── types ─────────────────────────────────────────────────────────────── */

export type Tier = 1 | 2 | 3 | 4;

/** Grows per phase. Each source is owned by the phase that adds it. */
export type CandidateSource = "enrolment" | "origin" | "class" | "recording" | "assignment" | "assistant";

/**
 * Grows per phase, BUT a new kind may only be added with a treatment that
 * already exists in 2.5's primitives (see TREATMENT below).
 */
export type CandidateKind = "join" | "attend" | "begin" | "resume" | "choose";

export interface Candidate {
  /** Stable, namespaced, e.g. "enrolment:physics:resume". */
  id: string;
  source: CandidateSource;
  /** DECLARED by the provider, never computed. */
  tier: Tier;
  kind: CandidateKind;
  /**
   * The src/config/modules id whose `status === "live"` this candidate
   * depends on. The provider consults the registry before emitting; the
   * resolver checks it again so a fixture (or a provider that forgot) is
   * rejected with the reason on record.
   */
  capability: string;
  /** Present = the surface may carry subject identity (mark, accent, environment name). */
  subjectId?: string;
  /** Small mono line above the title. */
  eyebrow: string;
  /** The instruction. */
  title: string;
  /** Derived from POPULATED fields only. Absent = silence, never a substitute phrase. */
  detail?: string;
  /** The action label. */
  cta: string;
  /** MUST resolve for this student TODAY. */
  href: string;
  /** PRESENCE = time-bound. Absence = durable. Required for Tier 1. */
  expiresAt?: string;
  /** The scheduled / finished moment. Required for Tier 2. */
  at?: string;
  /** Tier 3 sort inputs — populated by the provider from real rows only. */
  lastEnteredAt?: string;
  enrolledAt?: string;
}

/** What the resolver needs to know about the student. All plain data. */
export interface ResolverState {
  /** Subject ids in CONFIG order — the deterministic tie-break. */
  subjectOrder: readonly string[];
  /** Module ids whose status is "live" in src/config/modules. */
  liveCapabilities: readonly string[];
  /** hrefs that resolve for THIS student today. A candidate outside it is dangling. */
  resolvesToday: (href: string) => boolean;
}

export type Verdict =
  | { accepted: true; sortKey: string }
  | { accepted: false; reason: string };

export interface Considered {
  candidate: Candidate;
  verdict: Verdict;
}

export interface Resolution {
  winner: Candidate | null;
  considered: Considered[];
}

/* ── constants ─────────────────────────────────────────────────────────── */

/**
 * TIER 1 WINDOW. A class is "now" from this many minutes before it starts
 * until it ends (`expiresAt` = class end). Default 60. P7's to tune — with a
 * ruling, not in passing.
 */
export const TIER_1_WINDOW_BEFORE_START_MINUTES = 60;

/**
 * KIND → TREATMENT. Finite, and every value must already exist in 2.5's
 * primitives. Today all kinds share one treatment because there is no reason
 * to differ. Adding a kind here with a treatment that is not in this union is
 * a type error on purpose.
 */
export type Treatment = "primary-button";
export const TREATMENT: Record<CandidateKind, Treatment> = {
  join: "primary-button",
  attend: "primary-button",
  begin: "primary-button",
  resume: "primary-button",
  choose: "primary-button",
};

/* ── helpers (pure) ────────────────────────────────────────────────────── */

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function validTime(iso: string | undefined): number | null {
  if (typeof iso !== "string" || !ISO.test(iso)) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}
const pad = (n: number, w = 15) => String(n).padStart(w, "0");
const MAX_T = 9_999_999_999_999; // so "most recent first" sorts ascending as a string

/* ── validation ────────────────────────────────────────────────────────── */

/**
 * Decide whether one candidate may compete, and with which sort key.
 * Sort keys are strings that sort ASCENDING; lower wins. They are shown on
 * /dev/next-action so every answer can be reconstructed by eye.
 */
export function judge(c: Candidate, state: ResolverState, nowIso: string): Verdict {
  const now = validTime(nowIso);
  if (now === null) return { accepted: false, reason: "resolver received a malformed clock value" };
  if (!c || typeof c !== "object") return { accepted: false, reason: "not a candidate" };
  if (![1, 2, 3, 4].includes(c.tier)) return { accepted: false, reason: `tier must be 1–4, got ${String(c.tier)}` };
  if (!(c.kind in TREATMENT)) return { accepted: false, reason: `kind "${String(c.kind)}" has no treatment in 2.5's primitives` };
  if (!c.title || !c.cta || !c.href) return { accepted: false, reason: "title, cta and href are required" };
  if (!state.liveCapabilities.includes(c.capability)) return { accepted: false, reason: `capability "${c.capability}" is not live in src/config/modules` };
  if (!state.resolvesToday(c.href)) return { accepted: false, reason: `href ${c.href} does not resolve for this student today` };
  const subjectIx = c.subjectId ? state.subjectOrder.indexOf(c.subjectId) : -1;
  if (c.subjectId && subjectIx < 0) return { accepted: false, reason: `subject "${c.subjectId}" is not in the subject config` };
  const tie = pad(subjectIx < 0 ? 99 : subjectIx, 2);

  if (c.expiresAt !== undefined) {
    const exp = validTime(c.expiresAt);
    if (exp === null) return { accepted: false, reason: `expiresAt "${c.expiresAt}" is not a valid ISO timestamp` };
    if (exp <= now) return { accepted: false, reason: `expired at ${c.expiresAt}` };
  }
  if (c.at !== undefined && validTime(c.at) === null) return { accepted: false, reason: `at "${c.at}" is not a valid ISO timestamp` };

  switch (c.tier) {
    case 1: {
      // NO EXPIRY, NO TIER 1. Rejected, never demoted — "urgent" is not a decoration.
      if (c.expiresAt === undefined) return { accepted: false, reason: "Tier 1 requires expiresAt (no expiry, no Tier 1) — rejected, not demoted" };
      return { accepted: true, sortKey: `1:${pad(validTime(c.expiresAt)!)}:${tie}` };
    }
    case 2: {
      if (c.at === undefined) return { accepted: false, reason: "Tier 2 requires a real timestamp (`at`)" };
      return { accepted: true, sortKey: `2:${pad(validTime(c.at)!)}:${tie}` };
    }
    case 3: {
      // ENTERED BEATS NEVER-ENTERED; among entered, most recent first; among
      // never-entered, earliest enrolment first; ties by config order.
      if (c.lastEnteredAt !== undefined && c.lastEnteredAt !== null) {
        const t = validTime(c.lastEnteredAt);
        if (t === null) return { accepted: false, reason: `lastEnteredAt "${c.lastEnteredAt}" is not a valid ISO timestamp` };
        return { accepted: true, sortKey: `3:entered:${pad(MAX_T - t)}:${tie}` };
      }
      // A durable action needs no timestamp to be TRUE; an ABSENT enrolledAt
      // sorts last among never-entered. A PRESENT but malformed one is rejected.
      if (c.enrolledAt === undefined || c.enrolledAt === null) return { accepted: true, sortKey: `3:never-entered:${pad(MAX_T)}:${tie}` };
      const e = validTime(c.enrolledAt);
      if (e === null) return { accepted: false, reason: `enrolledAt "${c.enrolledAt}" is not a valid ISO timestamp` };
      return { accepted: true, sortKey: `3:never-entered:${pad(e)}:${tie}` };
    }
    case 4:
      return { accepted: true, sortKey: `4:${tie}` };
  }
}

/* ── the public API ────────────────────────────────────────────────────── */

/** Every candidate's verdict plus the winner. Pure. */
export function explainResolution(state: ResolverState, candidates: readonly Candidate[], nowIso: string): Resolution {
  const considered: Considered[] = candidates.map((candidate) => ({ candidate, verdict: judge(candidate, state, nowIso) }));
  const accepted = considered
    .filter((x): x is Considered & { verdict: { accepted: true; sortKey: string } } => x.verdict.accepted)
    .sort((a, b) => (a.verdict.sortKey < b.verdict.sortKey ? -1 : a.verdict.sortKey > b.verdict.sortKey ? 1 : a.candidate.id.localeCompare(b.candidate.id)));
  return { winner: accepted[0]?.candidate ?? null, considered };
}

/**
 * EXACTLY ONE. Returns null only when no candidate survives — which the
 * origin provider makes impossible in the product.
 */
export function resolveNextAction(state: ResolverState, candidates: readonly Candidate[], nowIso: string): Candidate | null {
  return explainResolution(state, candidates, nowIso).winner;
}
