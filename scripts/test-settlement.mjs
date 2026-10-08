#!/usr/bin/env node
// Session settlement & progress capture tests (Phase 7 · Step 5, DEC-027).
// Pure — no server, no DB, no network.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-settlement.mjs
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const SM = await import("@/lib/classroom/state-machine");
const { retainsRoom, showsSettlement, chamberState } = SM;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const file = (p) => strip(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const ROUTE = "src/app/subjects/[subject]/live/settle/route.ts";
const SETTLEMENT = "src/components/live/session-settlement.tsx";
const PAGE = "src/app/subjects/[subject]/live/page.tsx";

/* ── 1 · the machine's settlement vocabulary ─────────────────────────────── */
t("machine — the room retains state only while ACTIVE or SETTLING", () => {
  assert.equal(retainsRoom("ACTIVE"), true);
  assert.equal(retainsRoom("SETTLING"), true);
  assert.equal(retainsRoom("STANDBY"), false);
  assert.equal(retainsRoom("CONCLUDED"), false);
});
t("machine — settlement speaks only for SETTLING and CONCLUDED", () => {
  assert.equal(showsSettlement("SETTLING"), true);
  assert.equal(showsSettlement("CONCLUDED"), true);
  assert.equal(showsSettlement("STANDBY"), false);
  assert.equal(showsSettlement("ACTIVE"), false);
});
t("machine — retention and settlement never overlap (a room is either lived in or settled)", () => {
  for (const c of ["STANDBY", "ACTIVE", "SETTLING", "CONCLUDED"]) {
    assert.ok(!(retainsRoom(c) && showsSettlement(c)) || c === "SETTLING", "only SETTLING may hold both truths — the window");
  }
  // SETTLING retains the room's lingering state while settlement speaks —
  // that overlap IS the settling window; the page resolves it by preferring
  // the settlement surface once the session is concluded.
  assert.equal(retainsRoom("SETTLING") && showsSettlement("SETTLING"), true);
});

/* ── 2 · the settle route — shape of the write ───────────────────────────── */
t("route — POST only: a GET here is a 405, never a write", () => {
  const src = file(ROUTE);
  assert.match(src, /export async function POST/);
  assert.doesNotMatch(src, /export async function GET/, "no GET export: the framework answers 405");
});
t("route — the tutor's standing is decided by RLS on the read, never by trust", () => {
  const src = file(ROUTE);
  assert.match(src, /from\("cohort_sessions"\)/);
  assert.match(src, /\.eq\("subject_id", s\.id\)/, "subject isolation spelled in the boundary read");
  assert.match(src, /maybeSingle\(\)/);
  assert.match(src, /if \(!sessionRow\) return nothing\(\)/, "invisible or unknown session: the same 404 bytes");
  assert.match(src, /identity\.role !== "tutor"/, "only a tutor may settle");
});
t("route — the conclusion is ONE atomic guarded UPDATE, service role", () => {
  const src = file(ROUTE);
  assert.match(src, /createServiceClient\(\)/, "writes run through the service client");
  assert.match(src, /\.update\(\{ state: "concluded" \}\)/);
  assert.match(src, /\.eq\("state", "active"\)/, "guarded by the state the row still holds");
});
t("route — a session that never opened cannot be concluded", () => {
  const src = file(ROUTE);
  assert.match(src, /sessionRow\.state === "scheduled"/);
});
t("route — the record is the session-attended FACT, ref_id = the session row", () => {
  const src = file(ROUTE);
  assert.match(src, /kind: "session-attended"/);
  assert.match(src, /ref_id: body\.sessionId/, "the DEC-026 referent, spelled");
  assert.match(src, /at: concludedAt/, "the fact's time is when the session concluded");
  assert.match(src, /from\("enrolments"\)/, "the roster the record speaks for");
  assert.match(src, /\.eq\("status", "active"\)/);
});
t("route — idempotent: a repeated settle writes nothing twice", () => {
  const src = file(ROUTE);
  assert.match(src, /\.eq\("ref_id", body\.sessionId\)/, "facts already standing are read first");
  assert.match(src, /ignoreDuplicates: true/);
});
t("route — academicNotes is validated and then NOT stored (P5-R6)", () => {
  const src = strip(rawFile(ROUTE));
  assert.match(src, /NOTES_MAX/, "the 500-char bound is checked");
  assert.match(src, /academicNotes\.length > NOTES_MAX/);
  // The written rows carry the five ruled fields and nothing else.
  const rowsBlock = src.match(/const rows = \([\s\S]*?\)\s*\.map\(\(r\) => \(\{[\s\S]*?\}\)\);/);
  assert.ok(rowsBlock, "the rows builder is present");
  assert.doesNotMatch(rowsBlock[0], /notes|academicNotes|milestoneKey/, "nothing but the fact lands in the row");
});
t("route — milestoneKey is validated against STEP_EVIDENCE, never a second vocabulary", () => {
  const src = file(ROUTE);
  assert.match(src, /STEP_EVIDENCE/, "the arc's own mapping is the source");
  assert.match(src, /MILESTONE_KEYS/, "admitted keys are derived, not copied");
});
t("route — every outcome settles by 303 to the settling GET (P6-R15)", () => {
  const src = file(ROUTE);
  assert.doesNotMatch(src, /status: 302|status: 200/, "no other success/post shape");
  assert.match(src, /seeOther\(`\$\{settlingGet\}\?settle=failed`\)/, "a refused settlement names itself on the GET");
  assert.match(src, /seeOther\(settlingGet\)/, "a settled write returns to the surface that re-reads the truth");
});
t("P6-R15 registry — the settle write is listed, or it does not ship", () => {
  const src = rawFile("src/lib/state/settle.ts");
  assert.match(src, /live\\\/settle/, "the write is registered");
  assert.match(src, /`\/subjects\/\$\{m\[1\]\}\/live`/, "its settling GET is the live surface");
});

/* ── 3 · the settlement surface ───────────────────────────────────────────── */
t("settlement — a SERVER component: no client directive, no timers, no media", () => {
  const src = strip(rawFile(SETTLEMENT));
  assert.doesNotMatch(src, /"use client"|'use client'/);
  assert.doesNotMatch(src, /setTimeout|setInterval|requestAnimationFrame|getUserMedia/);
});
t("settlement — the student's closing sentences, exact", () => {
  const src = rawFile(SETTLEMENT);
  assert.match(src, /The session in \$\{subject\.name\} has concluded\. Your record in \$\{subject\.name\} has been updated\./, "the brief's sentence, verbatim, when the record stands");
  assert.match(src, /The session in \$\{subject\.name\} has concluded\./, "no claim about the record while none is written");
});
t("settlement — the departure actions, exact, to the right doors", () => {
  const src = rawFile(SETTLEMENT);
  assert.match(src, /Return to Student Workspace/);
  assert.match(src, /href=\{ROUTES\.student\}/);
  assert.match(src, /Confirm &amp; Return to Placements/);
  assert.match(src, /href=\{ROUTES\.tutor\}/);
});
t("settlement — pedagogical calm: no stars, no survey, no evaluative vocabulary", () => {
  const src = strip(rawFile(SETTLEMENT));
  assert.doesNotMatch(src, /\bstar\b|\brating\b|\bsurvey\b|\bfeedback\b|\battentive\b|\bdistracted\b|\bscore\b|\bthumbs/i, "no evaluation apparatus of any kind");
  assert.doesNotMatch(src, /<select/, "no drop-down can name a student anything");
  assert.doesNotMatch(src, /<textarea/, "no free-text field about a student");
});
t("settlement — the tutor's form names the refusal, then settles by POST", () => {
  const src = rawFile(SETTLEMENT);
  assert.match(src, /Notes about the student are not kept/, "the refusal is stated, not hidden");
  assert.match(src, /the record holds facts, never summaries/i);
  assert.match(src, /action=\{`\/subjects\/\$\{subject\.id\}\/live\/settle`\}/);
  assert.match(src, /type="hidden" name="sessionId"/);
});

/* ── 4 · conclusion confidentiality — nothing lingers on the device ──────── */
t("confidentiality — the live surfaces hold NO device storage", () => {
  const liveDir = new URL("../src/components/live/", import.meta.url);
  for (const f of readdirSync(liveDir)) {
    if (!f.endsWith(".tsx") && !f.endsWith(".ts")) continue;
    const src = strip(rawFile(`src/components/live/${f}`));
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|openDatabase/, `src/components/live/${f} stores on the device`);
  }
  for (const f of ["src/lib/classroom/state-machine.ts", "src/lib/classroom/data.ts", "src/lib/livekit/surface-sync.ts"]) {
    assert.doesNotMatch(strip(rawFile(f)), /localStorage|sessionStorage|indexedDB|openDatabase/, `${f} stores on the device`);
  }
});
t("confidentiality — the island's departure still stops every track on unmount", () => {
  const src = file("src/components/live/room-participant.tsx");
  assert.match(src, /stopStream\(localRef\.current\)/, "the local stream stops");
  assert.match(src, /audioCtxRef\.current\?\.close\(\)/, "the audio context closes");
});

