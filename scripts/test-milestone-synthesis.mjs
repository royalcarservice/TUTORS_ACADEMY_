#!/usr/bin/env node
// Milestone synthesis tests (Phase 8 · Step 4, DEC-032).
// Pure — zero network, zero database: the relationship LINKING (progress
// facts ↔ session artifacts) is proven offline, then the surfaces are
// pinned — the chronology's register, the privacy wording, the wiring.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-milestone-synthesis.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const S = await import("@/lib/progress/synthesis");
const { milestoneKeyOf, composeMilestoneRecord } = S;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

const SYNTH = "src/lib/progress/synthesis.ts";
const DATA = "src/lib/progress/data.ts";
const VIEW = "src/components/archive/milestone-synthesis.tsx";
const SLOTS = "src/components/student/slots.tsx";
const SLOTMAP = "src/config/student-slots.ts";
const RECORD = "src/components/tutor/record.tsx";
const RELSURFACE = "src/components/tutor/relationship-surface.tsx";
const RELLIB = "src/lib/tutor/relationship.ts";
const REHEARSAL = "src/app/dev/archive-rehearsal/page.tsx";

/* fixtures — the ruled shapes */
const ev = (id, subjectId, kind, at, refId = `ref-${id}`) => ({ id, subjectId, kind, at, refId });
const E1 = ev("e-1", "physics", "session-attended", "2026-09-24T10:00:00.000Z", "sess-1");
const E2 = ev("e-2", "physics", "session-attended", "2026-10-01T10:00:00.000Z", "sess-2");
const E_OTHER = ev("e-3", "mathematics", "session-attended", "2026-10-02T10:00:00.000Z", "sess-3");
const SESSIONS = [
  {
    sessionId: "sess-1",
    title: "The parabola",
    artifacts: [
      { id: "a-board-1", type: "canvas_snapshot", metadata: {}, createdAt: "2026-09-24T11:00:00.000Z" },
      { id: "a-notes-1", type: "pedagogical_notes", metadata: { summary: "Axes first, then the curve." }, createdAt: "2026-09-24T11:05:00.000Z" },
    ],
  },
  {
    sessionId: "sess-2",
    title: "The tangent",
    artifacts: [
      { id: "a-audio-2", type: "session_recording", metadata: {}, createdAt: "2026-10-01T11:10:00.000Z" },
      { id: "a-board-2", type: "canvas_snapshot", metadata: {}, createdAt: "2026-10-01T11:00:00.000Z" },
    ],
  },
];
const LIVE = ["live-classroom"];

/* ── 1 · the arc's own rule names the milestones ──────────────────────────── */
t("key — STEP_EVIDENCE decides, in the arc's own order; unclaimed kinds claim nothing", () => {
  assert.deepEqual(milestoneKeyOf("session-attended"), { key: "learn", label: "Learn in the room" });
  assert.deepEqual(milestoneKeyOf("recording-watched"), { key: "learn", label: "Learn in the room" });
  assert.deepEqual(milestoneKeyOf("work-submitted"), { key: "progress", label: "Watch your record grow" });
});

/* ── 2 · the relationship linking — proven offline ────────────────────────── */
t("link — an attended session joins to its preserved artifacts, chronologically", () => {
  const entries = composeMilestoneRecord([E2, E1], "physics", LIVE, SESSIONS); // unordered input
  assert.equal(entries.length, 2);
  assert.equal(entries[0].achievedAt, "2026-09-24T10:00:00.000Z", "oldest first — the record reads as it happened");
  assert.equal(entries[0].sessionTitle, "The parabola");
  assert.equal(entries[0].milestoneKey, "learn");
  assert.equal(entries[0].notes, "Axes first, then the curve.", "the tutor's notation rides the entry");
  assert.deepEqual(entries[0].artifacts.map((a) => a.id), ["a-board-1", "a-notes-1"], "artifacts stand in their preserved order");
  assert.deepEqual(entries[0].sources, ["e-1"], "traceable: the entry names its row");
  assert.deepEqual(entries[1].artifacts.map((a) => a.word), ["Board Record", "Chamber Audio"], "the archive's own words");
});
t("link — a session the boundary withholds still leaves its fact standing", () => {
  const entries = composeMilestoneRecord([E1], "physics", LIVE, []); // nothing readable
  assert.equal(entries.length, 1);
  assert.equal(entries[0].sessionTitle, null, "no title claimed");
  assert.deepEqual(entries[0].artifacts, [], "no artifacts claimed");
  assert.equal(entries[0].notes, null);
});
t("link — the subject scopes strictly; another subject's facts never enter", () => {
  const entries = composeMilestoneRecord([E1, E_OTHER], "physics", LIVE, SESSIONS);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].sources, ["e-1"]);
});
t("link — the registry gate: an in-progress module speaks no chronology", () => {
  assert.deepEqual(composeMilestoneRecord([E1, E2], "physics", [], SESSIONS), [], "no live modules → nothing");
  assert.equal(composeMilestoneRecord([E1], "physics", LIVE, SESSIONS).length, 1, "live-classroom live → the record speaks");
});
t("link — malformed events are defects, never synthesized around", () => {
  const bad = ev("e-bad", "physics", "session-attended", "not-a-timestamp", "sess-1");
  const entries = composeMilestoneRecord([E1, bad], "physics", LIVE, SESSIONS);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].sources, ["e-1"]);
});
t("link — unknown artifact kinds are dropped, never guessed", () => {
  const sessions = [{ sessionId: "sess-1", title: null, artifacts: [{ id: "a-x", type: "hologram", metadata: {}, createdAt: "2026-09-24T11:00:00.000Z" }] }];
  const entries = composeMilestoneRecord([E1], "physics", LIVE, sessions);
  assert.deepEqual(entries[0].artifacts, []);
});
t("link — deterministic: same facts in, same chronology out", () => {
  const a = composeMilestoneRecord([E2, E1], "physics", LIVE, SESSIONS);
  const b = composeMilestoneRecord([E2, E1], "physics", LIVE, SESSIONS);
  assert.deepEqual(a, b);
});

