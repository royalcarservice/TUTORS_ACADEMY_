#!/usr/bin/env node
// Next-action engine tests (Phase 5 · Step 4). Pure — no server, no DB.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-next-action.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const E = await import("@/lib/next-action");
const F = await import("@/app/dev/next-action/fixtures");
const { nextActionFor, explainResolution, resolverStateFor, judge, PROVIDERS, collectCandidates, TREATMENT } = E;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const win = (input, providers) => nextActionFor(input, providers);

/* 1 PURITY */
t("1 purity — resolver/providers import no clock, db or env", () => {
  for (const f of ["resolver.ts", "providers.ts", "when.ts", "index.ts"]) {
    const src = readFileSync(new URL(`../src/lib/next-action/${f}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    assert.doesNotMatch(src, /Date\.now\(|new Date\(\)|process\.env|supabase|next\/headers|Math\.random/, `${f} impure`);
  }
  const a = win(F.MATRIX[3].input), b = win(F.MATRIX[3].input);
  assert.deepEqual(a, b);
});
/* 3 EXACTLY ONE */
t("3 exactly one — no plural API", () => {
  assert.equal(typeof E.resolveNextActions, "undefined");
  const r = E.resolveNextAction(resolverStateFor(F.MATRIX[3].input), collectCandidates(PROVIDERS, F.MATRIX[3].input).candidates, F.NOW);
  assert.ok(r && !Array.isArray(r) && typeof r.id === "string");
});
/* 4–7 STATE MATRIX */
for (const row of F.MATRIX) t(`matrix ${row.id} → ${row.expect}`, () => {
  const r = win(row.input);
  assert.equal(r.action.id, row.expect, JSON.stringify(r.resolution?.considered.map((c) => [c.candidate.id, c.verdict]), null, 0));
  assert.equal(r.fellBack, false);
});
t("4 state A never null / never blank", () => { const r = win(F.MATRIX[0].input); assert.equal(r.action.kind, "choose"); assert.ok(r.action.title && r.action.cta && r.action.href === "/subjects"); });
t("5 state B — begin, no digits, no guilt", () => {
  const r = win(F.MATRIX[1].input).action; assert.equal(r.kind, "begin");
  const all = [r.eyebrow, r.title, r.detail, r.cta].join(" ");
  assert.doesNotMatch(all, /\d|lose|don't|miss|hurry|behind|streak/i, all);
});
t("6 state C — resume with recency; null lastEnteredAt → no time sentence", () => {
  const c = win(F.MATRIX[2].input).action; assert.equal(c.kind, "resume"); assert.equal(c.detail, "You were last here yesterday."); assert.equal(c.eyebrow, "Last opened yesterday");
  const z = win(F.MATRIX[7].input).action; assert.equal(z.kind, "resume"); assert.equal(z.detail, undefined); assert.equal(z.eyebrow, "Last opened");
});
t("7 entered beats never-entered (four mixed) — sort keys ordered", () => {
  const r = win(F.MATRIX[3].input); const acc = r.resolution.considered.filter((c) => c.verdict.accepted).sort((a, b) => a.verdict.sortKey.localeCompare(b.verdict.sortKey));
  console.log(acc.map((c) => `        ${c.candidate.id.padEnd(30)} ${c.verdict.sortKey}`).join("\n"));
  assert.deepEqual(acc.map((c) => c.candidate.id), ["enrolment:mathematics:resume", "enrolment:physics:resume", "enrolment:chemistry:begin", "enrolment:biology:begin", "origin:choose"]);
});
/* 8 TIER ORDERING */
t("8a tier order — live T1 beats T2 beats T3 (capabilities pretended live)", () => {
  const st = F.pretendLive(resolverStateFor(F.FUTURE_INPUT));
  const byId = Object.fromEntries(F.FUTURE.map((f) => [f.id, f.candidate]));
  const r = explainResolution({ ...resolverStateFor(F.FUTURE_INPUT), ...st }, [byId.t3, byId.t2, byId["t1-live"]], F.NOW);
  console.log(r.considered.map((c) => `        ${c.candidate.id.padEnd(30)} ${JSON.stringify(c.verdict)}`).join("\n"));
  assert.equal(r.winner.id, "class:physics:join");
  const r2 = explainResolution({ ...resolverStateFor(F.FUTURE_INPUT), ...st }, [byId.t3, byId.t2], F.NOW); assert.equal(r2.winner.id, "recording:physics:attend");
});
t("8b tier 1 without expiry is REJECTED, not demoted", () => {
  const st = { ...resolverStateFor(F.FUTURE_INPUT), ...F.pretendLive({}) };
  const c = F.FUTURE.find((f) => f.id === "t1-no-expiry").candidate;
  const v = judge(c, st, F.NOW); console.log(`        ${JSON.stringify(v)}`);
  assert.equal(v.accepted, false); assert.match(v.reason, /rejected, not demoted/);
  const r = explainResolution(st, [c, F.FUTURE.find((f) => f.id === "t3").candidate], F.NOW); assert.equal(r.winner.id, "enrolment:physics:resume");
});
/* 9 no shipped provider emits tier 1/2 */
t("9 shipped providers emit only tier 3 and 4", () => {
  const src = readFileSync(new URL("../src/lib/next-action/providers.ts", import.meta.url), "utf8");
  const tiers = [...src.matchAll(/tier:\s*(\d)/g)].map((m) => m[1]); console.log(`        tier declarations in providers.ts: ${tiers.join(", ")}`);
  assert.ok(tiers.every((x) => x === "3" || x === "4"));
  for (const row of F.MATRIX) for (const c of collectCandidates(PROVIDERS, row.input).candidates) assert.ok(c.tier >= 3);
});
/* 10 expiry */
t("10 expired filtered; future kept", () => {
  const st = { ...resolverStateFor(F.FUTURE_INPUT), ...F.pretendLive({}) };
  assert.equal(judge(F.FUTURE.find((f) => f.id === "t1-expired").candidate, st, F.NOW).accepted, false);
  assert.equal(judge(F.FUTURE.find((f) => f.id === "t1-live").candidate, st, F.NOW).accepted, true);
});
/* 11 capability gate */
t("11 capability gate — planned module rejected with reason", () => {
  const v = judge(F.FUTURE.find((f) => f.id === "not-built").candidate, resolverStateFor(F.FUTURE_INPUT), F.NOW);
  console.log(`        ${JSON.stringify(v)}`); assert.equal(v.accepted, false); assert.match(v.reason, /not live in src\/config\/modules/);
  const v2 = judge(F.FUTURE.find((f) => f.id === "t1-live").candidate, resolverStateFor(F.FUTURE_INPUT), F.NOW); assert.equal(v2.accepted, false);
});
/* future fixture verdicts match expectation */
for (const f of F.FUTURE) t(`fixture ${f.id} accepted=${f.expectAccepted}`, () => { const v = judge(f.candidate, resolverStateFor(F.FUTURE_INPUT), F.NOW); assert.equal(v.accepted, f.expectAccepted, JSON.stringify(v)); });
/* 13 null safety */
t("13 null-safety — every optional field null, nothing throws, no placeholder", () => {
  const inp = F.input([{ subjectId: "physics", status: "active", enrolledAt: null }], [{ subjectId: "physics", firstEnteredAt: null, lastEnteredAt: null, entryCount: null, position: null }]);
  const r = win(inp); const s = [r.action.eyebrow, r.action.title, r.action.detail ?? "", r.action.cta].join(" | "); console.log(`        ${s}`);
  assert.doesNotMatch(s, /null|undefined|unknown|N\/A|—\s*$|recently|some time/i);
  const r2 = win(F.input([{ subjectId: "physics", status: "active", enrolledAt: null }], [])); const s2 = [r2.action.eyebrow, r2.action.title, r2.action.detail ?? "", r2.action.cta].join(" | "); console.log(`        ${s2}`);
  assert.doesNotMatch(s2, /null|undefined/i);
});
/* 14 deliberate breakage */
t("14a provider throws → isolated, benign answer", () => { const r = win(F.MATRIX[2].input, [F.throwingProvider, ...PROVIDERS]); console.log(`        failed=${r.failedProviders} → ${r.action.id}`); assert.deepEqual(r.failedProviders, ["broken-throws"]); assert.equal(r.action.id, "enrolment:physics:resume"); });
t("14b 404 href → rejected, benign answer", () => { const r = win(F.MATRIX[2].input, [F.danglingProvider, ...PROVIDERS]); const v = r.resolution.considered.find((c) => c.candidate.id === "broken:404").verdict; console.log(`        ${JSON.stringify(v)} → ${r.action.id}`); assert.equal(v.accepted, false); assert.equal(r.action.id, "enrolment:physics:resume"); });
t("14c malformed date → rejected, benign answer", () => { const r = win(F.MATRIX[2].input, [F.malformedDateProvider, ...PROVIDERS]); const v = r.resolution.considered.find((c) => c.candidate.id === "broken:date").verdict; console.log(`        ${JSON.stringify(v)} → ${r.action.id}`); assert.equal(v.accepted, false); assert.equal(r.action.id, "enrolment:physics:resume"); });
t("14d ONLY broken providers → benign fallback, never null", () => { const r = win(F.MATRIX[2].input, [F.throwingProvider]); console.log(`        fellBack=${r.fellBack} → ${r.action.id} ${r.action.cta}`); assert.ok(r.fellBack && r.action.id === "fallback:physics:resume"); const r2 = win(F.MATRIX[0].input, [F.throwingProvider]); assert.equal(r2.action.id, "fallback:choose"); });
/* treatments */
t("kind → treatment finite and existing", () => { for (const k of Object.keys(TREATMENT)) assert.equal(TREATMENT[k], "primary-button"); });
/* 18 report-only sweep over every shipped string */
t("18 report-only sweep — shipped strings", () => {
  const strings = new Set();
  for (const row of F.MATRIX) for (const c of collectCandidates(PROVIDERS, row.input).candidates) for (const s of [c.eyebrow, c.title, c.detail, c.cta]) if (s) strings.add(s);
  const hits = [...strings].filter((s) => /\d|%|count|streak|minute|times|visit/i.test(s));
  console.log([...strings].map((s) => `        · ${s}`).join("\n")); console.log(`        hits: ${JSON.stringify(hits)}`);
  // the only digits permitted: "N days ago" (a recency phrase from a real timestamp; never a count of anything the student did)
  const RECENCY = /^(You were last here|Last opened|You chose \w+) (\d+ days ago|on \d{1,2} \w{3} \d{4})/;
  assert.ok(hits.every((h) => RECENCY.test(h)), JSON.stringify(hits.filter((h) => !RECENCY.test(h))));
});

console.log(`\n${n - failed}/${n} passed`);
process.exit(failed ? 1 : 0);
