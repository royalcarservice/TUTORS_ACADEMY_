#!/usr/bin/env node
// Real-time signaling & session channel tests (Phase 7 · Step 6, DEC-028).
// Pure — no server, no DB, no network.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-signaling.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const TY = await import("@/lib/classroom/types");
const TR = await import("@/lib/classroom/transport");
const {
  SIGNAL_KINDS, STAGE_STATES, SIGNAL_BYTE_BUDGET,
  roomNameFor, encodeSignal, encodedLength, validateSignal,
  stageStateOf, chamberOfStage,
} = TY;
const { createMemoryTransport, chooseTransport } = TR;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

/* ── fixtures ─────────────────────────────────────────────────────────────── */
const NOW = "2026-10-08T09:00:00Z";
const ROOM = roomNameFor("mathematics", "00000000-0000-0000-0000-000000000000");
const OTHER = roomNameFor("physics", "11111111-1111-1111-1111-111111111111");
const presence = { participantId: "tutor", role: "tutor", isSpeaking: false, hasVideo: false };
const stroke = { type: "stroke", stroke: { id: "s-1", tool: "ink", points: [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }], color: "ivory", width: 2 } };
const signal = (kind, payload, room = ROOM, at = NOW) => ({ v: 1, kind, room, at, payload });

/* ── 1 · the protocol ─────────────────────────────────────────────────────── */
t("protocol — the three kinds, exactly as briefed; the four stage words", () => {
  assert.deepEqual([...SIGNAL_KINDS], ["PRESENCE_UPDATE", "CANVAS_STROKE", "STAGE_STATE"]);
  assert.deepEqual([...STAGE_STATES], ["standby", "active", "settling", "concluded"]);
});
t("protocol — the room's name is subject + session, inseparable", () => {
  assert.equal(ROOM, "mathematics:00000000-0000-0000-0000-000000000000");
});
t("protocol — a well-formed presence passes; bad shapes are named defects", () => {
  assert.equal(validateSignal(signal("PRESENCE_UPDATE", presence), ROOM).ok, true);
  assert.equal(validateSignal(signal("PRESENCE_UPDATE", { ...presence, role: "proctor" }), ROOM).ok, false);
  assert.equal(validateSignal(signal("PRESENCE_UPDATE", { ...presence, isSpeaking: "yes" }), ROOM).ok, false);
  assert.equal(validateSignal({ ...signal("PRESENCE_UPDATE", presence), v: 2 }, ROOM).ok, false);
  assert.equal(validateSignal(signal("SOMETHING_ELSE", presence), ROOM).ok, false);
  assert.equal(validateSignal({ ...signal("PRESENCE_UPDATE", presence), at: "not-an-instant" }, ROOM).ok, false);
});
t("isolation — a signal addressed to another room is refused at the door", () => {
  const verdict = validateSignal(signal("PRESENCE_UPDATE", presence, OTHER), ROOM);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.defect, "wrong-room");
});
t("protocol — CANVAS_STROKE is the adjudicated packet, never a second opinion", () => {
  assert.equal(validateSignal(signal("CANVAS_STROKE", stroke), ROOM).ok, true);
  assert.equal(validateSignal(signal("CANVAS_STROKE", { ...stroke, stroke: { ...stroke.stroke, tool: "spray" } }), ROOM).ok, false);
});
t("protocol — STAGE_STATE admits the four words; the speaker id is optional but never empty", () => {
  for (const state of STAGE_STATES) assert.equal(validateSignal(signal("STAGE_STATE", { state }), ROOM).ok, true);
  assert.equal(validateSignal(signal("STAGE_STATE", { state: "recess" }), ROOM).ok, false);
  assert.equal(validateSignal(signal("STAGE_STATE", { state: "active", activeSpeakerId: "tutor" }), ROOM).ok, true);
  assert.equal(validateSignal(signal("STAGE_STATE", { state: "active", activeSpeakerId: "" }), ROOM).ok, false);
});
t("budget — 16 KB: a huge stroke is refused, a normal one travels", () => {
  assert.equal(SIGNAL_BYTE_BUDGET, 16 * 1024);
  const many = Array.from({ length: 4000 }, (_, i) => ({ x: (i % 100) / 100, y: 0.5 }));
  const huge = signal("CANVAS_STROKE", { type: "stroke", stroke: { id: "big", tool: "ink", points: many, color: "ivory", width: 2 } });
  assert.ok(encodedLength(huge) > SIGNAL_BYTE_BUDGET, "the fixture must actually exceed the budget");
  const verdict = validateSignal(huge, ROOM);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.defect, "payload-too-large");
  assert.equal(validateSignal(signal("CANVAS_STROKE", stroke), ROOM).ok, true);
});
t("protocol — encode is compact JSON; the budget measures bytes", () => {
  const json = encodeSignal(signal("PRESENCE_UPDATE", presence));
  assert.equal(JSON.parse(json).kind, "PRESENCE_UPDATE");
  assert.equal(typeof encodedLength(signal("PRESENCE_UPDATE", presence)), "number");
});
t("vocabulary bridge — stage words and chamber words round-trip, all four", () => {
  for (const s of STAGE_STATES) assert.equal(stageStateOf(chamberOfStage(s)), s);
  assert.equal(chamberOfStage("active"), "ACTIVE");
  assert.equal(stageStateOf("CONCLUDED"), "concluded");
});

