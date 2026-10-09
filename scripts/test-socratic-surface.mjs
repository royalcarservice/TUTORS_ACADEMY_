#!/usr/bin/env node
// Socratic surface tests (Phase 9 · Step 2, DEC-034).
// Raw-file pins and the presentational math, offline: the lens's verbatim
// sentences, the composer's discipline (300-char cap, closed error
// vocabulary), the guidance card's badges, the anti-chatbot register, the
// slot wiring, the rehearsal discipline, and the action's posture.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-socratic-surface.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const LEXICON = await import("@/lib/socratic/lexicon");
const { GUIDANCE_BADGE, artifactLinkText, dateWordOf } = LEXICON;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const literalsOf = (src) => [...strip(src).matchAll(/"([^"\\]*)"|'([^'\\]*)'|`([^`\\]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);

const LENS = "src/components/socratic/socratic-lens.tsx";
const COMPOSER = "src/components/socratic/inquiry-composer.tsx";
const CARD_SRC = "src/components/socratic/guidance-card.tsx";
const REGIONS = "src/components/student/environment-regions.tsx";
const PAGE = "src/app/subjects/[subject]/page.tsx";
const SLOTS = "src/config/student-slots.ts";
const MODULES = "src/config/modules.ts";
const ACTIONS = "src/lib/socratic/actions.ts";
const CONTRACT = "src/lib/socratic/contract.ts";
const STATE = "docs/STATE_LANGUAGE.md";
const REHEARSAL_DIR = ["src/app/dev/socratic-rehearsal/page.tsx", "src/app/dev/socratic-rehearsal/preview.tsx"];

/* ── 1 · the lens's verbatim sentences ───────────────────────────────────── */
t("lens — the title, the capabilities statement and the empty sentence stand verbatim", () => {
  const src = rawFile(LENS);
  assert.ok(src.includes("`Pedagogical Reflection · ${subjectName}`"));
  assert.ok(src.includes("This lens provides conceptual scaffolding and references based on your active milestones. It does not replace your tutor or solve exercises directly."));
  assert.ok(src.includes("No reflections are recorded here yet. Ask about the stage you are working on; the lens keeps the guidance it returns."));
});

t("lens — one architectural region: bordered, marked, no widget anatomy", () => {
  const src = rawFile(LENS);
  assert.ok(src.includes("data-socratic-lens"));
  assert.ok(src.includes("<SubjectMark"), "the subject mark stands in the header");
  assert.ok(src.includes("aria-label={LENS_COPY.titleOf(subjectName)}"));
});

/* ── 2 · the composer's discipline ───────────────────────────────────────── */
t("composer — the 300-char cap rides the contract's constant, on the field and in the check", () => {
  const src = rawFile(COMPOSER);
  assert.ok(src.includes("maxLength={COMPOSER_CHAR_LIMIT}"));
  assert.ok(src.includes("e.target.value.slice(0, COMPOSER_CHAR_LIMIT)"));
  assert.ok(src.includes("trimmed.length > COMPOSER_CHAR_LIMIT"));
});

t("composer — placeholder, labels and the ONE action stand verbatim", () => {
  const src = rawFile(COMPOSER);
  assert.ok(src.includes("`Formulate a question about ${concept}...`"));
  assert.ok(src.includes('milestoneLabel: "Milestone"'));
  assert.ok(src.includes('inquiryLabel: "Your inquiry"'));
  assert.ok(src.includes('submit: "Reflect"'));
});

t("composer — the closed vocabulary of calm failure, no exclamation anywhere", () => {
  const src = rawFile(COMPOSER);
  assert.ok(src.includes("Write the question first; the lens reflects on what you ask."));
  assert.ok(src.includes("A shorter question serves reflection best. The limit is three hundred characters."));
  assert.ok(src.includes("The reflection could not be recorded. The lens stays as it was; try again when you are ready."));
  for (const lit of literalsOf(src)) assert.ok(!lit.includes("!"), `exclamation in: ${lit.slice(0, 50)}`);
});

/* ── 3 · the guidance card ───────────────────────────────────────────────── */
t("card — the three badge words stand verbatim, in the brief's register", () => {
  assert.equal(GUIDANCE_BADGE.question, "Guiding Question");
  assert.equal(GUIDANCE_BADGE.hint, "Conceptual Hint");
  assert.equal(GUIDANCE_BADGE.reference, "Proof Reference");
});

t("card — the citation sentence and the deterministic date words", () => {
  assert.equal(artifactLinkText("Session Notation", "24 September 2026"), "Review Session Notation from session on 24 September 2026");
  assert.equal(dateWordOf("2026-09-24T11:05:00.000Z"), "24 September 2026");
  assert.equal(dateWordOf("2026-01-01T00:00:00.000Z"), "1 January 2026");
});

/* ── 4 · the anti-chatbot register ───────────────────────────────────────── */
t("register — zero chatbot anatomy in any socratic surface", () => {
  const BANNED = ["avatar", "speech bubble", "chat bubble", "chatbot", "typing indicator", "typing-indicator", "pulsing", "dots animation"];
  for (const p of [LENS, COMPOSER, CARD_SRC, ...REHEARSAL_DIR]) {
    const low = strip(rawFile(p)).toLowerCase();
    for (const b of BANNED) assert.ok(!low.includes(b), `${b} in ${p}`);
  }
});

