#!/usr/bin/env node
// Cohort & live-surface tests (Phase 7 · Step 2, DEC-023). Pure — no server, no DB, no network.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-cohort-live.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const LK = await import("@/lib/livekit/config");
const CS = await import("@/lib/cohort/session");
const NA = await import("@/lib/next-action");
const MOD = await import("@/config/modules");
const { liveKitReadiness, LIVEKIT_ENV_KEYS } = LK;
const { sessionForSubject, validScheduledAt } = CS;
const { classCandidatesFor, classProvider, sessionActionSentence, scheduledPhrase, judge, nextActionFor, PROVIDERS } = NA;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const file = (p) => strip(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

/* ── fixtures ─────────────────────────────────────────────────────────────── */
const NOW = "2026-10-08T09:00:00Z";
const subj = { id: "mathematics", name: "Mathematics", environmentName: "The Lattice" };
const baseInput = (extra = {}) => ({
  enrolments: [{ subjectId: "mathematics", status: "active", enrolledAt: "2026-09-01T00:00:00Z" }],
  environmentStates: [],
  subjects: [subj],
  now: NOW,
  hrefs: { subject: (id) => `/subjects/${id}`, choose: "/subjects", live: (id) => `/subjects/${id}/live` },
  ...extra,
});
const sess = (id, state, at = "2026-10-08T10:00:00Z", subjectId = "mathematics", name = "Morning cohort") =>
  ({ id, subjectId, name, scheduledAt: at, state });

/* ── 1 · purity & shape ───────────────────────────────────────────────────── */
t("purity — livekit config, cohort session, when.ts: no clock reads, no env, no db", () => {
  for (const [p, re] of [
    ["src/lib/livekit/config.ts", /Date\.now\(|process\.env|supabase|fetch\(|Math\.random/],
    ["src/lib/cohort/session.ts", /Date\.now\(|new Date\(\)|process\.env|supabase|fetch\(|Math\.random/],
  ]) assert.doesNotMatch(file(p), re, `${p} impure`);
});
t("purity — cohort/data.ts is SELECT-only and spells the subject boundary", () => {
  const src = file("src/lib/cohort/data.ts");
  assert.doesNotMatch(src, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/, "the first reader must never write");
  assert.match(src, /\.eq\("subject_id", subjectId\)/, "single-subject read must spell the subject");
  assert.match(src, /\.in\("subject_id"/, "engine read must spell the subject list");
  assert.match(src, /DataReadError/, "a failed read must stay a failed read (5.7)");
});
t("purity — progress/data.ts is SELECT-only, spells mine, throws on failure", () => {
  const src = file("src/lib/progress/data.ts");
  assert.doesNotMatch(src, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/);
  assert.match(src, /\.eq\("student_id", user\.id\)/);
  assert.match(src, /DataReadError/);
});
t("live-stage is a SERVER component — no client directive, no timers, no surveillance", () => {
  const src = strip(rawFile("src/components/live/live-stage.tsx"));   // comments may name the future island; code may not carry it
  assert.doesNotMatch(src, /"use client"|'use client'/);
  assert.doesNotMatch(src, /setTimeout|setInterval|requestAnimationFrame|navigator\.mediaDevices|getUserMedia/);
  assert.match(src, /data-subject=/, "subject token scoping");
  assert.match(src, /data-live-grid/, "the reserved tile grid");
});
t("live-stage carries the brief's standby sentence verbatim (student form)", () => {
  // Declared pin update (DEC-026): the Milestone-2 brief supersedes the
  // DEC-024 standby wording; the sentence is pinned to the newer original.
  const src = rawFile("src/components/live/live-stage.tsx");
  assert.match(src, /The chamber is staged\. Live connection will initiate once your tutor opens the session\./);
});
t("live route — server component, honest guards, no vendor modal words", () => {
  const src = rawFile("src/app/subjects/[subject]/live/page.tsx");
  assert.doesNotMatch(src, /"use client"|'use client'/);
  assert.match(src, /notFound\(\)/, "no access → the themed 404");
  assert.match(src, /liveKitReadiness/);
  assert.match(src, /attendanceState/);
  assert.doesNotMatch(strip(src), /zoom|teams|meet\b/i, "no vendor nouns in the surface");
});

/* ── 2 · banned vocabulary everywhere the step writes copy ────────────────── */
t("banned corporate vocabulary — no Call/Meeting/Conference/Webinar/Join in new copy", () => {
  const sentences = [
    sessionActionSentence("attend", "Mathematics").title, sessionActionSentence("attend", "Mathematics").cta,
    sessionActionSentence("resume", "Mathematics").title, sessionActionSentence("resume", "Mathematics").cta,
    "The chamber is staged. Live connection will initiate once your tutor opens the session.",
    `Resume work in Mathematics`,
  ];
  for (const s of sentences) assert.doesNotMatch(s, /\bcall\b|\bmeeting\b|\bconference\b|\bwebinar\b|\bjoin\b/i, s);
});

/* ── 3 · the attend-versus-resume sentence ────────────────────────────────── */
t("sentence — attend and resume worded as ruled, never shared", () => {
  assert.deepEqual(sessionActionSentence("attend", "Physics"), { title: "Attend the Physics session", cta: "Attend the session" });
  assert.deepEqual(sessionActionSentence("resume", "Physics"), { title: "Resume the Physics session", cta: "Resume the session" });
});

/* ── 4 · scheduledPhrase ──────────────────────────────────────────────────── */
t("scheduledPhrase — today, absolute date, null for the malformed", () => {
  assert.equal(scheduledPhrase("2026-10-08T18:00:00Z", NOW), "today");
  assert.equal(scheduledPhrase("2026-10-12T10:00:00Z", NOW), "on 12 Oct 2026");
  assert.equal(scheduledPhrase("not-a-date", NOW), null);
  assert.equal(scheduledPhrase("2026-10-12T10:00:00Z", "bad"), null);
});

/* ── 5 · livekit readiness ────────────────────────────────────────────────── */
t("readiness — configured only when all three NAMES hold values", () => {
  const full = { LIVEKIT_URL: "https://x.invalid", LIVEKIT_API_KEY: "k", LIVEKIT_API_SECRET: "s" };
  assert.equal(liveKitReadiness(full).configured, true);
  assert.deepEqual(liveKitReadiness(full).missing, []);
});
t("readiness — any missing or empty key is standby, named by NAME only", () => {
  const r = liveKitReadiness({ LIVEKIT_URL: "https://x.invalid" });
  assert.equal(r.configured, false);
  assert.deepEqual([...r.missing].sort(), ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]);
  const empty = liveKitReadiness({ LIVEKIT_URL: "", LIVEKIT_API_KEY: "   ", LIVEKIT_API_SECRET: "s" });
  assert.equal(empty.configured, false);
  assert.deepEqual([...empty.missing].sort(), ["LIVEKIT_API_KEY", "LIVEKIT_URL"]);
  // VALUES never leak into the answer — only the NAMES of missing keys may appear
  const leaky = liveKitReadiness({ LIVEKIT_URL: "https://lk-9f3e.invalid", LIVEKIT_API_KEY: "APIkeyVALUE-77", LIVEKIT_API_SECRET: "sk-VALUE-31" });
  const rendered = JSON.stringify(leaky);
  for (const v of ["lk-9f3e", "APIkeyVALUE-77", "sk-VALUE-31"]) assert.ok(!rendered.includes(v), `value leaked: ${v}`);
});
t("readiness — the env NAMES are the three ruled by the recon doc", () => {
  assert.deepEqual(Object.values(LIVEKIT_ENV_KEYS).sort(), ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LIVEKIT_URL"]);
});

/* ── 6 · session interpretation ───────────────────────────────────────────── */
t("sessionForSubject — active beats scheduled; earliest scheduled otherwise", () => {
  const rows = [sess("c2", "scheduled", "2026-10-09T10:00:00Z"), sess("c1", "active", "2026-10-08T10:00:00Z"), sess("c3", "scheduled", "2026-10-10T10:00:00Z")];
  assert.equal(sessionForSubject(rows, "mathematics")?.id, "c1");
  assert.equal(sessionForSubject(rows.filter((r) => r.state !== "active"), "mathematics")?.id, "c2");
});
t("sessionForSubject — concluded, malformed and other subjects never surface", () => {
  const rows = [sess("c1", "concluded"), sess("c2", "scheduled", "garbage"), sess("c3", "scheduled", "2026-10-09T10:00:00Z", "physics")];
  assert.equal(sessionForSubject(rows, "mathematics"), null);
  assert.equal(sessionForSubject([sess("c3", "scheduled", "2026-10-09T10:00:00Z", "physics")], "physics")?.id, "c3");
});
t("validScheduledAt — malformed is false, never thrown", () => {
  assert.equal(validScheduledAt("2026-10-08T10:00:00Z"), true);
  assert.equal(validScheduledAt("nope"), false);
});

/* ── 7 · the class provider ───────────────────────────────────────────────── */
t("gate — classProvider is SILENT while live-classroom is not live (the contract)", () => {
  const input = baseInput({ cohortSessions: [sess("c1", "active")], progressEvents: [] });
  assert.deepEqual(classProvider.provide(input), []);
});
t("registry — live-classroom is in-progress, and still not live (the gate holds)", () => {
  const m = MOD.PLATFORM_MODULES.find((x) => x.id === "live-classroom");
  assert.equal(m.status, "in-progress");
  assert.notEqual(m.status, "live");
});
t("candidates — active session: Tier 2, attend sentence, live href, real `at`", () => {
  const out = classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "active")] }));
  assert.equal(out.length, 1);
  const c = out[0];
  assert.equal(c.tier, 2);
  assert.equal(c.kind, "attend");
  assert.equal(c.source, "class");
  assert.equal(c.capability, "live-classroom");
  assert.equal(c.title, "Attend the Mathematics session");
  assert.equal(c.cta, "Attend the session");
  assert.equal(c.eyebrow, "Session open");
  assert.equal(c.href, "/subjects/mathematics/live");
  assert.equal(c.at, "2026-10-08T10:00:00Z");
});
t("candidates — scheduled session: eyebrow, scheduled phrase, one per subject", () => {
  const out = classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "scheduled", "2026-10-12T10:00:00Z"), sess("c2", "scheduled", "2026-10-13T10:00:00Z")] }));
  assert.equal(out.length, 1, "one candidate per subject — never a flood");
  assert.equal(out[0].eyebrow, "Next session");
  assert.equal(out[0].detail, "Morning cohort, scheduled on 12 Oct 2026");
  assert.equal(out[0].at, "2026-10-12T10:00:00Z");
});
t("candidates — silence: no sessions, no enrolment, concluded only, no live href", () => {
  assert.deepEqual(classCandidatesFor(baseInput({ cohortSessions: [] })), []);
  assert.deepEqual(classCandidatesFor(baseInput({ enrolments: [], cohortSessions: [sess("c1", "active")] })), []);
  assert.deepEqual(classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "concluded")] })), []);
  const noHref = baseInput({ cohortSessions: [sess("c1", "active")] }); delete noHref.hrefs.live;
  assert.deepEqual(classCandidatesFor(noHref), []);
});
t("verb — a silent record says attend (DEC-022; the table has no writer yet)", () => {
  const out = classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "active")], progressEvents: [] }));
  assert.equal(out[0].title, "Attend the Mathematics session");
});
t("verb — a prior attended fact says resume ONLY while the module is live in liveModules", () => {
  const ev = { id: "e1", subjectId: "mathematics", kind: "session-attended", at: "2026-10-01T10:00:00Z", refId: "r1" };
  const gated = classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "active")], progressEvents: [ev], liveModules: [] }));
  assert.equal(gated[0].title, "Attend the Mathematics session", "module liveness still governs the verb");
  const live = classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "active")], progressEvents: [ev], liveModules: ["live-classroom"] }));
  assert.equal(live[0].title, "Resume the Mathematics session");
  assert.equal(live[0].cta, "Resume the session");
});

