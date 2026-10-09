#!/usr/bin/env node
// ============================================================================
// PHASE 9 GATE · W2 — THE PEDAGOGICAL BOUNDARY & ANTI-CHATBOT AUDIT
//
// Verifies, from the committed sources alone (pure, zero network, zero
// database — the gate8 audit pattern):
//   P1–P3  conversational filler, exclamation/emoji and chatbot-widget
//          anatomy are ABSENT from every Socratic surface;
//   A1–A4  the engine CANNOT auto-answer: the guidance union has no
//          answer kind, completion demands are detected and redirected,
//          questions lead, and the brevity discipline holds end-to-end
//          (300 composer < 500 contract = DB mirror);
//   E1–E3  the pedagogical truth: honest absence for unknown milestones,
//          the capability statements verbatim, the prompt-type union
//          closed and cross-pinned against the schema;
//   R1–R2  the inherited register: archive words kept, banned archive
//          vocabulary absent, reward register absent.
//
// Behavioural proofs (redirect, honest absence, determinism) are the
// suites' — test-socratic-logic re-ran green in W1; this harness pins the
// machinery and the words. Writes audit/phase9-pedagogy.json.
// Run: node scripts/gate9-pedagogy-audit.mjs
// ============================================================================
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const literalsOf = (src) => [...strip(src).matchAll(/"([^"\\]*)"|'([^'\\]*)'|`([^`\\]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

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
const ALL_LITERALS = ALL.flatMap((p) => literalsOf(SRC[p]));

const MIGRATION_0009 = read("supabase/migrations/20261008000009_phase9_socratic.sql");

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

/* ── P · the conversational register ─────────────────────────────────────── */

const FILLER = [
  "hey there", "hello there", "hi there", "how can i help you today", "how can i help",
  "can i help you", "certainly", "sure thing", "of course", "great question",
  "good question", "i'd love to help", "happy to help", "glad to help", "no problem",
  "you're welcome", "well done", "good job", "nice work", "awesome", "good for you",
];
check("P1", "zero conversational greetings and filler in every Socratic surface (comments stripped)", () => {
  for (const p of ALL) {
    const low = STRIPPED[p].toLowerCase();
    for (const f of FILLER) if (low.includes(f)) fail(`filler "${f}" in ${p}`);
  }
  return `${FILLER.length} filler classes swept across ${ALL.length} files — zero hits`;
});

check("P2", "zero exclamation marks in quoted copy, zero emoji anywhere", () => {
  for (const lit of ALL_LITERALS) if (lit.includes("!")) fail(`exclamation in: ${lit.slice(0, 60)}`);
  for (const p of ALL) if (EMOJI.test(SRC[p])) fail(`emoji in ${p}`);
  return `${ALL_LITERALS.length} literals swept for '!', ${ALL.length} files swept for emoji — zero hits`;
});

const WIDGET = ["avatar", "speech bubble", "chat bubble", "chatbot", "typing indicator", "typing-indicator", "pulsing dot", "floating widget", "launcher"];
check("P3", "zero chatbot-widget anatomy; the lens is a bordered region, not a widget", () => {
  for (const p of SURFACES) {
    const low = STRIPPED[p].toLowerCase();
    for (const w of WIDGET) if (low.includes(w)) fail(`widget anatomy "${w}" in ${p}`);
  }
  if (!SRC["src/components/socratic/socratic-lens.tsx"].includes("data-socratic-lens")) fail("the lens's region anchor is missing");
  if (!SRC["src/components/socratic/socratic-lens.tsx"].includes('border: "1px solid var(--ta-border-subtle)"')) fail("the lens is not a bordered region");
  if (/position:\s*"fixed"|position:\s*fixed/.test(STRIPPED["src/components/socratic/socratic-lens.tsx"])) fail("a fixed-position launcher exists");
  const ANIM = ["animation", "keyframe", "bounce", "spring", "pulse", "framer-motion", "animate"];
  for (const p of ["src/components/socratic/socratic-lens.tsx", "src/components/socratic/inquiry-composer.tsx", "src/components/socratic/guidance-card.tsx", "src/components/tutor/socratic-reflections.tsx"]) {
    const low = STRIPPED[p].toLowerCase();
    for (const a of ANIM) if (low.includes(a)) fail(`animation vocabulary "${a}" in ${p}`);
  }
  return "no avatar/bubble/typing/launcher; bordered region pinned; zero animation vocabulary in all four components";
});

/* ── A · anti-auto-answer machinery ──────────────────────────────────────── */