/* ── 2 · the transport ────────────────────────────────────────────────────── */
t("transport — same room: everyone hears, the sender included (loopback)", () => {
  const a = createMemoryTransport(ROOM);
  const b = createMemoryTransport(ROOM);
  const heardA = [], heardB = [];
  const ua = a.subscribe((s) => heardA.push(s.kind));
  const ub = b.subscribe((s) => heardB.push(s.kind));
  assert.equal(a.signal(signal("PRESENCE_UPDATE", presence)).ok, true);
  assert.deepEqual(heardA, ["PRESENCE_UPDATE"], "the sender hears itself");
  assert.deepEqual(heardB, ["PRESENCE_UPDATE"], "the room hears the sender");
  ua(); ub();
});
t("transport — cross-room leakage is impossible", () => {
  const a = createMemoryTransport(ROOM);
  const other = createMemoryTransport(OTHER);
  const heard = [];
  const u = other.subscribe((s) => heard.push(s));
  // a signal addressed to the OTHER room cannot even be spoken into this one
  assert.equal(a.signal(signal("STAGE_STATE", { state: "active" }, OTHER)).ok, false);
  assert.equal(heard.length, 0, "the other room heard nothing");
  u();
});
t("transport — malformed or oversized signals are refused, never delivered", () => {
  const a = createMemoryTransport(ROOM);
  const heard = [];
  const u = a.subscribe((s) => heard.push(s));
  assert.equal(a.signal({ v: 1, kind: "NOPE", room: ROOM, at: NOW, payload: {} }).ok, false);
  assert.equal(heard.length, 0);
  u();
});
t("transport — departure is real: an unsubscribed room goes quiet", () => {
  const a = createMemoryTransport(ROOM);
  const heard = [];
  const u = a.subscribe((s) => heard.push(s));
  u();
  a.signal(signal("STAGE_STATE", { state: "concluded" }));
  assert.equal(heard.length, 0);
});
t("transport — the carrier today is the memory mode (the LiveKit seam is named, not built)", () => {
  assert.equal(chooseTransport(ROOM, { configured: false, missing: [] }).mode, "memory");
  assert.equal(chooseTransport(ROOM, { configured: true, missing: [] }).mode, "memory", "configured-but-unwired still degrades to local working mode");
});