/* ── 5 · the page decides settlement from facts ──────────────────────────── */
t("page — the room opens on ACTIVE; the settlement speaks from SETTLING onward", () => {
  const src = file(PAGE);
  assert.match(src, /const roomOpen = moduleLive && chamber === "ACTIVE"/);
  assert.match(src, /const settling = moduleLive && session !== null && showsSettlement\(chamber\)/);
  assert.match(src, /<SessionSettlement/, "the settlement surface is composed");
  assert.match(src, /recorded=\{viewer === "student" \? studentRecorded : tutorRecorded\}/);
});
t("page — the student's recorded fact comes from their OWN events read", () => {
  const src = file(PAGE);
  assert.match(src, /e\.kind === "session-attended" && e\.refId === session\.id/);
});
t("page — the tutor's conclusion action is a plain form, tutor-only, apart from the cluster", () => {
  const src = rawFile(PAGE);
  assert.match(src, /viewer === "tutor" \? \(\s*<form action=\{`\/subjects\/\$\{s\.id\}\/live\/settle`\}/);
  assert.match(src, /data-conclude-session/);
  assert.match(src, /Conclude the session/);
});
t("page — a refused settlement renders one calm sentence", () => {
  const src = rawFile(PAGE);
  assert.match(src, /settle === "failed"/);
  assert.match(src, /The session could not be settled\. Its current state stands\./);
});

/* ── 6 · the data layer's settlement read ────────────────────────────────── */
t("data — the attendance count is SELECT-only, subject spelled, failures stay failures", () => {
  const src = file("src/lib/classroom/data.ts");
  assert.match(src, /getSessionAttendanceCount/);
  assert.match(src, /count: "exact", head: true/);
  assert.match(src, /\.eq\("kind", "session-attended"\)/);
  assert.doesNotMatch(src, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/, "the reader must never write");
});

/* ── 7 · the rehearsal shows the ceremony ────────────────────────────────── */
t("rehearsal — all four settlement variants stand for inspection", () => {
  const src = rawFile("src/app/dev/live-stage/page.tsx");
  assert.equal((src.match(/<SessionSettlement/g) ?? []).length, 4, "student recorded · student pending · tutor form · tutor confirmed");
  assert.match(src, /viewer="student" recorded/);
  assert.match(src, /viewer="tutor" recorded=\{false\}/);
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
console.log(`\n${n - failed}/${n} settlement tests passed`);
process.exit(failed === 0 ? 0 : 1);