/* ── 8 · the resolver accepts what the provider emits ─────────────────────── */
t("judge — accepts the class candidate when the capability is live and the href resolves", () => {
  const c = classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "active")] }))[0];
  const state = { subjectOrder: ["mathematics"], liveCapabilities: ["live-classroom"], resolvesToday: (h) => h === "/subjects/mathematics/live" };
  const v = judge(c, state, NOW);
  assert.equal(v.accepted, true, JSON.stringify(v));
  assert.match(v.sortKey, /^2:/, "Tier 2 — the cohort has no end, so never Tier 1");
});
t("judge — rejects the same candidate while the capability is not live", () => {
  const c = classCandidatesFor(baseInput({ cohortSessions: [sess("c1", "active")] }))[0];
  const state = { subjectOrder: ["mathematics"], liveCapabilities: ["public-website"], resolvesToday: () => true };
  const v = judge(c, state, NOW);
  assert.equal(v.accepted, false);
  assert.match(v.reason, /not live/);
});

/* ── 9 · the shipped answer is unchanged ──────────────────────────────────── */
t("engine — the pinned surfaces still win: resume for the entered, choose for the empty", () => {
  const entered = baseInput({ environmentStates: [{ subjectId: "mathematics", firstEnteredAt: "2026-10-01T00:00:00Z", lastEnteredAt: "2026-10-07T00:00:00Z", entryCount: 3, position: null }] });
  const r1 = nextActionFor(entered);
  assert.equal(r1.action.id, "enrolment:mathematics:resume");
  assert.equal(r1.fellBack, false);
  const empty = { ...baseInput(), enrolments: [], environmentStates: [] };
  assert.equal(nextActionFor(empty).action.id, "origin:choose");
});
t("engine — PROVIDERS registry carries the class provider, still silent in production", () => {
  assert.ok(PROVIDERS.some((p) => p.id === "class"));
  const entered = baseInput({ environmentStates: [{ subjectId: "mathematics", firstEnteredAt: "2026-10-01T00:00:00Z", lastEnteredAt: "2026-10-07T00:00:00Z", entryCount: 3, position: null }] });
  const r = nextActionFor(entered);
  assert.equal(r.action.source, "enrolment", "no class candidate while the module is not live");
});

/* ── 10 · migration 0006 static shape ─────────────────────────────────────── */
t("migration 0006 — three SELECT policies, the standing boundaries, no writes", () => {
  const sql = rawFile("supabase/migrations/20261008000006_cohort_readers.sql").toLowerCase();
  assert.match(sql, /create policy cohorts_select_enrolled_student/);
  assert.match(sql, /create policy cohorts_select_assigned_tutor/);
  assert.match(sql, /create policy cohort_tutors_select_own/);
  assert.doesNotMatch(sql, /for insert|for update|for delete/, "no authenticated write policy — service role manages");
  // the boundaries: active enrolment for students, the junction for tutors
  assert.match(sql, /from public\.enrolments[\s\S]*?status = 'active'/);
  assert.match(sql, /from public\.cohort_tutors[\s\S]*?tutor_id = auth\.uid\(\)/);
  assert.match(sql, /grant select on public\.cohorts to authenticated/);
  assert.match(sql, /grant select on public\.cohort_tutors to authenticated/);
  assert.doesNotMatch(sql, /grant[\s\S]*?to anon/);
});

console.log(`\n${n - failed}/${n} passed`);
process.exit(failed ? 1 : 0);
