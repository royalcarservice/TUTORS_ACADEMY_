#!/usr/bin/env node
// Live participant interface tests (Phase 7 · Step 3, DEC-024). Pure — no browser, no devices, no network.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-live-participant.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const MS = await import("@/lib/live/media-state");
const {
  initialMediaFlags, nextMediaFlags, constraintsFor, blockForError,
  MEDIA_STATE_SENTENCE, participantLabel, monogramFor, speakingNext,
} = MS;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const file = (p) => strip(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

/* ── 1 · the pure state machine ───────────────────────────────────────────── */
t("purity — media-state.ts reads no clock, env, db or network", () => {
  assert.doesNotMatch(file("src/lib/live/media-state.ts"), /Date\.now\(|process\.env|supabase|fetch\(|localStorage|navigator\./);
});
t("privacy is the initial state — every device off, nothing requested", () => {
  assert.deepEqual(initialMediaFlags(), { mic: false, camera: false, share: false });
});
t("transitions — one action, one flag; leaving silences everything", () => {
  let f = initialMediaFlags();
  f = nextMediaFlags(f, { type: "mic", on: true });
  assert.deepEqual(f, { mic: true, camera: false, share: false });
  f = nextMediaFlags(f, { type: "camera", on: true });
  f = nextMediaFlags(f, { type: "share", on: true });
  assert.deepEqual(f, { mic: true, camera: true, share: true });
  assert.deepEqual(nextMediaFlags(f, { type: "leave" }), initialMediaFlags());
});
t("constraints — nothing requested means no capture call at all", () => {
  assert.equal(constraintsFor(initialMediaFlags()), null);
  assert.deepEqual(constraintsFor({ mic: true, camera: false, share: false }), { audio: true, video: false });
  assert.deepEqual(constraintsFor({ mic: true, camera: true, share: true }), { audio: true, video: true });
});
t("blocks — the browser's error names map to two calm truths", () => {
  assert.equal(blockForError("NotAllowedError")?.kind, "denied");
  assert.equal(blockForError("SecurityError")?.kind, "denied");
  assert.equal(blockForError("NotFoundError")?.kind, "unavailable");
  assert.equal(blockForError("NotReadableError")?.kind, "unavailable");
  assert.equal(blockForError("AnythingElse")?.kind, "denied");
});
t("state sentences — the brief's denied sentence verbatim; no exclamation anywhere", () => {
  assert.equal(
    MEDIA_STATE_SENTENCE.denied,
    "Media access was not granted by your browser. You can still listen and participate via text or enable permissions in your browser settings.",
  );
  for (const s of Object.values(MEDIA_STATE_SENTENCE)) assert.doesNotMatch(s, /!/, s);
});
t("labels — academic display names; tutors are named as tutors", () => {
  assert.equal(participantLabel("Dr. Vance", "tutor"), "Dr. Vance (Tutor)");
  assert.equal(participantLabel("  Amara Osei  ", "student"), "Amara Osei");
  assert.equal(participantLabel("", "student"), "Participant");
  assert.equal(participantLabel("", "tutor"), "Tutor");
});
t("monogram — first letters of the first two words; emptiness stays empty", () => {
  assert.equal(monogramFor("Dr. Vance"), "DV");
  assert.equal(monogramFor("Amara"), "A");
  assert.equal(monogramFor("   "), "");
});
t("speaking hysteresis — on above the band, off below, holds inside", () => {
  assert.equal(speakingNext(0.09, false), true);
  assert.equal(speakingNext(0.05, true), true, "inside the band: no flicker");
  assert.equal(speakingNext(0.02, true), false);
  assert.equal(speakingNext(0.05, false), false);
});

/* ── 2 · the tile ─────────────────────────────────────────────────────────── */
t("tile — client island, no transport, muted preview, speaking state exposed", () => {
  const src = rawFile("src/components/live/participant-tile.tsx");
  assert.match(src, /"use client"/);
  const code = strip(src);
  assert.doesNotMatch(code, /fetch\(|WebSocket|RTCPeerConnection|livekit|XMLHttpRequest/, "the tile sends nothing");
  assert.doesNotMatch(code, /setTimeout|setInterval/, "no timers");
  assert.match(code, /muted/, "own preview never echoes");
  assert.match(code, /data-speaking=/);
  assert.doesNotMatch(code, EMOJI, "no emoji");
});
t("tile — no device telemetry: no IP, no connection bars, no badges", () => {
  const src = rawFile("src/components/live/participant-tile.tsx");
  assert.doesNotMatch(strip(src), /\bip\b|\bconnection\b|bandwidth|\bsignal\b|device badge|latency|jitter|packet/i);
});

/* ── 3 · the controls ─────────────────────────────────────────────────────── */
t("controls — the four restrained verbs, exactly as the brief words them", () => {
  const src = rawFile("src/components/live/live-controls.tsx");
  for (const label of ["Mute", "Unmute", "Camera On", "Camera Off", "Share Surface", "Stop Sharing", "Leave Chamber"]) {
    // the toggles render as quoted ternaries; departure renders as JSX text — both are the label, verbatim
    assert.ok(src.includes(`"${label}"`) || src.includes(label), `missing control label: ${label}`);
  }
});
t("controls — toggles announce aria-pressed; the state sentence is described", () => {
  const src = strip(rawFile("src/components/live/live-controls.tsx"));
  assert.equal((src.match(/aria-pressed=/g) ?? []).length, 3, "mic, camera, share");
  assert.match(src, /aria-describedby=\{stateSentenceId\}/);
  assert.match(src, /role="group"/);
});
t("controls — pedagogical calm: no raise-hand, no reactions, no attention scores, no emoji", () => {
  const src = rawFile("src/components/live/live-controls.tsx");
  assert.doesNotMatch(strip(src), /raise|hand|reaction|attention|score|emoji|applause|confetti/i);
  assert.doesNotMatch(src, EMOJI);
});

/* ── 4 · the island ───────────────────────────────────────────────────────── */
t("island — opt-in only: initial state is privacy; no capture at load", () => {
  const src = strip(rawFile("src/components/live/room-participant.tsx"));
  assert.match(src, /useState<MediaFlags>\(initialMediaFlags\)/);
  assert.doesNotMatch(src, /useEffect\(\(\) => \{\s*(void )?(navigator|requestLocal)/, "no capture inside a mount effect");
});
t("island — sends nothing: no network, no transport, no persistence, no timers", () => {
  const src = strip(rawFile("src/components/live/room-participant.tsx"));
  assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|WebSocket|RTCPeerConnection|livekit|navigator\.sendBeacon/);
  assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|IndexedDB|caches\./i);
  assert.doesNotMatch(src, /setTimeout|setInterval/);
});
t("island — departure stops every track and returns to the environment", () => {
  const src = strip(rawFile("src/components/live/room-participant.tsx"));
  assert.match(src, /const onLeave = useCallback\(\(\) => \{[\s\S]*?stopLevelWatch\(\);[\s\S]*?commitLocal\(null\);[\s\S]*?commitShare\(null\);[\s\S]*?router\.push/);
});
t("island — the state sentence renders in running type, politely announced", () => {
  const src = rawFile("src/components/live/room-participant.tsx");
  assert.match(src, /aria-live="polite"/);
  assert.match(src, /MEDIA_STATE_SENTENCE\.denied/);
  assert.match(src, /MEDIA_STATE_SENTENCE\.unavailable/);
});

/* ── 5 · the motion contract ──────────────────────────────────────────────── */
t("motion — the glow's only transition obeys the reduced-motion contract", () => {
  const css = rawFile("src/app/globals.css");
  assert.match(css, /\.ta-live-tile \{ transition:/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.ta-live-tile \{ transition: none; \}/);
  assert.match(css, /\[data-reduced-motion="on"\] \.ta-live-tile \{ transition: none; \}/);
});

/* ── 6 · the integration gates ────────────────────────────────────────────── */
t("/live — the island renders ONLY when the room is truly open", () => {
  const src = rawFile("src/app/subjects/[subject]/live/page.tsx");
  assert.match(src, /roomOpen = module\?\.status === "live" && readiness\.configured && session !== null/);
  /* 7.4 (DEC-025): the gate is unchanged; the island is now composed inside
     the room layout (chamber pane + academic surface). */
  assert.match(src, /participant=\{roomOpen \? \(/);
  assert.match(src, /chamber=\{<RoomParticipant/);
  assert.doesNotMatch(src, /"use client"|'use client'/, "the page stays a server component");
});
t("stage — the reserved grid and standby stand while the room is closed", () => {
  const src = rawFile("src/components/live/live-stage.tsx");
  assert.match(src, /data-live-grid/);
  assert.match(src, /The live acoustic room is staged\. Live sessions will initiate when your tutor opens the chamber\./);
  assert.match(src, /\{participant \? \(/);
  assert.match(src, /\{!participant && \(!readiness\.configured \? \(/);
});
t("rehearsal route — production-gated, subject-scoped, names itself", () => {
  const src = rawFile("src/app/dev/live-stage/page.tsx");
  assert.match(src, /process\.env\.NODE_ENV === "production"\) notFound\(\)/);
  assert.match(src, /data-subject=\{s\.id\}/);
  assert.match(src, /rehearsal/);
  assert.match(strip(src), /this device/, "the rehearsal names its privacy");
});

/* ── 7 · the vocabulary sweep ─────────────────────────────────────────────── */
t("copy — no exclamation marks, no apology theatre, no vendor nouns in the new surfaces", () => {
  for (const p of [
    "src/components/live/participant-tile.tsx",
    "src/components/live/live-controls.tsx",
    "src/components/live/room-participant.tsx",
    "src/lib/live/media-state.ts",
  ]) {
    const src = strip(rawFile(p));
    const rendered = [...src.matchAll(/"([^"]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2]).join(" ");
    assert.doesNotMatch(rendered, /!/, `${p}: exclamation mark`);
    assert.doesNotMatch(rendered, /oops|sorry|uh-oh|whoops|something went wrong/i, `${p}: apology theatre`);
    assert.doesNotMatch(rendered, /\bzoom\b|\bteams\b|webinar|conference/i, `${p}: vendor nouns`);
  }
});

console.log(`\n${n - failed}/${n} passed`);
process.exit(failed ? 1 : 0);
