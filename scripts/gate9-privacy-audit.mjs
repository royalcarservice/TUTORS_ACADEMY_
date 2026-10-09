#!/usr/bin/env node
// ============================================================================
// PHASE 9 GATE · W3 — THE PRIVACY, SURVEILLANCE & GRADING AUDIT
//
// Verifies, from the committed sources alone (pure, zero network, zero
// database, zero identities — the gate8 audit pattern):
//   S1–S5  the schema's boundaries: RLS enabled AND forced on both tables,
//          the standing predicates, no update on occurrences, anon nowhere,
//          zero engagement columns, bounded payloads;
//   B1–B3  zero surveillance and zero grading: the vocabulary sweeps come
//          back empty, and nothing reads a clock or a timer;
//   C1–C4  subject isolation in logic: cross-subject keys and artifacts
//          resolve to nothing, every reader spells its boundary, identity
//          rides the cookie session alone;
//   D1–D2  honest failure: invisible and refused are the same answer, and
//          every surface stands dormant until the boundary admits it.
//
// Writes audit/phase9-privacy.json.
// Run: node scripts/gate9-privacy-audit.mjs
// ============================================================================
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const literalsOf = (src) => [...strip(src).matchAll(/"([^"\\]*)"|'([^'\\]*)'|`([^`\\]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);

const LIB = [
  "src/lib/socratic/contract.ts",
  "src/lib/socratic/resolver.ts",
  "src/lib/socratic/data.ts",
  "src/lib/socratic/actions.ts",
  "src/lib/socratic/oversight.ts",
  "src/lib/socratic/lexicon.ts",
];
const SURFACES = [
  "src/components/socratic/socratic-lens.tsx",
  "src/components/socratic/inquiry-composer.tsx",
  "src/components/socratic/guidance-card.tsx",
  "src/components/tutor/socratic-reflections.tsx",
  "src/app/dev/socratic-rehearsal/page.tsx",
  "src/app/dev/socratic-rehearsal/preview.tsx",
];
const ALL = [...LIB, ...SURFACES];
const SRC = Object.fromEntries(ALL.map((p) => [p, read(p)]));
const STRIPPED = Object.fromEntries(ALL.map((p) => [p, strip(SRC[p])]));

const M9 = read("supabase/migrations/20261008000009_phase9_socratic.sql");
const M10 = read("supabase/migrations/20261008000010_phase9_socratic_pins.sql");

const checks = [];
const check = (id, name, fn) => {
  try {
    const detail = fn();
    checks.push({ id, name, pass: true, detail: typeof detail === "string" ? detail : "ok" });
  } catch (e) {
    checks.push({ id, name, pass: false, detail: e.message });
  }
};
const fail = (m) => { throw new Error(m); };

/* ── S · the schema's boundaries ─────────────────────────────────────────── */

check("S1", "socratic_exchanges: RLS enabled AND forced; the standing policies; no update/delete; anon nowhere", () => {
  if (!/alter table public\.socratic_exchanges enable row level security/.test(M9)) fail("enable missing");
  if (!/alter table public\.socratic_exchanges force row level security/.test(M9)) fail("force missing");
  if (!/socratic_select_own_student[\s\S]*?using \(student_id = auth\.uid\(\)\)/.test(M9)) fail("own-student select drifted");
  if (!/socratic_select_related_tutor[\s\S]*?using \(public\.is_related_tutor\(student_id, subject_id\)\)/.test(M9)) fail("related-tutor select drifted");
  if (!/socratic_insert_own_student[\s\S]*?with check \(student_id = auth\.uid\(\)\)/.test(M9)) fail("own-student insert drifted");
  if (/for update/.test(M9)) fail("an update policy exists");
  if (/for delete/.test(M9)) fail("a delete policy exists");
  if (/to anon/.test(M9)) fail("a policy admits anon");
  if (!/revoke all on public\.socratic_exchanges from anon, authenticated/.test(M9)) fail("the revoke pattern drifted");
  return "enabled+forced · own-student select/insert · related-tutor select · no update/delete · anon revoked";
});

