/**
 * CANDIDATE PROVIDERS + THE PROVIDER CONTRACT (Phase 5 · Step 4 · Part 2)
 * --------------------------------------------------------------------------
 * A provider turns a student's real rows into zero or more Candidates. It is
 * a PURE FUNCTION of `ProviderInput` — the data layer and the clock are
 * passed in by the caller (src/lib/student/data.ts), never read here.
 *
 * ═══ THE CONTRACT — read before adding a provider ═══════════════════════
 *
 * A provider MUST:
 *   • consult src/config/modules FIRST via `isLive(<module id>)` and return
 *     [] unless the capability its candidates depend on is `live`. This is
 *     the same registry that labels the homepage "not built yet"; it gates
 *     the student's instructions with the same truth.
 *   • emit only candidates whose `href` resolves for THIS student TODAY —
 *     an enrolled subject's environment, a class they are on the roster for,
 *     a recording they may play. Never a route that exists "in general".
 *   • DECLARE its tier. Tier 1 needs `expiresAt`; Tier 2 needs `at`; Tier 3
 *     needs `lastEnteredAt` (resume) or `enrolledAt` (begin).
 *   • derive `detail` from POPULATED fields only. A null field is silence.
 *   • use a `kind` that already has a treatment in resolver.ts TREATMENT.
 *   • be deterministic: same input, same output, same order.
 *
 * A provider must NEVER:
 *   • read the clock, the database, cookies or process.env — take them from
 *     the input.
 *   • compute a tier from importance, interest, a score or a model. Tiers
 *     are declared per source; urgency is expiry and nothing else.
 *   • render a count, percentage, score, streak, level, XP or badge in any
 *     string; write a clock sentence ("in 20 minutes") without `expiresAt`;
 *     use guilt or urgency theatre; personalise or rank with AI.
 *   • return more than the resolver can rank — it emits candidates, the
 *     resolver picks ONE. It never picks for the resolver by emitting only
 *     its favourite with a fake tier.
 *   • throw for missing data. Missing data means no candidate.
 *
 * A provider must PASS, before its candidates are accepted:
 *   • the resolver's `judge()` for every candidate it can emit (tests in
 *     scripts/test-next-action.mjs prove it for each kind);
 *   • an href check: 200 for the student it was emitted for, and 404 or a
 *     redirect for anyone else (Test 12's method);
 *   • the report-only sweep (digits, %, count, streak, minute(s) without
 *     expiresAt, times) and the 4.1 / 4.7 copy sweeps on its strings;
 *   • the shell harness unchanged: 2.24 ratio, one primary, fold gate.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { PLATFORM_MODULES } from "../../config/modules";
import type { Enrolment, EnvironmentState, SubjectId } from "../student/contract";

import type { Candidate } from "./resolver";
import { whenPhrase } from "./when";

/** Display facts a provider may state about a subject — resolved by the caller from the 3.1 config. */
export interface SubjectFacts {
  id: SubjectId;
  name: string;
  environmentName: string;
}

export interface ProviderInput {
  enrolments: readonly Enrolment[];
  environmentStates: readonly EnvironmentState[];
  /** In CONFIG order. Only subjects present here may be named. */
  subjects: readonly SubjectFacts[];
  /** The server's clock, read ONCE by the caller. ISO string. */
  now: string;
  /** Where an environment lives and where the choice lives — routes are the caller's to know. */
  hrefs: { subject: (id: SubjectId) => string; choose: string };
}

export interface CandidateProvider {
  /** Stable id; appears in the dev route's WHY panel. */
  id: string;
  /** Module id in src/config/modules that must be `live` for this provider to emit. */
  capability: string;
  /** Owner phase — documentation, not logic. */
  phase: string;
  provide: (input: ProviderInput) => Candidate[];
}

/** The registry gate. The single question every provider asks first. */
export function isLive(moduleId: string): boolean {
  return PLATFORM_MODULES.some((m) => m.id === moduleId && m.status === "live");
}

/** Every module id that is live — handed to the resolver so it can re-check. */
export function liveCapabilities(): string[] {
  return PLATFORM_MODULES.filter((m) => m.status === "live").map((m) => m.id);
}

/**
 * The environments (/subjects/[id]) and the six doors (/subjects) are part of
 * the public website module — the only live entry. That is what gates the two
 * shipped providers. Every future provider gates on its own planned entry.
 */
