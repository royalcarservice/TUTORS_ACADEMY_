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

import { isolate } from "@/lib/state/isolate";
import type { CohortSession } from "@/lib/cohort/session";
import { PLATFORM_MODULES } from "../../config/modules";
import type { Enrolment, EnvironmentState, SubjectId } from "../student/contract";
import type { ProgressEvent } from "../progress";
import { attendanceState } from "../progress/record";

import type { Candidate } from "./resolver";
import { scheduledPhrase, whenPhrase } from "./when";

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
  hrefs: { subject: (id: SubjectId) => string; choose: string; /** Phase 7: the live surface — supplied only when the caller may name it. */ live?: (id: SubjectId) => string };
  /**
   * Phase 7 · Step 2 — cohort session rows, passed by the caller ONLY while
   * `live-classroom` is live (the fetch is gated on the same registry).
   * Absent until then: a provider that sees no sessions emits nothing.
   */
  cohortSessions?: readonly CohortSession[];
  /**
   * The student's progress-record events (DEC-022's attend-versus-resume
   * verb reads them). Absent or empty until live-classroom is live — the
   * table has no writer yet, so the record is silent and the verb is
   * "attend".
   */
  progressEvents?: readonly ProgressEvent[];
  /** Module ids the caller knows to be live — the verb's admissibility gate (EVENT_KIND_MODULE). */
  liveModules?: readonly string[];
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

/* ── Tier 2 — the class provider (Phase 7 · Step 2, DEC-023) ─────────────── */

export const CLASS_CAPABILITY = "live-classroom";

/**
 * THE SESSION ACTION SENTENCE — DEC-022's attend-versus-resume rule, worded
 * as an instruction. Never "Join", never a vendor noun ("Call", "Meeting",
 * "Conference", "Webinar" are banned platform-wide): a session is ATTENDED
 * the first time and RESUMED thereafter, and the verb is chosen by the
 * record (attendanceState), never by a timer or a click.
 *
 * The extension doc's P7 note holds: this sentence is the SCHEDULED/NOW
 * instruction (source `class`). The record's own recency language is a
 * different source and never shares this string.
 */
export function sessionActionSentence(verb: "attend" | "resume", subjectName: string): { title: string; cta: string } {
  return verb === "resume"
    ? { title: `Resume the ${subjectName} session`, cta: "Resume the session" }
    : { title: `Attend the ${subjectName} session`, cta: "Attend the session" };
}

/**
 * The ungated core of the class provider — pure over ProviderInput so the
 * fixture tests can see its candidates while the module is still planned
 * (the gate itself is tested against the real registry, separately).
 *
 * TIER 2, NEVER TIER 1 — by construction, not by choice: `cohorts` carries a
 * scheduled instant but no END, so no candidate can carry the honest
 * `expiresAt` Tier 1 demands ("no expiry, no Tier 1 — rejected, never
 * demoted"). When the session table gains an end, Tier 1 returns with it —
 * by ruling (docs/NEXT_ACTION_EXTENSION.md).
 *
 * The roster is the enrolment: no cohort-memberships table exists (0005
 * refuses to pre-solve membership), so a subject's cohorts belong to its
 * enrolled students — the same boundary that opens the environment.
 */
export function classCandidatesFor(input: ProviderInput): Candidate[] {
  const sessions = input.cohortSessions ?? [];
  const liveHref = input.hrefs.live;
  if (!liveHref) return [];                    // no resolvable destination → no candidate (the contract)
  const out: Candidate[] = [];
  for (const s of input.subjects) {
    const enrolled = input.enrolments.some((x) => x.subjectId === s.id && x.status === "active");
    if (!enrolled) continue;
    // ONE candidate per subject: an active session, else the earliest scheduled (src/lib/cohort/session.ts).
    const open = sessions
      .filter((x) => x.subjectId === s.id && x.state !== "concluded")
      .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt) || a.id.localeCompare(b.id));
    const next = open.find((x) => x.state === "active") ?? open.find((x) => x.state === "scheduled");
    if (!next) continue;
    // DEC-022: the verb is chosen by the RECORD (silent today → "attend").
    const { verb } = attendanceState(input.progressEvents ?? [], s.id, input.liveModules ?? []);
    const sentence = sessionActionSentence(verb, s.name);
    const when = scheduledPhrase(next.scheduledAt, input.now);
    const detail = next.state === "active" ? next.name : when ? `${next.name}, scheduled ${when}` : next.name;
    out.push({
      id: `class:${s.id}:session:${next.id}`,
      source: "class",
      tier: 2,
      kind: "attend",
      capability: CLASS_CAPABILITY,
      subjectId: s.id,
      eyebrow: next.state === "active" ? "Session open" : "Next session",
      title: sentence.title,
      detail,
      cta: sentence.cta,
      href: liveHref(s.id),
      at: next.scheduledAt,
    });
  }
  return out;
}

export const classProvider: CandidateProvider = {
  id: "class",
  capability: CLASS_CAPABILITY,
  phase: "7.2",
  provide(input) {
    // THE CONTRACT: the registry first. While live-classroom is not live the
    // provider is silent — the same truth that labels the module on the
    // homepage governs the student's instruction.
    if (!isLive(CLASS_CAPABILITY)) return [];
    return classCandidatesFor(input);
  },
};

/**
 * THE PROVIDER REGISTRY. Order is irrelevant to the answer (the resolver
 * ranks); it is the order the WHY panel lists them in. Phases 6–9 append
 * here — see docs/NEXT_ACTION_EXTENSION.md for what each may contribute.
 */
export const PROVIDERS: readonly CandidateProvider[] = [enrolmentProvider, originProvider, classProvider];

/**
 * Run every provider, isolating failures: a provider that throws contributes
 * nothing and the others continue (resolution never throws in production).
 * Returns the candidates and the ids of any provider that failed.
 */
export function collectCandidates(providers: readonly CandidateProvider[], input: ProviderInput): { candidates: Candidate[]; failed: string[] } {
  const candidates: Candidate[] = [];
  const failed: string[] = [];
  for (const p of providers) {
    // 5.7: the ONE isolation pattern (src/lib/state/isolate.ts), shared with the regions.
    const r = isolate(`provider:${p.id}`, () => p.provide(input));
    if (r.ok) { if (Array.isArray(r.value)) candidates.push(...r.value); }
    else failed.push(p.id);
  }
  return { candidates, failed };
}
