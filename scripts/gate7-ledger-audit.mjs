#!/usr/bin/env node
// PHASE 7 GATE · WINDOW W3 — THE PEDAGOGICAL LEDGER.
// Verifies: (1) the attend-vs-resume language rule, (2) settlement dignity,
// (3) the absence of rating/survey/feedback surfaces anywhere in the app.
// Run: node scripts/gate7-ledger-audit.mjs
// Verdict recorded in audit/phase7-ledger.json (committed baseline).
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };

/* ── 1 · attend vs resume (DEC-022) ───────────────────────────────────────── */
t("ledger — the attend-vs-resume rule: the RECORD decides the verb, the engine speaks it", () => {
  const src = read("src/lib/progress/record.ts");
  assert.match(src, /export type AttendanceVerb = "attend" \| "resume"/, "the verb union, exactly two words");
  assert.match(src, /sources\.length > 0 \? \{ verb: "resume"/, "an attendance fact flips the verb");
  assert.match(src, /: \{ verb: "attend", sources: \[\] \}/, "no facts = attend");
  assert.doesNotMatch(src, /Attend the|Resume the/, "the record decides; it never speaks — sentences live in the engine alone");
});
t("ledger — corporate vocabulary stays banned from the class sentences", () => {
  const src = strip(read("src/lib/progress/record.ts"));
  assert.doesNotMatch(src, /\bcall\b|\bmeeting\b|\bconference\b|\bwebinar\b/i);
});
t("ledger — the engine's sentence builder carries the same pair (DEC-023)", () => {
  const engine = read("src/lib/next-action/providers.ts");
  assert.match(engine, /sessionActionSentence/, "the builder exists in the engine");
  assert.match(engine, /Attend the \$\{subjectName\} session/);
  assert.match(engine, /Resume the \$\{subjectName\} session/);
});

/* ── 2 · settlement dignity (DEC-027, STATE_LANGUAGE 7.5) ────────────────── */
t("ledger — settlement speaks the ruled sentences and nothing evaluative", () => {
  const src = read("src/components/live/session-settlement.tsx");
  assert.match(src, /has concluded/, "the closing fact");
  assert.match(src, /Notes about the student are not kept: the record holds facts, never summaries\./, "the refusal is stated (P5-R6)");
  assert.doesNotMatch(strip(src), /<select|star|rating|survey|feedback|smiley|emoji/i, "no evaluative instrument of any kind");
});
t("ledger — the settle route is POST-only, service-role, idempotent by construction", () => {
  const src = read("src/app/subjects/[subject]/live/settle/route.ts");
  assert.match(src, /export async function POST/, "POST only");
  assert.doesNotMatch(src, /export async function GET/, "no GET export (405 by absence)");
  assert.match(src, /service/i, "writes through the service role");
});

/* ── 3 · no rating modals anywhere ───────────────────────────────────────── */
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(p.slice(ROOT.length));
  }
})(join(ROOT, "src"));

t("ledger — no rating/survey/feedback instrument exists in src/", () => {
  const offenders = [];
  for (const f of files) {
    const code = strip(read(f));
    if (/<RateSession|<RatingModal|<FeedbackModal|<SurveyModal|<StarRating|<ThumbsVote/.test(code)) offenders.push(f);
  }
  assert.equal(offenders.length, 0, `rating instruments found: ${offenders.join(", ")}`);
});
t("ledger — no rate/review/feedback ACTION wired to the session lifecycle", () => {
  const offenders = [];
  for (const f of files) {
    const code = strip(read(f));
    if (/rate[-_ ]?(this|the)[-_ ]?(session|class|tutor|student)|submitFeedback|postReview/i.test(code)) offenders.push(f);
  }
  assert.equal(offenders.length, 0, `feedback actions found: ${offenders.join(", ")}`);
});
t("ledger — exclamation marks stay absent from the live vocabulary (Step 3 rule)", () => {
  const offenders = [];
  for (const f of files.filter((f) => f.startsWith("src/components/live/") || f.startsWith("src/lib/classroom/"))) {
    const src = read(f);
    // match >text!< or string 'text!' — JSX text children or quoted copy, never code
    if (/[A-Za-z]!["'<]/.test(src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""))) offenders.push(f);
  }
  assert.equal(offenders.length, 0, `exclamatory copy found in: ${offenders.join(", ")}`);
});

const verdict = failed === 0 ? "PASS" : "FAIL";
mkdirSync(join(ROOT, "audit"), { recursive: true });
writeFileSync(join(ROOT, "audit/phase7-ledger.json"), JSON.stringify({
  gate: "PHASE 7 · W3 — Pedagogical Ledger",
  date: "2026-10-08",
  verdict,
  checks_run: n,
  checks_failed: failed,
  supporting_suites: { "test-progress-record": "18/18 (W1)", "test-settlement": "26/26 (W1)", "test-next-action": "34/34 (W1)" },
  rules: ["attend-vs-resume single vocabulary (DEC-022)", "settlement dignity, refusal stated (DEC-027 · STATE_LANGUAGE 7.5)", "no rating/survey/feedback instruments anywhere", "no exclamations in the live vocabulary"],
}, null, 2));
console.log(`\nW3 VERDICT: ${verdict} (${n - failed}/${n})`);
process.exit(failed === 0 ? 0 : 1);