/* ── 3 · the hook (static — it is a client island and never imported here) ── */
const HOOK = "src/lib/classroom/use-classroom-session.ts";
t("hook — zero telemetry: no focus, keys, gaze, idle, storage, timers", () => {
  const src = strip(rawFile(HOOK));
  assert.doesNotMatch(src, /keydown|keyup|keypress|visibilitychange|document\.hidden|\bidle\b|gaze|dwell|geolocation|localStorage|sessionStorage|indexedDB|setTimeout|setInterval/i);
  assert.doesNotMatch(src, /from "livekit-client"|require\("livekit-client"\)/, "no carrier dependency (DEC-023)");
});
t("hook — presence begins with the local participant alone: nobody is invented", () => {
  assert.match(rawFile(HOOK), /transport \? \[localPresence\] : \[\]/);
});
t("hook — the lifecycle word is the tutor's alone", () => {
  assert.match(rawFile(HOOK), /if \(!transport \|\| role !== "tutor"\) return/);
});
t("hook — cleanup unsubscribes completely (no zombie ears)", () => {
  assert.match(rawFile(HOOK), /return unsubscribe;/);
});
t("hook — unchanged presence says nothing (no chatter on the channel)", () => {
  assert.match(rawFile(HOOK), /if \(current\.isSpeaking === p\.isSpeaking && current\.hasVideo === p\.hasVideo\) return/);
});

/* ── 4 · the chamber binding ─────────────────────────────────────────────── */
t("page — the channel facts are passed: session id, server stage, readiness", () => {
  const src = rawFile("src/app/subjects/[subject]/live/page.tsx");
  assert.match(src, /sessionId=\{session\.id\}/);
  assert.match(src, /stage=\{stageStateOf\(chamber\)\}/);
  assert.match(src, /configured=\{readiness\.configured\}/);
});
t("chamber — concluded by signal closes the workspace calmly", () => {
  const src = rawFile("src/components/live/live-chamber.tsx");
  assert.match(src, /data-live-chamber-concluded/);
  assert.match(src, /The session in \{subject\.name\} has concluded\./);
  assert.match(src, /live && session\.concluded \? \(/, "the ternary decides; the room unmounts");
});
t("chamber — presence names who the channel knows, and nothing else", () => {
  const src = rawFile("src/components/live/live-chamber.tsx");
  assert.match(src, /Tutor present/);
  assert.match(src, /Student present/);
  assert.match(src, /The room is empty/);
});
t("chamber — the rehearsal lifecycle toggle is the tutor's, clearly named", () => {
  const src = rawFile("src/components/live/live-chamber.tsx");
  assert.match(src, /rehearsal && viewer === "tutor"/);
  assert.match(src, /Rehearsal — conclude the session/);
  assert.match(src, /Rehearsal — reopen the session/);
});
t("island — the presence tap is optional and carries only the island's own facts", () => {
  const src = rawFile("src/components/live/room-participant.tsx");
  assert.match(src, /onPresence\?: \(p: \{ isSpeaking: boolean; hasVideo: boolean \}\) => void/);
  assert.match(src, /isSpeaking: speaking && flags\.mic/);
  assert.match(src, /hasVideo: flags\.camera && localStream !== null/);
});
t("surface — the shared bus is an OPTIONAL prop; local mode is the default", () => {
  const src = rawFile("src/components/live/academic-surface.tsx");
  assert.match(src, /bus\?: SurfaceBus;/);
  assert.match(src, /useSurfaceSync\(bus\)/);
});

/* ── 5 · the rehearsal shows the whole channel ───────────────────────────── */
t("rehearsal — the chamber stands in a specimen session, lifecycle exercisable", () => {
  const src = rawFile("src/app/dev/live-stage/page.tsx");
  assert.match(src, /<RehearsalChamber/);
  assert.match(src, /sessionId="00000000-0000-0000-0000-000000000000"/);
  assert.match(src, /stage="active"/);
  assert.match(src, /\s+rehearsal\n/, "the shell knows it rehearses");
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
console.log(`\n${n - failed}/${n} signaling tests passed`);
process.exit(failed === 0 ? 0 : 1);
