#!/usr/bin/env node
// Socratic engine tests (Phase 9 · Step 1, DEC-033).
// Pure — zero network, zero database: the resolver's determinism, subject
// isolation, brevity discipline, scaffolding-never-answers posture and the
// archive reference rule are proven offline, then the contract's union and
// the migration's CHECK list are pinned against each other.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-socratic-logic.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const CONTRACT = await import("@/lib/socratic/contract");
const RESOLVER = await import("@/lib/socratic/resolver");
const { MAX_INQUIRY_CHARS, MAX_GUIDANCE_CHARS, SOCRATIC_PROMPT_TYPES, GUIDANCE_KINDS, checkInquiry, fitsGuidanceLimit } = CONTRACT;
const { CONCEPT_SCAFFOLDS, parseMilestoneKey, scaffoldFor, milestoneKeysFor, asksForCompletion, resolveGuidance } = RESOLVER;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

const MIGRATION = "supabase/migrations/20261008000009_phase9_socratic.sql";
const RESOLVER_SRC = "src/lib/socratic/resolver.ts";
const CONTRACT_SRC = "src/lib/socratic/contract.ts";

const artifact = (id, subjectId, type, createdAt, metadata = {}) =>
  ({ id, sessionId: `sess-${id}`, subjectId, type, storagePath: `${subjectId}/sess-${id}/${id}`, metadata, createdAt });
const NOTES = artifact("a-notes-1", "physics", "pedagogical_notes", "2026-09-24T11:05:00.000Z", { summary: "Axes first, then the curve." });
const BOARD = artifact("a-board-1", "physics", "canvas_snapshot", "2026-09-24T11:00:00.000Z");
const AUDIO = artifact("a-audio-1", "physics", "session_recording", "2026-09-23T09:00:00.000Z");

const prompt = (over = {}) => ({
  subjectId: "physics",
  currentMilestone: "physics:harmonic-motion",
  studentInquiry: "What determines the period of the oscillation?",
  previousArtifacts: [],
  ...over,
});

/* ── 1 · the contract's pins ─────────────────────────────────────────────── */
t("contract — the brevity limits are 500 and 500, exactly as briefed", () => {
  assert.equal(MAX_INQUIRY_CHARS, 500);
  assert.equal(MAX_GUIDANCE_CHARS, 500);
});

t("contract — the prompt-type union is the closed four", () => {
  assert.deepEqual([...SOCRATIC_PROMPT_TYPES], ["conceptual_hint", "socratic_question", "proof_reference", "reflection_summary"]);
});

t("contract — the guidance union has no answer kind: hint, question, reference only", () => {
  assert.deepEqual([...GUIDANCE_KINDS], ["hint", "question", "reference"]);
  assert.ok(!GUIDANCE_KINDS.includes("answer"));
});

t("contract — checkInquiry trims, admits the boundary, refuses empty and overlong", () => {
  assert.deepEqual(checkInquiry("  what is force?  "), { ok: true, text: "what is force?" });
  assert.deepEqual(checkInquiry("   "), { ok: false, reason: "empty" });
  assert.deepEqual(checkInquiry(""), { ok: false, reason: "empty" });
  assert.deepEqual(checkInquiry("a".repeat(500)), { ok: true, text: "a".repeat(500) });
  assert.deepEqual(checkInquiry("a".repeat(501)), { ok: false, reason: "overlong" });
});

/* ── 2 · the milestone key's grammar and subject isolation ───────────────── */
t("key — one separator, two non-empty segments; malformed keys parse to nothing", () => {
  assert.deepEqual(parseMilestoneKey("physics:harmonic-motion"), { subjectId: "physics", slug: "harmonic-motion" });
  assert.equal(parseMilestoneKey("harmonic-motion"), null);
  assert.equal(parseMilestoneKey(":harmonic-motion"), null);
  assert.equal(parseMilestoneKey("physics:"), null);
  assert.equal(parseMilestoneKey("physics:a:b"), null);
});

t("isolation — a key naming another subject resolves to nothing", () => {
  assert.equal(scaffoldFor("mathematics", "physics:harmonic-motion"), null);
  assert.equal(scaffoldFor("physics", "mathematics:limits-continuity"), null);
});