/* ── 3 · the record-not-score model holds inside the entry ────────────────── */
t("model — an entry carries facts, never figures: no count, ratio, score or rank field exists", () => {
  const entries = composeMilestoneRecord([E1, E2], "physics", LIVE, SESSIONS);
  for (const e of entries) {
    for (const k of Object.keys(e)) {
      assert.doesNotMatch(k, /count|ratio|percent|score|rank|level|points|xp|streak|grade/i, `field "${k}" would be a figure`);
    }
    assert.equal(typeof e.achievedAt, "string", "time is a timestamp, never a number to compare");
    assert.equal(e.sources.length, 1, "one fact, one named row");
  }
});

/* ── 4 · purity — the composition module touches nothing ──────────────────── */
t("purity — synthesis.ts imports no clock, db, env, react, network", () => {
  const src = strip(rawFile(SYNTH));
  assert.doesNotMatch(src, /Date\.now\(|new Date\(|process\.env|supabase|next\/headers|Math\.random|from "react"|fetch\(/);
});
t("purity — the barrel stays untouched: the synthesis is imported by path, like record.ts", () => {
  const barrel = rawFile("src/lib/progress/index.ts");
  assert.doesNotMatch(barrel, /synthesis/, "the 5.6 export surface is not widened");
  assert.match(rawFile(SYNTH), /Not exported from the module/);
});

/* ── 5 · the server reader spells its subjects and lets RLS decide ────────── */
t("reader — EVERY query spells the subject it means; whose-record is spelled too", () => {
  const src = strip(rawFile(DATA));
  assert.match(src, /export async function fetchSubjectMilestonesWithArtifacts\(subjectId: string, studentId: string\)/, "the brief's signature, exact");
  assert.match(src, /\.eq\("student_id", studentId\)/, "whose record is meant — spelled");
  assert.match(src, /\.eq\("subject_id", subjectId\)/, "which environment — spelled, on the facts");
  assert.match(src, /\.eq\("subject_id", subjectId\)\s*\.in\("id", refIds\)/, "sessions scoped to the subject");
  assert.match(src, /\.eq\("subject_id", subjectId\)\s*\.in\("session_id", refIds\)/, "artifacts scoped to the subject and the named sessions only");
});
t("reader — honest absence, honest failure: no identity → empty; a failed read THROWS", () => {
  const src = strip(rawFile(DATA));
  assert.match(src, /if \(!supabase\) return \[\];/, "no identity, no record");
  assert.match(src, /if \(!user\) return \[\];/);
  assert.match(src, /throw new DataReadError\("progress_record", error\)/);
  assert.match(src, /throw new DataReadError\("cohort_sessions", sessionError\)/);
  assert.match(src, /throw new DataReadError\("session_artifacts", artifactError\)/);
  assert.match(src, /composeMilestoneRecord\(events/, "the join is the pure composer's, never the query's");
});
t("reader — the registry gate reaches the composition", () => {
  const src = strip(rawFile(DATA));
  assert.match(src, /liveModuleIds\(\)/, "the arc's own rule decides which kinds may be spoken");
});

/* ── 6 · the view's register — dignified chronology, never reward ─────────── */
t("view — server component; the brief's own phrases stand VERBATIM", () => {
  const raw = rawFile(VIEW);
  assert.doesNotMatch(raw, /^"use client"/m);
  assert.match(raw, /eyebrow: "Conceptual Arc"/);
  assert.match(raw, /reached: "Milestone Reached"/);
  assert.match(raw, /substantiatedBy: \(word: string\) => `Substantiated by \$\{word\}`/);
  assert.match(raw, /studentHeading: \(subjectName: string\) => `Your Milestone Record in \$\{subjectName\}`/);
  assert.match(raw, /tutorHeading: "Milestones co-certified"/);
});
t("view — a chronological ordered list, substantiated by linked artifacts", () => {
  const src = strip(rawFile(VIEW));
  assert.match(src, /<ol /, "the chronology is ordered");
  assert.match(src, /data-milestone-entry/);
  assert.match(src, /data-milestone-key=\{entry\.milestoneKey\}/);
  assert.match(src, /href=\{`\/subjects\/\$\{subjectId\}\/archive#artifact-\$\{a\.id\}`\}/, "each artifact links to its card in the archive");
  assert.match(src, /if \(entries\.length === 0\) return null;/, "empty means absent — no box, no heading, no zero");
});
t("view — the REWARD register is banned; the record-not-score model is swept", () => {
  for (const f of [VIEW, SYNTH, SLOTS, RECORD]) {
    const src = strip(rawFile(f));
    assert.doesNotMatch(src, /badge|unlocked|level up|xp gained|\bxp\b|points|streak|trophy|medal|leaderboard|percent|progress bar|congratulations|well done|you did it/i, `${f} keeps the chronology's dignity`);
  }
});

/* ── 7 · the wiring — student shell and tutor surface ─────────────────────── */
t("wiring (student) — the achievements slot is registered in the reflection region", () => {
  const src = strip(rawFile(SLOTS));
  assert.match(src, /achievements: achievementsSlot/);
  assert.match(src, /region: "reflection"/);
  assert.match(src, /fetchSubjectMilestonesWithArtifacts\(e\.subjectId, user\.id\)/, "the student's OWN record, subject by subject");
  assert.match(src, /status === "active"/, "only active enrolments speak");
  assert.match(src, /if \(entries\.length === 0\) continue;/, "a subject with no record is never named");
  assert.match(rawFile(SLOTMAP), /Phase 8 · Step 4 — the owner's milestone-as-record ruling \(DEC-032\)/, "the written map records the filling");
});
t("wiring (tutor) — the record region reads by the relationship's join key; nothing renders it", () => {
  const src = strip(rawFile(RECORD));
  assert.match(src, /fetchSubjectMilestonesWithArtifacts\(view\.subjectId, view\.studentId\)/);
  assert.match(src, /if \(entries\.length === 0\) return null;/, "empty means absent");
  assert.match(src, /viewer="tutor"/);
  const rel = rawFile(RELLIB);
  assert.match(rel, /studentId: string;/, "the view carries the join key");
  assert.match(rel, /never a displayed fact/, "the key's purpose is declared");
  const surface = strip(rawFile(RELSURFACE));
  assert.doesNotMatch(surface, /studentId/, "the surface renders the key nowhere (P6-R2 stands)");
});

/* ── 8 · the rehearsal proves both registers ──────────────────────────────── */
t("rehearsal — the production composer runs on specimen facts, in both registers", () => {
  const src = rawFile(REHEARSAL);
  assert.match(src, /composeMilestoneRecord\(events, subjectId, \["live-classroom"\], sessions\)/, "the rehearsal declares the module live and says so");
  assert.match(src, /<MilestoneSynthesis[^>]*viewer="student"/);
  assert.match(src, /<MilestoneSynthesis[^>]*viewer="tutor"/);
});

/* ── 9 · the discipline sweeps ────────────────────────────────────────────── */
t("sweep — zero telemetry, no exclamation marks in copy, no emoji", () => {
  for (const f of [VIEW, SYNTH, SLOTS, RECORD]) {
    const src = strip(rawFile(f));
    assert.doesNotMatch(src, /setTimeout|setInterval|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|analytics|telemetry|visibilitychange/i, `${f} stays clean`);
    const raw = rawFile(f);
    const literals = raw.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g) ?? [];
    for (const lit of literals) assert.ok(!lit.includes("!"), `${f} speaks without exclamation marks: ${lit.slice(0, 40)}`);
    assert.doesNotMatch(raw, EMOJI, `${f} carries no emoji`);
  }
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
console.log(`\n${n - failed}/${n} milestone-synthesis tests passed`);
process.exit(failed === 0 ? 0 : 1);
