/**
 * THE NEXT-ACTION ENGINE — composition root (pure).
 * `nextActionFor(input)` = providers → resolver → one Candidate, with the
 * fallback the brief requires: if resolution fails entirely the BENIGN action
 * is returned (the most recent environment, else the choice) — never a blank
 * surface, never an error. Still pure: the caller passes rows and the clock.
 */
import { collectCandidates, liveCapabilities, PROVIDERS, type CandidateProvider, type ProviderInput } from "./providers";
import { explainResolution, type Candidate, type Resolution, type ResolverState } from "./resolver";

export type { Candidate, CandidateKind, CandidateSource, Considered, Resolution, ResolverState, Tier, Treatment, Verdict } from "./resolver";
export { explainResolution, judge, resolveNextAction, TIER_1_WINDOW_BEFORE_START_MINUTES, TREATMENT } from "./resolver";
export type { CandidateProvider, ProviderInput, SubjectFacts } from "./providers";
export { collectCandidates, enrolmentProvider, isLive, liveCapabilities, originProvider, PROVIDERS } from "./providers";
export { whenPhrase } from "./when";

/** The resolver state for this student: config order, live modules, and which hrefs resolve today. */
export function resolverStateFor(input: ProviderInput): ResolverState {
  const enrolled = new Set(input.enrolments.filter((e) => e.status === "active").map((e) => e.subjectId));
  const subjectOrder = input.subjects.map((s) => s.id);
  const resolvable = new Set<string>([input.hrefs.choose, ...subjectOrder.filter((id) => enrolled.has(id)).map((id) => input.hrefs.subject(id))]);
  return { subjectOrder, liveCapabilities: liveCapabilities(), resolvesToday: (href) => resolvable.has(href) };
}

/** The benign action, used only if resolution itself fails: most recent environment, else the choice. */
export function benignAction(input: ProviderInput): Candidate {
  const enrolled = input.subjects.filter((s) => input.enrolments.some((e) => e.subjectId === s.id && e.status === "active"));
  const latest = input.environmentStates
    .filter((st) => enrolled.some((s) => s.id === st.subjectId) && Number.isFinite(Date.parse(st.lastEnteredAt)))
    .sort((a, b) => b.lastEnteredAt.localeCompare(a.lastEnteredAt))[0];
  const s = latest ? enrolled.find((x) => x.id === latest.subjectId) : undefined;
  if (s) {
    return { id: `fallback:${s.id}:resume`, source: "enrolment", tier: 3, kind: "resume", capability: "public-website", subjectId: s.id, eyebrow: "Last opened", title: `${s.name} — ${s.environmentName}`, cta: `Open ${s.name}`, href: input.hrefs.subject(s.id) };
  }
  return { id: "fallback:choose", source: "origin", tier: 4, kind: "choose", capability: "public-website", eyebrow: "What now", title: "Choose a subject", detail: "Choosing is where this begins.", cta: "See the six subjects", href: input.hrefs.choose };
}

export interface EngineResult {
  action: Candidate;
  resolution: Resolution | null;
  failedProviders: string[];
  /** true when the benign fallback was used because resolution failed entirely. */
  fellBack: boolean;
}

export function nextActionFor(input: ProviderInput, providers: readonly CandidateProvider[] = PROVIDERS): EngineResult {
  try {
    const { candidates, failed } = collectCandidates(providers, input);
    const resolution = explainResolution(resolverStateFor(input), candidates, input.now);
    if (resolution.winner) return { action: resolution.winner, resolution, failedProviders: failed, fellBack: false };
    return { action: benignAction(input), resolution, failedProviders: failed, fellBack: true };
  } catch {
    return { action: benignAction(input), resolution: null, failedProviders: providers.map((p) => p.id), fellBack: true };
  }
}