check("S2", "socratic_pins: RLS enabled AND forced; the mark's policies; binary shape; anon nowhere", () => {
  if (!/alter table public\.socratic_pins enable row level security/.test(M10)) fail("enable missing");
  if (!/alter table public\.socratic_pins force row level security/.test(M10)) fail("force missing");
  if (!/pins_select_own_tutor[\s\S]*?tutor_id = auth\.uid\(\)\s*and public\.is_related_tutor\(student_id, subject_id\)/.test(M10)) fail("select drifted — relatedness must re-decide");
  if (!/pins_insert_own_tutor[\s\S]*?exists \([\s\S]*?from public\.socratic_exchanges e[\s\S]*?e\.student_id = socratic_pins\.student_id[\s\S]*?e\.subject_id = socratic_pins\.subject_id/.test(M10)) fail("insert drifted — the pair must be re-derived from the exchange");
  if (!/pins_delete_own_tutor[\s\S]*?using \(tutor_id = auth\.uid\(\)\)/.test(M10)) fail("delete drifted");
  if (/for update/.test(M10)) fail("an update policy exists — the mark must stay binary");
  if (!M10.includes("unique (tutor_id, exchange_id)")) fail("the unique pair drifted");
  if (/to anon/.test(M10)) fail("a policy admits anon");
  return "enabled+forced · own-tutor select re-decides relatedness · insert re-derives the pair · delete own-only · no update · anon revoked";
});

check("S3", "subject identity CHECKed in the DB on both tables; the mark is structurally bound to the exchange", () => {
  if (!M9.includes("subject_id       text not null check (public.is_subject_id(subject_id))")) fail("0009 subject check drifted");
  if (!M10.includes("subject_id text not null check (public.is_subject_id(subject_id))")) fail("0010 subject check drifted");
  if (!M10.includes("exchange_id uuid not null references public.socratic_exchanges (id) on delete cascade")) fail("the mark's foreign key drifted");
  return "is_subject_id on both tables; the mark cascades with its exchange";
});

check("S4", "zero engagement columns: neither table can hold a counter or a popularity figure", () => {
  const BANNED = ["view_count", "views", "download_count", "downloads", "popularity", "likes", "shares", "rating", "score_column", "impressions"];
  for (const m of [M9, M10]) {
    const ddl = m.replace(/--.*$/gm, "");
    for (const b of BANNED) if (new RegExp(`\\b${b}\\b`).test(ddl)) fail(`engagement column ${b}`);
  }
  return "both DDLs swept — zero engagement vocabulary";
});

check("S5", "bounded payloads: the inquiry cap, the milestone cap and the 16 KB budget all stand", () => {
  if (!M9.includes("char_length(query_text) between 1 and 500")) fail("the inquiry cap drifted");
  if (!M9.includes("char_length(milestone_key) between 1 and 128")) fail("the milestone cap drifted");
  if (!/octet_length\(response_payload::text\) <= 16384/.test(M9)) fail("the payload budget drifted");
  return "query_text ≤500 · milestone_key ≤128 · response_payload ≤16 KB";
});

/* ── B · zero surveillance, zero grading ─────────────────────────────────── */

const SURVEILLANCE = ["idle", "dwell", "gaze", "keystroke", "keylog", "typing speed", "time on task", "watch time", "presence tracking", "focus tracking", "attention score", "engagement score", "activity log", "behaviour", "behavior", "tab switch", "mouse movement", "click tracking"];
check("B1", "zero surveillance vocabulary in the engine and its surfaces", () => {
  for (const p of ALL) {
    const low = STRIPPED[p].toLowerCase();
    for (const s of SURVEILLANCE) if (low.includes(s)) fail(`surveillance vocabulary "${s}" in ${p}`);
  }
  return `${SURVEILLANCE.length} surveillance classes swept across ${ALL.length} files — zero hits`;
});

const GRADING = ["sentiment", "mood", "emotion", "frustrat", "anxious", "confidence level", "comprehension", "difficulty flag", "percentile", "grade point", "\\biq\\b", "diagnos", "personality", "lazy", "gifted", "struggl", "weak student", "slow learner", "needs attention"];
check("B2", "zero psychological diagnosis, zero sentiment grading, zero difficulty scoring", () => {
  for (const p of ALL) {
    const low = STRIPPED[p].toLowerCase();
    for (const g of GRADING) {
      const re = g.startsWith("\\b") ? new RegExp(g, "i") : new RegExp(g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      if (re.test(low)) fail(`grading vocabulary "${g}" in ${p}`);
    }
  }
  // The ONE place the word "scores" stands is the refusal of scoring (the oversight's purpose sentence).
  const hits = ALL.flatMap((p) => literalsOf(SRC[p])).filter((l) => /\bscor\w*\b/i.test(l));
  for (const h of hits) {
    if (!h.includes("nothing on this panel scores, rates or flags them")) fail(`a non-refusal 'score' string: ${h.slice(0, 60)}`);
  }
  return `${GRADING.length} grading/diagnosis classes swept — zero hits; the one 'scores' is the refusal sentence itself`;
});

check("B3", "nothing reads a clock or a timer; no telemetry anywhere in the engine", () => {
  for (const p of ALL) {
    const src = STRIPPED[p];
    for (const b of ["Date.now", "new Date(", "setTimeout", "setInterval", "performance.now", "analytics", "telemetry", "trackEvent", "posthog", "mixpanel", "hotjar"]) {
      if (src.includes(b)) fail(`clock/telemetry source ${b} in ${p}`);
    }
  }
  return "zero Date/timer/telemetry sources; instants render from stored ISO words alone";
});

/* ── C · subject isolation in logic ──────────────────────────────────────── */

check("C1", "cross-subject keys resolve to nothing; foreign artifacts are never cited", () => {
  const resolver = SRC["src/lib/socratic/resolver.ts"];
  if (!resolver.includes("if (!parsed || parsed.subjectId !== subjectId) return null;")) fail("the cross-subject refusal drifted");
  if (!resolver.includes("const own = prompt.previousArtifacts.filter((a) => a.subjectId === prompt.subjectId);")) fail("the artifact isolation filter drifted");
  if (!resolver.includes('if (slug.includes(MILESTONE_KEY_SEPARATOR)) return null;')) fail("the key grammar drifted");
  return "cross-subject keys → null; citations see only the prompt's own subject; the key grammar holds";
});

check("C2", "every reader spells its boundary; no identity argument rides a signature", () => {
  const data = SRC["src/lib/socratic/data.ts"];
  if (!data.includes('.eq("subject_id", subjectId)\n    .order("created_at"')) fail("the lens reader no longer spells the subject");
  if (!data.includes('.eq("subject_id", subjectId)\n    .eq("student_id", studentId)')) fail("the oversight reader no longer spells the boundary pair");
  for (const fn of ["fetchRecentExchanges", "fetchSocraticLensData", "fetchTutorSocraticOverview"]) {
    const sig = data.slice(data.indexOf(`export async function ${fn}`));
    const head = sig.slice(0, sig.indexOf("{"));
    if (/userId|tutorId|viewerId/.test(head)) fail(`${fn} carries an identity argument`);
  }
  return "three readers, all boundary-spelling; zero identity arguments in the seam";
});

check("C3", "the actions re-decide identity from the cookie and verify visibility before any write", () => {
  const actions = SRC["src/lib/socratic/actions.ts"];
  if (!actions.startsWith('"use server"')) fail("the directive drifted");
  const reflect = actions.slice(actions.indexOf("export async function reflectOnInquiry"));
  if (!reflect.includes('identity.role !== "student"')) fail("the student write lost its role check");
  const toggle = actions.slice(actions.indexOf("export async function toggleSocraticPin"));
  if (!toggle.includes('identity.role !== "tutor"')) fail("the tutor write lost its role check");
  if (!toggle.includes('.eq("id", exchangeId)')) fail("the toggle lost its visibility read");
  if (!toggle.includes('.eq("subject_id", subjectId)\n      .eq("student_id", studentId)')) fail("the visibility read lost the boundary pair");
  const body = actions.slice(actions.indexOf("export async function reflectOnInquiry"), actions.indexOf("export async function toggleSocraticPin"));
  if (!/function reflectOnInquiry\([^)]*\)/.test(body) || /identity:\s*string/.test(body)) fail("identity may never be an argument");
  return "student writes re-decide role=student; tutor writes re-decide role=tutor AND read-verify the boundary pair before writing";
});

check("C4", "the surfaces carry identity only by props; the join key is never displayed", () => {
  for (const p of SURFACES.slice(0, 4)) {
    if (SRC[p].includes('from "@/lib/subjects/subjects"') || SRC[p].includes('from "@/config/scene')) fail(`direct subject-config import in ${p}`);
  }
  const panel = SRC["src/components/tutor/socratic-reflections.tsx"];
  if (!panel.includes("The relationship's join key — carried for the mark's write, never displayed")) fail("the join-key declaration drifted");
  if (/\{studentId\}/.test(panel)) fail("the join key is rendered");
  return "guard-clean surfaces; the panel's studentId feeds the mark's write and renders nowhere";
});

/* ── D · honest failure, dormant surfaces ────────────────────────────────── */

check("D1", "invisible and refused are the same answer; failures speak the closed vocabulary, calmly", () => {
  const actions = SRC["src/lib/socratic/actions.ts"];
  if (!actions.includes('"empty" | "overlong" | "refused"')) fail("the closed vocabulary drifted");
  const toggle = actions.slice(actions.indexOf("export async function toggleSocraticPin"));
  const returns = [...toggle.matchAll(/return;/g)].length;
  if (returns < 5) fail("the toggle no longer fails silently in every branch");
  const composer = SRC["src/components/socratic/inquiry-composer.tsx"];
  for (const sentence of [
    "Write the question first; the lens reflects on what you ask.",
    "A shorter question serves reflection best. The limit is three hundred characters.",
    "The reflection could not be recorded. The lens stays as it was; try again when you are ready.",
  ]) if (!composer.includes(sentence)) fail(`a calm sentence drifted: ${sentence.slice(0, 40)}`);
  return "reflect speaks the closed three; toggle fails silent in every branch; the calm sentences stand verbatim";
});

check("D2", "dormancy: surfaces render nothing until the boundary admits them; rehearsal 404s in production", () => {
  const data = SRC["src/lib/socratic/data.ts"];
  if (!data.includes("if (!supabase) return [];")) fail("the lens reader lost its honest-empty posture");
  if (!data.includes('if (!supabase) return { groups: [] };')) fail("the oversight reader lost its honest-empty posture");
  const panel = SRC["src/components/tutor/socratic-reflections.tsx"];
  if (!panel.includes("if (!overview || overview.groups.length === 0) return null;")) fail("the panel lost its absent-when-empty posture");
  const rehearsal = SRC["src/app/dev/socratic-rehearsal/page.tsx"];
  if (!rehearsal.includes('if (process.env.NODE_ENV === "production") notFound();')) fail("the rehearsal lost its production 404");
  const page = read("src/app/subjects/[subject]/page.tsx");
  if (!page.includes("socratic: socratic.ok ? socratic.value : undefined")) fail("the environment page lost its isolate posture");
  return "no client → honest empty; failed read → absent region; empty overview → no DOM; rehearsal 404 in prod";
});

/* ── the verdict ─────────────────────────────────────────────────────────── */

const passed = checks.filter((c) => c.pass).length;
const report = {
  gate: "phase9-privacy",
  window: "W3 — the privacy, surveillance & grading audit",
  phase: "Phase 9 · Step 4",
  decision: "DEC-036",
  at: "2026-10-08",
  posture: "pure text audit over committed migrations and sources — zero network, zero database, zero identities (Rule 18)",
  checks,
  summary: `${passed}/${checks.length} checks passed`,
};
writeFileSync(new URL("../audit/phase9-privacy.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.id} · ${c.name}${c.pass ? "" : `\n      ${c.detail}`}`);
console.log(`\n${report.summary}`);
if (passed !== checks.length) process.exit(1);