check("A1", "the guidance union has no answer kind: hint, question, reference only", () => {
  const contract = SRC["src/lib/socratic/contract.ts"];
  if (!contract.includes('export const GUIDANCE_KINDS = ["hint", "question", "reference"] as const;')) fail("the guidance union drifted");
  if (!contract.includes("there is no \"answer\" kind") && !contract.includes("never a solution")) fail("the refusal posture is unstated");
  const resolver = SRC["src/lib/socratic/resolver.ts"];
  if (!/guidanceType:\s*"answer"/.test(resolver) && !resolver.includes('"answer"')) return "union pinned closed; 'answer' unrepresentable";
  fail("an answer kind exists");
});

check("A2", "completion demands are detected by machinery and redirected, never answered", () => {
  const resolver = SRC["src/lib/socratic/resolver.ts"];
  const markers = resolver.match(/COMPLETION_DEMAND_MARKERS = \[([\s\S]*?)\] as const/);
  if (!markers) fail("the demand-marker list is missing");
  const count = [...markers[1].matchAll(/"/g)].length / 2;
  if (count < 10) fail(`only ${count} demand markers — the machinery is thin`);
  if (!resolver.includes("const COMPLETION_REDIRECT_TEXT =")) fail("the redirect sentence is missing");
  if (!resolver.includes("This engine keeps the concept's scaffold and its questions; the working stays the student's own.")) fail("the redirect sentence drifted");
  if (!/if \(asksForCompletion\(inquiry\.text\)\) \{\s*return \[bounded\("question", COMPLETION_REDIRECT_TEXT\)\];/.test(resolver)) fail("the redirect is not the single returned guidance");
  return `${count} demand markers; the single question-kind redirect is pinned and is the only path a demand takes`;
});

check("A3", "questions lead: for a known milestone the disciplined question is emitted first", () => {
  const resolver = SRC["src/lib/socratic/resolver.ts"];
  const body = resolver.slice(resolver.indexOf("export function resolveGuidance"));
  const order = body.slice(body.indexOf("const scaffold = scaffoldFor"), body.indexOf("const citation"));
  const q = order.indexOf('bounded("question", scaffold.question)');
  const h = order.indexOf('bounded("hint", scaffold.hint)');
  const r = order.indexOf('bounded("reference", scaffold.proof)');
  if (!(q > -1 && h > -1 && r > -1 && q < h && h < r)) fail("the emission order is not question → hint → proof");
  return "question → hint → proof, pinned in the resolution body";
});

check("A4", "brevity end-to-end: 300 composer < 500 contract = DB mirror; every authored guidance fits", () => {
  const contract = SRC["src/lib/socratic/contract.ts"];
  if (!contract.includes("export const COMPOSER_CHAR_LIMIT = 300;")) fail("composer limit drifted");
  if (!contract.includes("export const MAX_INQUIRY_CHARS = 500;")) fail("contract limit drifted");
  if (!contract.includes("export const MAX_GUIDANCE_CHARS = 500;")) fail("guidance limit drifted");
  if (!MIGRATION_0009.includes("char_length(query_text) between 1 and 500")) fail("the DB no longer mirrors the 500 cap");
  const composer = SRC["src/components/socratic/inquiry-composer.tsx"];
  if (!composer.includes("maxLength={COMPOSER_CHAR_LIMIT}")) fail("the field lost its maxLength");
  if (!composer.includes("e.target.value.slice(0, COMPOSER_CHAR_LIMIT)")) fail("the change handler lost its slice");
  if (!composer.includes("trimmed.length > COMPOSER_CHAR_LIMIT")) fail("the submit guard lost its check");
  // Every authored scaffold text fits the guidance cap (behavioural re-proof, offline).
  const texts = [...SRC["src/lib/socratic/resolver.ts"].matchAll(/(?:hint|question|proof):\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  for (const t of texts) if (t.length === 0 || t.length > 500) fail(`an authored scaffold text violates the cap (${t.length} chars)`);
  return `300 < 500 = DB; field capped thrice; ${texts.length} authored scaffold texts all within (0, 500]`;
});

/* ── E · the pedagogical truth ───────────────────────────────────────────── */

check("E1", "unknown milestones receive the honest absence — nothing invented", () => {
  const resolver = SRC["src/lib/socratic/resolver.ts"];
  if (!resolver.includes("No scaffold is recorded yet for this milestone in ${name}.")) fail("the honest-absence sentence drifted");
  if (!/if \(!scaffold\) \{\s*return \[bounded\("question", noScaffoldText\(prompt\.subjectId\)\)\];/.test(resolver)) fail("the honest absence is not the single returned guidance");
  return "the single calm sentence is the only path an unknown milestone takes";
});

check("E2", "the capability statements stand verbatim and refuse what they refuse", () => {
  const lens = SRC["src/components/socratic/socratic-lens.tsx"];
  if (!lens.includes("This lens provides conceptual scaffolding and references based on your active milestones. It does not replace your tutor or solve exercises directly.")) fail("the lens capabilities statement drifted");
  const panel = SRC["src/components/tutor/socratic-reflections.tsx"];
  if (!panel.includes("The student's inquiries to the study lens, preserved as asked. They stand here to prepare the next dialogue — nothing on this panel scores, rates or flags them.")) fail("the oversight purpose sentence drifted");
  return "both statements verbatim; the lens names its refusal to solve, the panel its refusal to score";
});

check("E3", "the prompt-type union is closed, cross-pinned against the schema; reflection_summary stays reserved", () => {
  const contract = SRC["src/lib/socratic/contract.ts"];
  const sqlList = [...MIGRATION_0009.match(/prompt_type in \(([^)]*)\)/)[1].matchAll(/'([\w_]+)'/g)].map((m) => m[1]).sort();
  const tsList = [...contract.match(/SOCRATIC_PROMPT_TYPES = \[([\s\S]*?)\] as const/)[1].matchAll(/"([\w_]+)"/g)].map((m) => m[1]).sort();
  if (JSON.stringify(sqlList) !== JSON.stringify(tsList)) fail(`union drift: sql=${sqlList} ts=${tsList}`);
  if (!contract.includes("`reflection_summary` is deliberately UNMAPPED")) fail("the reserved class lost its declaration");
  if (!/PROMPT_TYPE_OF_GUIDANCE: Record<GuidanceKind, SocraticPromptType> = \{\s*hint: "conceptual_hint",\s*question: "socratic_question",\s*reference: "proof_reference",/.test(contract)) fail("the guidance→prompt mapping drifted");
  return `closed four cross-pinned (${sqlList.join(" · ")}); reflection_summary reserved, no guidance kind emits it`;
});

/* ── R · the inherited register ──────────────────────────────────────────── */

check("R1", "the archive's words are kept and its banned vocabulary stays absent", () => {
  const BANNED = ["vod", "replay file", "recording upload"];
  for (const p of ALL) {
    const low = STRIPPED[p].toLowerCase();
    for (const b of BANNED) if (low.includes(b)) fail(`banned archive word "${b}" in ${p}`);
  }
  const card = SRC["src/components/socratic/guidance-card.tsx"];
  const lexicon = SRC["src/lib/socratic/lexicon.ts"];
  if (!lexicon.includes("return `Review ${word} from session on ${dateWord}`;")) fail("the citation sentence drifted");
  if (!card.includes('from "@/lib/socratic/lexicon"')) fail("the card no longer reads the lexicon");
  const resolver = SRC["src/lib/socratic/resolver.ts"];
  if (!resolver.includes('from "@/lib/archive/artifact"') || !resolver.includes("ARTIFACT_WORD")) fail("the resolver lost the archive's words");
  return "VOD/Replay File/Recording Upload absent; citation sentence and ARTIFACT_WORD wiring pinned";
});

check("R2", "the reward register stays banned in every scaffold text and surface string", () => {
  const BANNED = /\b(badge|xp|level[- ]?up|unlock(?:s|ed)?|streak|trophy|medal|leaderboard|congratulations|well done|excellent|great job|good job|percent|rank)\b/i;
  for (const lit of ALL_LITERALS) {
    const hit = lit.match(BANNED);
    if (hit) fail(`reward vocabulary "${hit[0]}" in a surface string: ${lit.slice(0, 60)}`);
  }
  // The single geometric "point" of the scaffold map stays the secant's (Phase 8 W3 precedent).
  const resolver = strip(SRC["src/lib/socratic/resolver.ts"]);
  for (const m of resolver.matchAll(/\bpoints?\b/gi)) {
    const around = resolver.slice(Math.max(0, m.index - 80), m.index + 80);
    if (!around.includes("secant")) fail(`an unpinned 'point' near: ${around.trim().slice(0, 60)}`);
  }
  return "reward register swept across all literals — zero hits; the one geometric 'point' remains the secant's";
});

/* ── the verdict ─────────────────────────────────────────────────────────── */

const passed = checks.filter((c) => c.pass).length;
const report = {
  gate: "phase9-pedagogy",
  window: "W2 — the pedagogical boundary & anti-chatbot audit",
  phase: "Phase 9 · Step 4",
  decision: "DEC-036",
  at: "2026-10-08",
  posture: "pure text audit over committed sources — zero network, zero database, zero identities",
  checks,
  summary: `${passed}/${checks.length} checks passed`,
};
writeFileSync(new URL("../audit/phase9-pedagogy.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.id} · ${c.name}${c.pass ? "" : `\n      ${c.detail}`}`);
console.log(`\n${report.summary}`);
if (passed !== checks.length) process.exit(1);
