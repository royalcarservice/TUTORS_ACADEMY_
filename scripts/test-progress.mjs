#!/usr/bin/env node
// Progress-language tests (Phase 5 · Step 6). Pure — no server, no DB.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-progress.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const P = await import("@/lib/progress");
const F = await import("@/app/dev/progress-language/fixtures");
const ARC = await import("@/config/arc");
const { arcPosition, countByKind, latestEvent, validateEvents, admissibleKinds, STEP_EVIDENCE } = P;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const walk = (v, out = []) => { if (typeof v === "number") out.push(v); else if (typeof v === "string") out.push(v); else if (v && typeof v === "object") for (const k of Object.keys(v)) walk(v[k], out); return out; };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const src = (f) => strip(readFileSync(new URL(`../src/lib/progress/${f}`, import.meta.url), "utf8"));

/* 25 PURITY + DETERMINISM */
t("25 purity — module imports no clock, db, env, react", () => {
  for (const f of ["events.ts", "derive.ts", "index.ts"]) {
    assert.doesNotMatch(src(f), /Date\.now\(|new Date\(\)|process\.env|supabase|next\/headers|Math\.random|from "react"|fetch\(/, `${f} impure`);
  }
  const imports = src("derive.ts").match(/^import .*$/gm);
  assert.deepEqual(imports.map((l) => l.match(/from "(.+)"/)[1]).sort(), ["./events", "@/config/arc", "@/lib/next-action/when", "@/lib/student/contract"]);
  const a = arcPosition(F.FACTS_ENTERED, F.MANY, F.LIVE_PRETEND), b = arcPosition(F.FACTS_ENTERED, F.MANY, F.LIVE_PRETEND);
  assert.deepEqual(a, b);
  assert.deepEqual(countByKind(F.MANY, "mathematics", F.LIVE_PRETEND), countByKind(F.MANY, "mathematics", F.LIVE_PRETEND));
});

/* 4 NO RATIOS — the export surface is exactly this, and no output is a fraction, a percent or a forward-looking word */
t("4 exports — exactly the declared surface, no ratio/percent/score/composite/predict names", () => {
  const names = Object.keys(P).sort();
  assert.deepEqual(names, ["EVENT_KINDS", "EVENT_KIND_MODULE", "STEP_EVIDENCE", "admissibleKinds", "arcPosition", "countByKind", "latestEvent", "validateEvents"]);
  for (const k of names) assert.doesNotMatch(k, /ratio|percent|pct|rate|score|level|streak|total|overall|combined|composite|predict|forecast|estimate|pace|track|compare|rank|average/i);
  assert.doesNotMatch(src("derive.ts") + src("events.ts"), /\/\s*(total|denominator)|\*\s*100|percent|toFixed|streak|Math\.(round|floor|ceil)\(/, "arithmetic that could form a ratio");
});
t("4 no output is a fraction or a percent (all fixtures × all functions)", () => {
  const outs = [];
  for (const live of [F.LIVE_TODAY, F.LIVE_PRETEND]) for (const evs of [F.ZERO, F.ONE, F.MANY, [...F.MANY, ...F.OTHER_SUBJECT], F.MALFORMED])
    for (const facts of [F.FACTS_ENTERED, F.FACTS_DAY_ONE, F.FACTS_NEVER_ENTERED, F.FACTS_VISITOR]) {
      outs.push(arcPosition(facts, evs, live), countByKind(evs, facts.subjectId, live), latestEvent(evs, facts.subjectId, live, F.NOW), validateEvents(evs));
    }
  for (const v of walk(outs)) {
    if (typeof v === "number") { assert.ok(Number.isInteger(v) && v >= 1, `non-integer or zero number emitted: ${v}`); }
    else assert.doesNotMatch(v, /%|percent|complete|on track|behind|pace|will |streak|level|badge/i, `forbidden word in output: ${v}`);
  }
});
t("4 attempting a ratio: the module has no denominator to offer", () => {
  assert.equal(P.completion, undefined); assert.equal(P.percentComplete, undefined); assert.equal(P.ratio, undefined);
  const counts = countByKind(F.MANY, "mathematics", F.LIVE_PRETEND);
  // The only number anywhere is a count whose provenance is a list of rows; there is no "total" to divide by.
  for (const c of counts) { assert.equal(c.count, c.sources.length); assert.equal(Object.keys(c).sort().join(), "count,kind,sources"); }
  assert.equal(Object.keys(arcPosition(F.FACTS_ENTERED, F.MANY, F.LIVE_PRETEND)).sort().join(), "defects,recordEmpty,steps,subjectId");
});

/* 6 NEVER EMIT A ZERO */
t("6 never a zero — empty record yields no counts, no recency, recordEmpty=true", () => {
  assert.deepEqual(countByKind(F.ZERO, "mathematics", F.LIVE_PRETEND), []);
  assert.equal(latestEvent(F.ZERO, "mathematics", F.LIVE_PRETEND, F.NOW), null);
  assert.equal(arcPosition(F.FACTS_ENTERED, F.ZERO, F.LIVE_TODAY).recordEmpty, true);
  // a kind with no rows is ABSENT, not 0 — even when other kinds have rows
  const only = countByKind(F.ONE, "mathematics", F.LIVE_PRETEND);
  assert.deepEqual(only.map((c) => c.kind), ["session-attended"]);
});
t("6 counts are references — every count equals its sources", () => {
  const counts = countByKind(F.MANY, "mathematics", F.LIVE_PRETEND);
  assert.deepEqual(counts.map((c) => [c.kind, c.count]), [["session-attended", 8], ["recording-watched", 2], ["work-submitted", 1]]);
  for (const c of counts) assert.equal(c.count, c.sources.length);
});

/* 7 TRACEABILITY */
t("7 traceability — arc steps and recency name their rows", () => {
  const pos = arcPosition(F.FACTS_ENTERED, F.MANY, F.LIVE_PRETEND);
  const by = Object.fromEntries(pos.steps.map((s) => [s.id, s]));
  assert.deepEqual(by.discover.sources, ["account"]); assert.deepEqual(by.choose.sources, ["enrolment:mathematics"]); assert.deepEqual(by.enter.sources, ["entry:mathematics"]);
  assert.equal(by.learn.sources.length, 10); assert.equal(by.progress.sources.length, 11);
  assert.deepEqual(by.interact.sources, []); assert.deepEqual(by.master.sources, []);
  const r = latestEvent(F.MANY, "mathematics", F.LIVE_PRETEND, F.NOW);
  assert.deepEqual(r.sources, ["evt-0011"]); assert.equal(r.when, "2 days ago");
});

/* 8 NO COMPOSITE */
t("8 no composite — kinds are never summed", () => {
  const counts = countByKind(F.MANY, "mathematics", F.LIVE_PRETEND);
  assert.ok(!counts.some((c) => c.kind === "all" || c.kind === "total"));
  assert.doesNotMatch(src("derive.ts"), /reduce\(|\+=/, "no accumulation across kinds");
});

/* 9/10 PER ENVIRONMENT */
t("10 per environment — physics rows never enter mathematics' figures; no shared number", () => {
  const all = [...F.MANY, ...F.OTHER_SUBJECT];
  const m = countByKind(all, "mathematics", F.LIVE_PRETEND), p = countByKind(all, "physics", F.LIVE_PRETEND);
  assert.deepEqual(m, countByKind(F.MANY, "mathematics", F.LIVE_PRETEND));
  assert.deepEqual(p.map((c) => [c.kind, c.count]), [["session-attended", 2]]);
  for (const c of m) for (const id of c.sources) assert.ok(!id.startsWith("evt-p"));
  assert.equal(arcPosition(F.FACTS_PHYSICS, all, F.LIVE_PRETEND).subjectId, "physics");
});

/* 11 NO BACKFILL, NO DEFAULTS */
t("11 day-one and yesterday render identically with no records", () => {
  const a = arcPosition(F.FACTS_DAY_ONE, F.ZERO, F.LIVE_TODAY), b = arcPosition(F.FACTS_YESTERDAY, F.ZERO, F.LIVE_TODAY);
  assert.deepEqual(a, b);
  assert.deepEqual(a.steps.map((s) => s.state), ["done", "done", "done", "ahead", "ahead", "ahead", "ahead"]);
});

/* 12 MALFORMED VS MISSING */
t("12 malformed timestamp is a DEFECT; missing entry is a STATE", () => {
  const v = validateEvents(F.MALFORMED);
  assert.equal(v.valid.length, 0); assert.equal(v.defects.length, 1); assert.equal(v.defects[0].field, "at");
  const pos = arcPosition(F.FACTS_ENTERED, F.MALFORMED, F.LIVE_PRETEND);
  assert.equal(pos.defects.length, 1); assert.equal(pos.recordEmpty, true);
  const bad = arcPosition({ ...F.FACTS_ENTERED, firstEnteredAt: "yesterday-ish" }, F.ZERO, F.LIVE_TODAY);
  assert.equal(bad.defects.length, 1); assert.match(bad.defects[0].reason, /malformed first_entered_at/);
  const missing = arcPosition(F.FACTS_NEVER_ENTERED, F.ZERO, F.LIVE_TODAY);
  assert.equal(missing.defects.length, 0); assert.equal(missing.steps.find((s) => s.id === "enter").state, "ahead");
});

/* 13 NO CELEBRATION — the first event shapes the output exactly like the ninth */
t("13 uniform — one event and eleven events produce the same shape with different sources only", () => {
  const one = arcPosition(F.FACTS_ENTERED, F.ONE, F.LIVE_PRETEND), many = arcPosition(F.FACTS_ENTERED, F.MANY, F.LIVE_PRETEND);
  assert.deepEqual(one.steps.map((s) => s.state), many.steps.map((s) => s.state));
  assert.deepEqual(Object.keys(one), Object.keys(many));
  assert.doesNotMatch(src("derive.ts"), /\bfirst (session|event|time)|milestone|achiev|celebrat|congrat|confetti|badge|=== 1\b|=== 10\b/i);
});

/* 15/16 NO PREDICTION, NO GUILT in the module's vocabulary */
t("15/16 module source has no pace, prediction or guilt vocabulary", () => {
  assert.doesNotMatch(src("derive.ts") + src("events.ts"), /on track|behind|pace|forecast|estimate|will finish|haven't|missed|at risk|days since|keep it up/i);
});

/* 19 ARC INTEGRITY */
t("19 arc — the environment's steps are 4.7's steps, same ids, labels, order", () => {
  const pos = arcPosition(F.FACTS_ENTERED, F.ZERO, F.LIVE_TODAY);
  assert.deepEqual(pos.steps.map((s) => [s.id, s.label]), ARC.ARC_STEPS.map((s) => [s.id, s.label]));
  assert.deepEqual(ARC.ARC_STEPS.map((s) => s.id), ["discover", "choose", "enter", "learn", "interact", "progress", "master"]);
});

/* 21 REGISTRY + EVENT GATING */
t("21 gating — today no kind is admissible; a live module with no events gains no texture; events without a live module gain none either", () => {
  assert.deepEqual(admissibleKinds(F.LIVE_TODAY), []);
  assert.deepEqual(admissibleKinds(F.LIVE_PRETEND), ["session-attended", "recording-watched", "work-submitted"]);
  const liveNoEvents = arcPosition(F.FACTS_ENTERED, F.ZERO, F.LIVE_PRETEND);
  assert.deepEqual(liveNoEvents.steps.map((s) => s.state), ["done", "done", "done", "ahead", "ahead", "ahead", "ahead"]);
  const eventsNotLive = arcPosition(F.FACTS_ENTERED, F.MANY, F.LIVE_TODAY);
  assert.deepEqual(eventsNotLive.steps.map((s) => s.state), ["done", "done", "done", "ahead", "ahead", "ahead", "ahead"]);
  assert.equal(eventsNotLive.recordEmpty, true, "inadmissible events do not count as a record");
  assert.deepEqual(countByKind(F.MANY, "mathematics", F.LIVE_TODAY), []);
  assert.deepEqual(Object.keys(STEP_EVIDENCE), ["learn", "progress"]);
});

/* 22 REGION CONTRACT — not enrolled → nothing */
t("22 resolver returns null for a non-enrolled identity (module level: facts.enrolled=false)", () => {
  const pos = arcPosition(F.FACTS_VISITOR, F.ZERO, F.LIVE_TODAY);
  assert.deepEqual(pos.steps.map((s) => s.state), ["ahead", "ahead", "ahead", "ahead", "ahead", "ahead", "ahead"]);
});

console.log(`\n${n - failed}/${n} passed`);
process.exit(failed ? 1 : 0);