t("coverage — every subject in the config holds at least one scaffold key, each prefixed by its own subject", () => {
  for (const subject of ["mathematics", "physics", "chemistry", "biology", "english", "history"]) {
    const keys = milestoneKeysFor(subject);
    assert.ok(keys.length >= 1, `no scaffolds for ${subject}`);
    for (const k of keys) assert.ok(k.startsWith(`${subject}:`), `key ${k} lacks its subject prefix`);
  }
});

t("brief's example — Physics, Classical Mechanics → Harmonic Motion, resolves", () => {
  const s = scaffoldFor("physics", "physics:harmonic-motion");
  assert.ok(s, "the brief's example milestone must resolve");
  assert.equal(s.path, "Classical Mechanics → Harmonic Motion");
});

/* ── 3 · the resolution — determinism, order, brevity ────────────────────── */
t("determinism — the same prompt yields the same guidance, byte for byte", () => {
  const p = prompt({ previousArtifacts: [NOTES, BOARD, AUDIO] });
  const a = resolveGuidance(p), b = resolveGuidance(p);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

t("known milestone — question first, then hint, then proof reference", () => {
  const g = resolveGuidance(prompt());
  assert.deepEqual(g.map((x) => x.guidanceType), ["question", "hint", "reference"]);
  assert.ok(g.every((x) => x.referencedArtifactId === undefined), "no artifact cited when the archive is absent");
});

t("every guidance fits the cap and says something", () => {
  for (const s of CONCEPT_SCAFFOLDS) {
    const g = resolveGuidance(prompt({ subjectId: s.subjectId, currentMilestone: s.key }));
    for (const x of g) {
      assert.ok(fitsGuidanceLimit(x.responseText), `${s.key}: guidance over the cap`);
      assert.ok(x.responseText.length <= MAX_GUIDANCE_CHARS);
      assert.ok(GUIDANCE_KINDS.includes(x.guidanceType));
    }
  }
});

t("empty inquiry — one calm redirection, nothing else", () => {
  const g = resolveGuidance(prompt({ studentInquiry: "   " }));
  assert.equal(g.length, 1);
  assert.equal(g[0].guidanceType, "question");
  assert.equal(g[0].responseText, "Name the concept you are working on, and say what about it feels unresolved. One or two sentences serve reflection best.");
});

t("overlong inquiry — one calm condensation sentence, never an answer", () => {
  const g = resolveGuidance(prompt({ studentInquiry: "a".repeat(501) }));
  assert.equal(g.length, 1);
  assert.equal(g[0].guidanceType, "question");
  assert.equal(g[0].responseText, "A shorter question serves reflection best. Restate what you are asking in at most five hundred characters, and the scaffold will meet it there.");
});

/* ── 4 · scaffolding, never answers ──────────────────────────────────────── */
t("completion demands — each class receives the one disciplined redirect", () => {
  const redirect = "This engine keeps the concept's scaffold and its questions; the working stays the student's own. Take the first step the concept asks of you, and say what you notice.";
  const demands = [
    "Please solve this problem for me.",
    "Just tell me the final answer.",
    "Write my essay about the industrial revolution.",
    "Do my homework on limits and continuity.",
    "Give me the solution to this equation.",
  ];
  for (const d of demands) {
    assert.ok(asksForCompletion(d), `not flagged: ${d}`);
    const g = resolveGuidance(prompt({ studentInquiry: d }));
    assert.equal(g.length, 1, `demand should yield one guidance: ${d}`);
    assert.equal(g[0].guidanceType, "question");
    assert.equal(g[0].responseText, redirect);
  }
});

t("legitimate conceptual questions are never mistaken for demands", () => {
  for (const q of ["What determines the period of a pendulum?", "why does the limit not exist there?", "how does the equilibrium respond to a change in temperature?"]) {
    assert.ok(!asksForCompletion(q), `falsely flagged: ${q}`);
  }
});

/* ── 5 · honest absence ──────────────────────────────────────────────────── */
t("unknown milestone — one calm sentence naming the subject; nothing invented", () => {
  const g = resolveGuidance(prompt({ currentMilestone: "physics:quantum-teleportation" }));
  assert.equal(g.length, 1);
  assert.equal(g[0].guidanceType, "question");
  assert.equal(g[0].responseText, "No scaffold is recorded yet for this milestone in Physics. Bring the question to your next session, or ask about a stage the subject's scaffold names.");
});

t("cross-subject key — resolves as honest absence, never the other subject's scaffold", () => {
  const g = resolveGuidance(prompt({ subjectId: "mathematics", currentMilestone: "physics:harmonic-motion" }));
  assert.equal(g.length, 1);
  assert.ok(g[0].responseText.includes("Mathematics"));
  assert.ok(!g[0].responseText.includes("restoring force"));
});

/* ── 6 · the archive, referenced ─────────────────────────────────────────── */
t("archive — a Session Notation with a summary is cited, newest standing, by id", () => {
  const g = resolveGuidance(prompt({ previousArtifacts: [BOARD, NOTES, AUDIO] }));
  assert.equal(g.length, 4);
  const cite = g[3];
  assert.equal(cite.guidanceType, "reference");
  assert.equal(cite.referencedArtifactId, "a-notes-1");
  assert.ok(cite.responseText.includes("Session Notation"), "the archive's own word");
  assert.ok(cite.responseText.includes("2026-09-24"), "the record's own date");
});

t("archive — a notation without a summary stands aside; the newest board is cited", () => {
  const silentNotes = artifact("a-notes-2", "physics", "pedagogical_notes", "2026-09-25T11:05:00.000Z", {});
  const g = resolveGuidance(prompt({ previousArtifacts: [silentNotes, BOARD] }));
  const cite = g[3];
  assert.equal(cite.referencedArtifactId, "a-board-1");
  assert.ok(cite.responseText.includes("Board Record"));
});

t("archive — a notation WITH a summary outranks a newer board (content over recency)", () => {
  const newerBoard = artifact("a-board-9", "physics", "canvas_snapshot", "2026-10-05T11:00:00.000Z");
  const g = resolveGuidance(prompt({ previousArtifacts: [newerBoard, NOTES] }));
  assert.equal(g[3].referencedArtifactId, "a-notes-1");
});

t("archive — artifacts of another subject are never seen", () => {
  const foreign = artifact("a-board-m", "mathematics", "canvas_snapshot", "2026-09-30T11:00:00.000Z");
  const g = resolveGuidance(prompt({ previousArtifacts: [foreign] }));
  assert.equal(g.length, 3);
  assert.ok(g.every((x) => x.referencedArtifactId === undefined));
});

t("archive — ties of time settle by id, deterministically", () => {
  const b1 = artifact("a-board-x", "physics", "canvas_snapshot", "2026-09-24T11:00:00.000Z");
  const b2 = artifact("a-board-y", "physics", "canvas_snapshot", "2026-09-24T11:00:00.000Z");
  const g = resolveGuidance(prompt({ previousArtifacts: [b1, b2] }));
  assert.equal(g[3].referencedArtifactId, "a-board-y");
});

/* ── 7 · the register and the purity pins ────────────────────────────────── */
t("register — no exclamation, no emoji, in any text the engine can speak", () => {
  const texts = [];
  for (const s of CONCEPT_SCAFFOLDS) {
    texts.push(s.hint, s.question, s.proof, s.path);
    const g = resolveGuidance(prompt({ subjectId: s.subjectId, currentMilestone: s.key, previousArtifacts: [NOTES, BOARD] }));
    for (const x of g) texts.push(x.responseText);
  }
  texts.push("No scaffold is recorded yet for this milestone in Physics. Bring the question to your next session, or ask about a stage the subject's scaffold names.");
  for (const x of texts) {
    assert.ok(!x.includes("!"), `exclamation in: ${x.slice(0, 40)}`);
    assert.ok(!EMOJI.test(x), `emoji in: ${x.slice(0, 40)}`);
  }
});

t("register — zero psychological diagnosis or sentiment grading vocabulary", () => {
  const BANNED = ["anxious", "frustrat", "depress", "sentiment", "mood", "lazy", "gifted", "intelligence", "diagnos", "personality", "self-esteem"];
  const texts = [];
  for (const s of CONCEPT_SCAFFOLDS) texts.push(s.hint, s.question, s.proof);
  texts.push(rawFile(RESOLVER_SRC).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""));
  for (const x of texts) {
    const low = x.toLowerCase();
    for (const b of BANNED) assert.ok(!low.includes(b), `diagnosis vocabulary (${b}) in: ${x.slice(0, 60)}`);
  }
});

t("register — the reward vocabulary stays banned in every scaffold text (word boundaries; the one geometric 'point' is declared, Phase 8 W3 precedent)", () => {
  const BANNED = /\b(badge|xp|level[- ]?up|unlock(?:s|ed)?|streak|trophy|medal|leaderboard|congratulations|well done|excellent|great job|score)\b/i;
  for (const s of CONCEPT_SCAFFOLDS) {
    const text = `${s.hint} ${s.question} ${s.proof} ${s.path}`;
    const hit = text.match(BANNED);
    assert.equal(hit, null, `reward vocabulary in ${s.key}: ${hit && hit[0]}`);
  }
  // The single word "point" the map speaks is the secant's geometric point
  // — pinned here so a future reward sense of it can never slip through.
  for (const s of CONCEPT_SCAFFOLDS) {
    const text = `${s.hint} ${s.question} ${s.proof}`;
    if (/\bpoints?\b/i.test(text)) {
      assert.equal(s.key, "mathematics:differentiation", `unpinned 'point' in ${s.key}`);
      assert.ok(text.includes("secants"), "the 'point' must stay the secant's");
    }
  }
});

t("purity — the resolver holds no clock, no randomness, no network, no react", () => {
  const src = strip(rawFile(RESOLVER_SRC));
  for (const banned of ["Math.random", "Date.now", "new Date(", "fetch(", "createClient", "setTimeout", "setInterval", "process.env"]) {
    assert.ok(!src.includes(banned), `resolver contains ${banned}`);
  }
  const csrc = strip(rawFile(CONTRACT_SRC));
  for (const banned of ["Math.random", "Date.now", "fetch(", "createClient", "react"]) {
    assert.ok(!csrc.toLowerCase().includes(banned), `contract contains ${banned}`);
  }
});

t("integration — the resolver reads the archive's record shape from the pure seam", () => {
  const src = rawFile(RESOLVER_SRC);
  assert.ok(src.includes('from "@/lib/archive/artifact"'), "archive integration missing");
  assert.ok(src.includes("ARTIFACT_WORD"), "the archive's own words missing");
});

/* ── 8 · the migration, cross-pinned against the contract ────────────────── */
t("migration — the prompt_type CHECK equals the contract's closed four", () => {
  const sql = rawFile(MIGRATION);
  const check = sql.match(/prompt_type in \(([^)]*)\)/)[1];
  const inSql = [...check.matchAll(/'([\w_]+)'/g)].map((m) => m[1]);
  assert.deepEqual(inSql.sort(), [...SOCRATIC_PROMPT_TYPES].sort());
});

t("migration — RLS enabled AND forced; the brief's index; no update/delete; anon admitted nowhere", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/alter table public\.socratic_exchanges enable row level security/.test(sql));
  assert.ok(/alter table public\.socratic_exchanges force row level security/.test(sql));
  assert.ok(sql.includes("(student_id, subject_id, created_at)"));
  assert.ok(!/for update/.test(sql), "an update policy exists");
  assert.ok(!/for delete/.test(sql), "a delete policy exists");
  assert.ok(!/to anon/.test(sql), "a policy admits anon");
  assert.ok(/student_id = auth\.uid\(\)/.test(sql), "the student boundary missing");
  assert.ok(/is_related_tutor\(student_id, subject_id\)/.test(sql), "the tutor boundary missing");
});

t("migration — the DB mirrors the 500-character cap on the inquiry", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(sql.includes("char_length(query_text) between 1 and 500"));
  assert.ok(/octet_length\(response_payload::text\) <= 16384/.test(sql));
});

console.log(`\n${n - failed}/${n} socratic logic tests passed`);
if (failed > 0) process.exit(1);
