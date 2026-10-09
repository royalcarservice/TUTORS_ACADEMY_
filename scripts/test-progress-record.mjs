#!/usr/bin/env node
// Progress-record helper tests (Phase 7 · Step 1). Pure — no server, no DB.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-progress-record.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const R = await import("@/lib/progress/record");
const P = await import("@/lib/progress");

const { appendEvent, attendanceState, historyForSubject } = R;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const src = (f) => strip(readFileSync(new URL(`../src/lib/progress/${f}`, import.meta.url), "utf8"));

/* fixture events — the ruled shape (who/where/kind/when/referent, nothing else) */
const ev = (id, subjectId, kind, at, refId = `ref-${id}`) => ({ id, subjectId, kind, at, refId });
const A1 = ev("e-a1", "physics", "session-attended", "2026-10-08T10:00:00Z");
const A2 = ev("e-a2", "physics", "session-attended", "2026-10-09T10:00:00Z");
const M1 = ev("e-m1", "mathematics", "session-attended", "2026-10-08T11:00:00Z");
const W1 = ev("e-w1", "physics", "work-submitted", "2026-10-08T12:00:00Z");
const BAD_TS = ev("e-bad", "physics", "session-attended", "not-a-date");
const LIVE_NONE = [];
const LIVE_LC = ["live-classroom"];

/* purity */
t("purity — record.ts imports no clock reads, db, env, react", () => {
  assert.doesNotMatch(src("record.ts"), /Date\.now\(|new Date\(|process\.env|supabase|next\/headers|Math\.random|from "react"|fetch\(/, "record.ts impure");
  const imports = src("record.ts").match(/^import .*$/gm) ?? [];
  assert.deepEqual(imports.map((l) => l.match(/from "(.+)"/)[1]).sort(), ["./derive", "./events", "@/lib/student/contract"]);
});
t("the 5.6 barrel is untouched — the pinned export surface still holds", () => {
  assert.deepEqual(Object.keys(P).sort(), ["EVENT_KINDS", "EVENT_KIND_MODULE", "STEP_EVIDENCE", "admissibleKinds", "arcPosition", "countByKind", "latestEvent", "validateEvents"]);
});
t("exports — exactly the declared surface of record.ts", () => {
  assert.deepEqual(Object.keys(R).sort(), ["appendEvent", "attendanceState", "historyForSubject"]);
  for (const k of Object.keys(R)) assert.doesNotMatch(k, /ratio|percent|score|streak|track|predict|compare|rank/i);
});

/* appendEvent */
t("appendEvent — appends a well-formed fact, immutably, order preserved", () => {
  const before = [A1];
  const { valid, defects } = appendEvent(before, A2);
  assert.deepEqual(valid.map((e) => e.id), ["e-a1", "e-a2"]);
  assert.deepEqual(defects, []);
  assert.equal(before.length, 1, "input must not be mutated");
  assert.notEqual(valid, before);
});
t("appendEvent — a malformed fact is a named defect, never silently added", () => {
  const { valid, defects } = appendEvent([A1], BAD_TS);
  assert.deepEqual(valid.map((e) => e.id), ["e-a1"]);
  assert.equal(defects.length, 1);
  assert.equal(defects[0].field, "at");
});

/* historyForSubject */
t("history — empty record is an empty history, not an error", () => {
  assert.deepEqual(historyForSubject(LIVE_NONE.length ? [] : [], "physics", LIVE_LC), []);
  assert.deepEqual(historyForSubject([], "physics", LIVE_LC), []);
});
t("history — other subjects stay out (subject isolation)", () => {
  const h = historyForSubject([A1, M1], "physics", LIVE_LC);
  assert.deepEqual(h.map((e) => e.id), ["e-a1"]);
});
t("history — inadmissible kinds stay out while their module is not live", () => {
  assert.deepEqual(historyForSubject([A1, W1], "physics", LIVE_NONE), []);
  assert.deepEqual(historyForSubject([A1, W1], "physics", ["assignments"]).map((e) => e.id), ["e-w1"]);
  assert.deepEqual(historyForSubject([A1, W1], "physics", LIVE_LC).map((e) => e.id), ["e-a1"]);
});
t("history — oldest first; ties settle by id, deterministically", () => {
  const T1 = ev("e-t1", "physics", "session-attended", "2026-10-08T09:00:00Z");
  const h = historyForSubject([A2, T1, A1], "physics", LIVE_LC);
  assert.deepEqual(h.map((e) => e.id), ["e-t1", "e-a1", "e-a2"]);
  assert.deepEqual(historyForSubject([A2, T1, A1], "physics", LIVE_LC).map((e) => e.id), h.map((e) => e.id));
});
t("history — malformed rows are defects, excluded without throwing", () => {
  const h = historyForSubject([A1, BAD_TS], "physics", LIVE_LC);
  assert.deepEqual(h.map((e) => e.id), ["e-a1"]);
});

/* attendanceState — the attend-versus-resume sentence rule */
t("attendance — module not live: attend, empty sources (nothing can exist yet)", () => {
  assert.deepEqual(attendanceState([A1], "physics", LIVE_NONE), { verb: "attend", sources: [] });
});
t("attendance — live module, no record: attend", () => {
  assert.deepEqual(attendanceState([], "physics", LIVE_LC), { verb: "attend", sources: [] });
});
t("attendance — one attended fact: resume, and sources name it", () => {
  assert.deepEqual(attendanceState([A1], "physics", LIVE_LC), { verb: "resume", sources: ["e-a1"] });
});
t("attendance — many attended facts: resume, sources in history order", () => {
  assert.deepEqual(attendanceState([A2, A1], "physics", LIVE_LC).sources, ["e-a1", "e-a2"]);
});
t("attendance — other subjects do not change the verb", () => {
  assert.deepEqual(attendanceState([M1], "physics", LIVE_LC), { verb: "attend", sources: [] });
});
t("attendance — other kinds do not change the verb", () => {
  assert.deepEqual(attendanceState([W1], "physics", LIVE_LC), { verb: "attend", sources: [] });
});
t("attendance — malformed facts never produce resume", () => {
  assert.deepEqual(attendanceState([BAD_TS], "physics", LIVE_LC), { verb: "attend", sources: [] });
});

/* determinism */
t("determinism — same inputs, same outputs, twice", () => {
  const a = attendanceState([A2, A1, M1, W1, BAD_TS], "physics", LIVE_LC);
  const b = attendanceState([A2, A1, M1, W1, BAD_TS], "physics", LIVE_LC);
  assert.deepEqual(a, b);
  assert.deepEqual(historyForSubject([A2, A1], "physics", LIVE_LC), historyForSubject([A2, A1], "physics", LIVE_LC));
});

console.log(`\n${n - failed}/${n} passed${failed ? ` — ${failed} FAILED` : ""}`);
process.exit(failed ? 1 : 0);