t("register — zero cheerful conversational greetings or filler", () => {
  const BANNED = ["hey there", "how can i help you today", "certainly", "great question", "i'd love to help", "happy to help", "hello there", "good question!", "well done"];
  for (const p of [LENS, COMPOSER, CARD_SRC, ACTIONS, ...REHEARSAL_DIR]) {
    const low = strip(rawFile(p)).toLowerCase();
    for (const b of BANNED) assert.ok(!low.includes(b), `"${b}" in ${p}`);
  }
});

t("register — zero animation vocabulary: the lens is architecture, not theatre", () => {
  const BANNED = ["animation", "keyframe", "bounce", "spring", "pulse", "float", "transition", "framer-motion", "animate"];
  for (const p of [LENS, COMPOSER, CARD_SRC]) {
    const low = strip(rawFile(p)).toLowerCase();
    for (const b of BANNED) assert.ok(!low.includes(b), `"${b}" in ${p}`);
  }
});

t("register — no emoji in any socratic surface", () => {
  for (const p of [LENS, COMPOSER, CARD_SRC, ACTIONS, ...REHEARSAL_DIR]) {
    assert.ok(!EMOJI.test(rawFile(p)), `emoji in ${p}`);
  }
});

/* ── 5 · the wiring ──────────────────────────────────────────────────────── */
t("wiring — the ai-assistance resolver renders the lens from ctx.socratic only", () => {
  const src = rawFile(REGIONS);
  assert.ok(src.includes('"ai-assistance":'));
  assert.ok(src.includes("ctx.socratic ?"));
  assert.ok(src.includes("socratic?: SocraticLensData"));
});

t("wiring — the page reads the lens data through its own isolate and passes it", () => {
  const src = rawFile(PAGE);
  assert.ok(src.includes('import { fetchSocraticLensData } from "@/lib/socratic/data"'));
  assert.ok(src.includes('isolateAsync("region:socratic"'));
  assert.ok(src.includes("socratic: socratic.ok ? socratic.value : undefined"));
});

t("wiring — the slot map declares the facts gate for ai-assistance (the DEC-008 precedent)", () => {
  const src = rawFile(SLOTS);
  const envBlock = src.slice(src.indexOf("export const ENVIRONMENT_SLOTS"), src.indexOf("export interface StudentSlotDef"));
  const entry = envBlock.slice(envBlock.indexOf('"ai-assistance"'));
  assert.ok(entry.includes('gate: "facts"'));
  // The declared-extension note STANDS DIRECTLY ABOVE the entry in the map.
  const note = envBlock.slice(0, envBlock.indexOf('"ai-assistance"'));
  assert.ok(note.includes("DEC-034"));
  assert.ok(note.includes("DEC-008 precedent"));
});

t("honesty — the ai-assistant module STAYS planned; the summary names scaffolding, never solutions", () => {
  const src = rawFile(MODULES);
  const block = src.slice(src.indexOf('id: "ai-assistant"'));
  const entry = block.slice(0, block.indexOf("},"));
  assert.ok(entry.includes('status: "planned"'));
  assert.ok(entry.includes("never solutions"));
  assert.ok(!entry.toLowerCase().includes("doubt solving"));
});

/* ── 6 · the rehearsal discipline & the action's posture ─────────────────── */
t("rehearsal — the rehearsal prop is set ONLY by the dev route", () => {
  for (const p of [PAGE, REGIONS, "src/components/student/slots.tsx", "src/components/student/student-shell.tsx"]) {
    assert.ok(!rawFile(p).includes("rehearsalComposer"), `rehearsal prop in ${p}`);
    assert.ok(!rawFile(p).includes("rehearsal="), `rehearsal prop in ${p}`);
  }
  const page = rawFile(REHEARSAL_DIR[0]);
  assert.ok(page.includes('if (process.env.NODE_ENV === "production") notFound();'));
});

t("action — one server seam, no identity argument, the closed outcome vocabulary", () => {
  const src = rawFile(ACTIONS);
  assert.ok(src.startsWith('"use server"'));
  assert.ok(src.includes("export async function reflectOnInquiry(input: {"));
  assert.ok(src.includes('"empty" | "overlong" | "refused"'));
  assert.ok(src.includes("identity.role !== \"student\""));
  assert.ok(!/function reflectOnInquiry\([^)]*identity/i.test(src), "identity may never be an argument");
  for (const lit of literalsOf(src)) assert.ok(!lit.includes("!"), `exclamation in action string: ${lit.slice(0, 40)}`);
});

t("contract — the composer's 300 sits below the contract's 500 (the outer bound the DB mirrors)", () => {
  const src = rawFile(CONTRACT);
  assert.ok(src.includes("export const COMPOSER_CHAR_LIMIT = 300;"));
  assert.ok(src.includes("export const MAX_INQUIRY_CHARS = 500;"));
});

t("STATE_LANGUAGE — the 9.2 addendum pins the composer's sentences", () => {
  const src = rawFile(STATE);
  assert.ok(src.includes("9.2 addendum"));
  assert.ok(src.includes("Write the question first; the lens reflects on what you ask."));
  assert.ok(src.includes("The reflection could not be recorded."));
});

console.log(`\n${n - failed}/${n} socratic surface tests passed`);
if (failed > 0) process.exit(1);
