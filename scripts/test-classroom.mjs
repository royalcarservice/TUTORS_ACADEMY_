#!/usr/bin/env node
// Classroom state machine & data layer tests (Phase 7 · Milestone 1, DEC-026).
// Pure — no server, no DB, no network.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-classroom.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const SM = await import("@/lib/classroom/state-machine");
const { chamberState, sessionOfRecord, CHAMBER_STATE_WORD, SETTLING_WINDOW_MINUTES } = SM;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const file = (p) => strip(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

/* ── fixtures ─────────────────────────────────────────────────────────────── */
const NOW = "2026-10-08T09:00:00Z";
const at = (minsFromNow) => new Date(Date.parse(NOW) + minsFromNow * 60000).toISOString();

/* ── 1 · purity ───────────────────────────────────────────────────────────── */
t("purity — state-machine.ts: no clock reads, no env, no db, no randomness", () => {
  assert.doesNotMatch(
    file("src/lib/classroom/state-machine.ts"),
    /Date\.now\(|new Date\(\)|process\.env|supabase|fetch\(|Math\.random/,
    "the machine derives states from facts it is given — it never reads the wall clock itself"
  );
});

/* ── 2 · the four states ──────────────────────────────────────────────────── */
t("states — no session is STANDBY; scheduled is STANDBY; active is ACTIVE", () => {
  assert.equal(chamberState(null, NOW), "STANDBY");
  assert.equal(chamberState({ state: "scheduled" }, NOW), "STANDBY");
  assert.equal(chamberState({ state: "active", updatedAt: NOW }, NOW), "ACTIVE");
});
t("states — concluded inside the settling window is SETTLING", () => {
  assert.equal(chamberState({ state: "concluded", updatedAt: at(-5) }, NOW), "SETTLING");
  assert.equal(chamberState({ state: "concluded", updatedAt: at(-(SETTLING_WINDOW_MINUTES)) }, NOW), "SETTLING");
});
t("states — concluded beyond the window is CONCLUDED; no instant on the row means CONCLUDED", () => {
  assert.equal(chamberState({ state: "concluded", updatedAt: at(-(SETTLING_WINDOW_MINUTES + 1)) }, NOW), "CONCLUDED");
  assert.equal(chamberState({ state: "concluded", updatedAt: null }, NOW), "CONCLUDED");
});
t("states — an unreadable 'now' degrades to STANDBY, never a guess", () => {
  assert.equal(chamberState({ state: "active" }, "not-an-instant"), "STANDBY");
});
t("states — a row-state the contract does not name is treated as no session", () => {
  assert.equal(chamberState({ state: "paused" }, NOW), "STANDBY");
});
t("states — the settling window is fifteen minutes and the words are exactly four", () => {
  assert.equal(SETTLING_WINDOW_MINUTES, 15);
  assert.deepEqual(Object.keys(CHAMBER_STATE_WORD).sort(), ["ACTIVE", "CONCLUDED", "SETTLING", "STANDBY"]);
  assert.equal(CHAMBER_STATE_WORD.ACTIVE, "In session");
  assert.equal(CHAMBER_STATE_WORD.STANDBY, "Standby");
});

/* ── 3 · sessionOfRecord precedence ───────────────────────────────────────── */
const row = (id, state, scheduledAt, updatedAt) => ({ id, state, scheduledAt, updatedAt });
t("precedence — an ACTIVE session stands for the chamber (most recent wins)", () => {
  const s = sessionOfRecord([
    row("a", "scheduled", at(60), at(-120)),
    row("b", "active", at(-30), at(-10)),
    row("c", "active", at(-40), at(-20)),
  ], NOW);
  assert.equal(s?.id, "b");
});
t("precedence — without an active, the earliest scheduled stands", () => {
  const s = sessionOfRecord([
    row("a", "scheduled", at(120), at(-5)),
    row("b", "scheduled", at(30), at(-5)),
  ], NOW);
  assert.equal(s?.id, "b");
});
t("precedence — with only concluded rows, the most recent stands (the settling window can still hold)", () => {
  const s = sessionOfRecord([
    row("a", "concluded", at(-90), at(-30)),
    row("b", "concluded", at(-120), at(-5)),
  ], NOW);
  assert.equal(s?.id, "b");
});
t("precedence — no rows, or an unreadable 'now', is null", () => {
  assert.equal(sessionOfRecord([], NOW), null);
  assert.equal(sessionOfRecord([row("a", "active", at(-5), at(-1))], "garbage"), null);
});

/* ── 4 · the data layer (static — it is server-only and never imported here) ─ */
t("data layer — SELECT-only, subject spelled, failures stay failures", () => {
  const src = file("src/lib/classroom/data.ts");
  assert.doesNotMatch(src, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/, "the reader must never write");
  assert.match(src, /\.eq\("subject_id", subjectId\)/, "the session read must spell the subject");
  assert.match(src, /DataReadError/, "a failed read must stay a failed read (5.7)");
  assert.match(src, /\.eq\("status", "active"\)/, "participants come from ACTIVE enrolments only");
});

/* ── 5 · migration 0007 (the schema the reader stands on) ─────────────────── */
const MIG = "supabase/migrations/20261008000007_classroom_sessions.sql";
t("migration — RLS enabled AND forced; readers for student and tutor; writer is the tutor, as themselves", () => {
  const sql = rawFile(MIG);
  assert.match(sql, /alter table public\.cohort_sessions enable row level security/);
  assert.match(sql, /alter table public\.cohort_sessions force row level security/);
  assert.match(sql, /create policy sessions_select_enrolled_student/);
  assert.match(sql, /create policy sessions_select_related_tutor/);
  assert.match(sql, /create policy sessions_insert_related_tutor/);
  assert.match(sql, /tutor_id = auth\.uid\(\)/, "a tutor opens sessions only as themselves");
});
t("migration — no student write, no update/delete policies, lifecycle stays service-role", () => {
  const sql = rawFile(MIG).split("\n").map((l) => l.replace(/--.*$/, "")).join("\n"); // comments out, then judge
  const blocks = sql.split(/create policy /).slice(1);          // one entry per policy statement
  const insert = blocks.filter((b) => /\bfor insert\b/.test(b));
  assert.ok(insert.length === 1, "exactly one insert policy");
  assert.doesNotMatch(insert[0], /student_id\s*=\s*auth\.uid\(\)/, "no student write path");
  assert.doesNotMatch(sql, /create policy [\s\S]*?for (update|delete)/i, "lifecycle stays service-role");
  assert.match(sql, /grant select, insert on public\.cohort_sessions to authenticated/);
  assert.match(sql, /grant all on public\.cohort_sessions to service_role/);
});
t("migration — the updated_at touch trigger is present (the settling window depends on it)", () => {
  assert.match(rawFile(MIG), /create trigger cohort_sessions_touch[\s\S]*?touch_updated_at/);
});
t("migration — names no subject STATUS (E-13) and creates no duplicate progress table", () => {
  const sql = rawFile(MIG);
  assert.doesNotMatch(sql, /'(published|archived|draft)'/);
  assert.doesNotMatch(sql, /create table[^;]*progress_record/i);
});

/* ── 6 · Milestone 2 — the chamber shell and the page pivot ──────────────── */
t("page pivot — /live reads cohort_sessions through the classroom data layer", () => {
  const src = file("src/app/subjects/[subject]/live/page.tsx");
  assert.match(src, /getSessions/, "the session facts come from the classroom reader");
  assert.match(src, /sessionOfRecord/, "the chamber stands for ONE session");
  assert.match(src, /chamberState/, "the state machine names the chamber");
  assert.match(src, /CHAMBER_STATE_WORD/, "the status bar speaks the machine's word");
  assert.match(src, /isolateAsync\("live:classroom"/, "the read is isolated (5.7)");
  assert.doesNotMatch(src, /getCohortSessions|sessionForSubject/, "the cohorts reader no longer feeds this surface");
});
t("live-chamber — client shell: status bar facts, room composition, no surveillance", () => {
  /* Declared pin update (DEC-028): Step 6 binds the session channel — the
     banner word rides the channel (the server word stays the seed), the
     island reports its own audio facts upward, and the surface draws on the
     session's shared bus. The facts pinned before (mark · title · word ·
     aria-live · the two panes · no media/timers in the shell) all stand. */
  const src = rawFile("src/components/live/live-chamber.tsx");
  assert.match(src, /^"use client"/, "the shell is the client island");
  assert.match(src, /<SubjectMark subject=\{subject\.id\}/, "the subject's own mark");
  assert.match(src, /\{sessionTitle\}/, "the session's title");
  assert.match(src, /\{live \? session\.stageWord : stateWord\}/, "the word rides the channel; the server word is the seed");
  assert.match(src, /aria-live="polite"/, "state changes announce politely");
  assert.match(src, /chamber=\{\s*<RoomParticipant\s+subjectId=\{subject\.id\}\s+displayName=\{displayName\}\s+role=\{viewer\}\s+onPresence=\{live \? session\.updateLocalPresence : undefined\}\s+\/>\s*\}/);
  assert.match(src, /surface=\{\s*<AcademicSurface\s+subjectId=\{subject\.id\}\s+motif=\{subject\.motif\}\s+density=\{density\}\s+bus=\{live \? session\.bus : undefined\}\s+\/>\s*\}/);
  assert.doesNotMatch(strip(src), /setTimeout|setInterval|navigator\.mediaDevices|getUserMedia/, "the shell owns no media, no timers");
});
t("standby copy — the Milestone-2 sentences, verbatim, both forms", () => {
  const src = rawFile("src/components/live/live-stage.tsx");
  assert.match(src, /The chamber is staged\. Live connection will initiate once your tutor opens the session\./);
  assert.match(src, /The chamber is staged\. Live connection will initiate once you open the session\./);
  assert.doesNotMatch(src, /live acoustic room is staged/, "the superseded wording is gone");
});

/* ── 7 · Milestone 3 — dock and controls, one implementation each ────────── */
t("participant-dock — the tile strip exists and room-participant docks in it", () => {
  const dock = rawFile("src/components/live/participant-dock.tsx");
  assert.match(dock, /data-participant-dock/);
  assert.doesNotMatch(strip(dock), /useState|useEffect|getUserMedia/, "the dock owns no state, no media");
  assert.match(rawFile("src/components/live/room-participant.tsx"), /<ParticipantDock>/);
});
t("chamber-controls — the bridge re-exports the one control cluster, labels intact", () => {
  const bridge = rawFile("src/components/live/chamber-controls.tsx");
  assert.match(bridge, /export \{ LiveControls, LiveControls as ChamberControls \} from "\.\/live-controls"/);
  const controls = rawFile("src/components/live/live-controls.tsx");
  for (const label of [/"Mute"/, /"Unmute"/, /"Camera On"/, /"Camera Off"/, /"Share Surface"/, /\bLeave Chamber\b/]) {
    assert.match(controls, label); // the departure label is JSX text, not a quoted literal
  }
});

/* ── 8 · Milestone 4 — the sync hook has ONE implementation ──────────────── */
t("use-surface-sync — the classroom address re-exports the tested protocol", () => {
  const bridge = rawFile("src/lib/classroom/use-surface-sync.ts");
  assert.match(bridge, /useSurfaceSync,/);
  assert.match(bridge, /from "@\/lib\/livekit\/surface-sync"/);
  assert.doesNotMatch(strip(bridge), /function useSurfaceSync/, "no second implementation");
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
console.log(`\n${n - failed}/${n} classroom tests passed`);
process.exit(failed === 0 ? 0 : 1);