const ENVIRONMENT_CAPABILITY = "public-website";

/* ── Tier 3 — the enrolment provider ───────────────────────────────────── */

export const enrolmentProvider: CandidateProvider = {
  id: "enrolment",
  capability: ENVIRONMENT_CAPABILITY,
  phase: "5.4 (real)",
  provide(input) {
    if (!isLive(ENVIRONMENT_CAPABILITY)) return [];
    const out: Candidate[] = [];
    for (const s of input.subjects) {
      const e = input.enrolments.find((x) => x.subjectId === s.id && x.status === "active");
      if (!e) continue;
      const st = input.environmentStates.find((x) => x.subjectId === s.id);
      const title = `${s.name} — ${s.environmentName}`;
      const href = input.hrefs.subject(s.id);
      if (st) {
        // RESUME — only populated fields. `position` is null today, so nothing
        // about a place inside the environment is said. `entryCount` is never
        // rendered (P5-R2 FIX 1): a count with no action is report-only.
        // A row with a null last_entered_at (not possible under the 5.1 schema,
        // handled anyway) says WHICH environment and nothing about WHEN.
        const when = st.lastEnteredAt ? whenPhrase(st.lastEnteredAt, input.now) : null;
        out.push({
          id: `enrolment:${s.id}:resume`,
          source: "enrolment",
          tier: 3,
          kind: "resume",
          capability: ENVIRONMENT_CAPABILITY,
          subjectId: s.id,
          eyebrow: when ? `Last opened ${when}` : "Last opened",
          title,
          ...(when ? { detail: `You were last here ${when}.` } : {}),
          cta: `Open ${s.name}`,
          href,
          ...(st.lastEnteredAt ? { lastEnteredAt: st.lastEnteredAt } : {}),
          ...(e.enrolledAt ? { enrolledAt: e.enrolledAt } : {}),
        });
      } else {
        // BEGIN — enrolled, never entered.
        const when = e.enrolledAt ? whenPhrase(e.enrolledAt, input.now) : null;
        out.push({
          id: `enrolment:${s.id}:begin`,
          source: "enrolment",
          tier: 3,
          kind: "begin",
          capability: ENVIRONMENT_CAPABILITY,
          subjectId: s.id,
          eyebrow: "First session",
          title,
          detail: when ? `You chose ${s.name} ${when}. Your first session begins when you open it.` : "Your first session begins when you open it.",
          cta: `Open ${s.name}`,
          href,
          ...(e.enrolledAt ? { enrolledAt: e.enrolledAt } : {}),
        });
      }
    }
    return out;
  },
};

/* ── Tier 4 — the origin provider ──────────────────────────────────────── */

export const originProvider: CandidateProvider = {
  id: "origin",
  capability: ENVIRONMENT_CAPABILITY,
  phase: "5.4 (real)",
  provide(input) {
    if (!isLive(ENVIRONMENT_CAPABILITY)) return [];
    return [{
      id: "origin:choose",
      source: "origin",
      tier: 4,
      kind: "choose",
      capability: ENVIRONMENT_CAPABILITY,
      eyebrow: "What now",
      title: "Choose a subject",
      // P5-R3 FIX 1: no availability claim. /subjects carries the honest labels.
      detail: "Choosing is where this begins.",
      cta: "See the six subjects",
      href: input.hrefs.choose,
    }];
  },
};

/**
 * THE PROVIDER REGISTRY. Order is irrelevant to the answer (the resolver
 * ranks); it is the order the WHY panel lists them in. Phases 6–9 append
 * here — see docs/NEXT_ACTION_EXTENSION.md for what each may contribute.
 */
export const PROVIDERS: readonly CandidateProvider[] = [enrolmentProvider, originProvider];

/**
 * Run every provider, isolating failures: a provider that throws contributes
 * nothing and the others continue (resolution never throws in production).
 * Returns the candidates and the ids of any provider that failed.
 */
export function collectCandidates(providers: readonly CandidateProvider[], input: ProviderInput): { candidates: Candidate[]; failed: string[] } {
  const candidates: Candidate[] = [];
  const failed: string[] = [];
  for (const p of providers) {
    try {
      const got = p.provide(input);
      if (Array.isArray(got)) candidates.push(...got);
    } catch {
      failed.push(p.id);
    }
  }
  return { candidates, failed };
}
