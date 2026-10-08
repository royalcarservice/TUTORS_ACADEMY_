#!/usr/bin/env node
// Archive viewer tests (Phase 8 · Step 3, DEC-031).
// Pure — zero network, zero browser: the scholarly review mode's islands are
// pinned statically — one renderer for live and replay, full keyboard
// control, the reduced-motion posture, the signed-URL seam, and the absence
// of everything a commercial player would bring (autoplay, up-next, share).
// Run: node --import ./scripts/ts-loader.mjs scripts/test-archive-viewer.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

const RENDER = "src/lib/livekit/stroke-render.ts";
const REPLAY = "src/lib/archive/replay.ts";
const CANVAS = "src/components/archive/canvas-replay.tsx";
const MEDIA = "src/components/archive/media-player.tsx";
const VIEWER = "src/components/archive/artifact-viewer.tsx";
const OPENER = "src/components/archive/artifact-opener.tsx";
const RECORD = "src/components/archive/board-record.ts";
const ACTIONS = "src/app/subjects/[subject]/archive/actions.ts";
const CARD = "src/components/archive/artifact-card.tsx";
const SHELF = "src/components/archive/artifact-shelf.tsx";
const PAGE = "src/app/subjects/[subject]/archive/page.tsx";
const REHEARSAL = "src/app/dev/archive-rehearsal/page.tsx";
const SURFACE = "src/components/live/academic-surface.tsx";

/* ── 1 · one renderer for the whole house (DEC-031's extraction) ─────────── */
t("renderer — the fluid line lives ONCE, in the shared module", () => {
  const src = strip(rawFile(RENDER));
  assert.match(src, /quadraticCurveTo/, "quadratic smoothing");
  assert.match(src, /STROKE_COLOR_TOKEN/, "the token map");
  assert.match(src, /readStrokePalette/, "palette read from computed style");
  assert.match(src, /--ta-ivory-200[\s\S]*--ta-slate-300[\s\S]*--ta-accent-1/, "the subject's own tokens");
  assert.doesNotMatch(src, /fetch\(|setTimeout|setInterval|localStorage|WebSocket/i, "pure drawing, no side effects");
});
t("renderer — live surface AND replay consume it; no second stroke vocabulary", () => {
  assert.match(rawFile(SURFACE), /from "@\/lib\/livekit\/stroke-render"/, "the live surface draws through it");
  assert.match(rawFile(CANVAS), /from "@\/lib\/livekit\/stroke-render"/, "the replay draws through it");
  const canvas = strip(rawFile(CANVAS));
  assert.match(canvas, /drawStroke\(/, "the replay uses the shared draw");
  assert.match(canvas, /readStrokePalette\(/, "the replay resolves colours the chamber's way");
  assert.doesNotMatch(strip(rawFile(SURFACE)), /function drawStroke\(/, "no local duplicate in the live surface");
});

/* ── 2 · the board record reader — one protocol, total refusal ────────────── */
t("board record — read back through the protocol's OWN validation and reducer", () => {
  const src = strip(rawFile(RECORD));
  assert.match(src, /validatePacket/, "the chamber's own gate");
  assert.match(src, /applyPacket/, "the chamber's own reducer — idempotence preserved");
  assert.match(src, /if \(!Array\.isArray\(value\)\) return null;/, "a record that is not a list is refused");
  assert.match(src, /if \(!packet\) return null;/, "one bad entry refuses the whole record");
});

/* ── 3 · the replay engine — two modes, keyboard-complete, calm at rest ───── */
t("replay engine — client island, high-DPI, the subject's substrate beneath", () => {
  const raw = rawFile(CANVAS);
  assert.match(raw, /"use client"/);
  const src = strip(raw);
  assert.match(src, /devicePixelRatio/, "crisp at any resolution");
  assert.match(src, /role="substrate"/, "the subject's own motif carries the board");
  assert.match(src, /from "@\/lib\/archive\/replay"/, "the frame math comes from the pure module");
  assert.match(src, /replayFrame\(pointSets, progress\)/, "playback is the pure frame, never an improvisation");
});
t("replay engine — TWO modes, declared by real buttons with pressed state", () => {
  const src = strip(rawFile(CANVAS));
  assert.match(src, /data-replay-mode="board"/);
  assert.match(src, /data-replay-mode="playback"/);
  assert.match(src, /aria-pressed=\{mode === "board"\}/);
  assert.match(src, /aria-pressed=\{mode === "playback"\}/);
  assert.match(src, /useState<Mode>\("board"\)/, "the opening state is the STATIC board — motion never starts unasked");
});
t("replay engine — zoom by BUTTON, pan by KEY: no mouse-only gesture", () => {
  const src = strip(rawFile(CANVAS));
  assert.match(src, /data-replay-zoom="in"/);
  assert.match(src, /data-replay-zoom="out"/);
  assert.match(src, /data-replay-zoom="reset"/);
  assert.match(src, /onKeyDown=\{onKeyDown\}/, "the board itself takes keys");
  assert.match(src, /ArrowLeft/, "arrow keys pan");
  assert.match(src, /key === "0"/, "zero resets the view");
});
t("replay engine — the scrubber is a native range; play/pause a real button", () => {
  const src = strip(rawFile(CANVAS));
  assert.match(src, /type="range"/);
  assert.match(src, /aria-label="Replay position"/);
  assert.match(src, /data-replay-toggle/);
  assert.match(src, /\{playing \? "Pause" : "Play"\}/);
});
t("replay engine — the clock is requestAnimationFrame ONLY while playing; no timers at rest", () => {
  const src = strip(rawFile(CANVAS));
  assert.match(src, /requestAnimationFrame\(step\)/);
  assert.match(src, /cancelAnimationFrame/, "the clock stops when playback stops");
  assert.doesNotMatch(src, /setTimeout|setInterval/, "nothing ticks on a timer");
});

/* ── 4 · the media player — restrained HTML5, nothing a library would bring ─ */
t("media player — native element, no autoplay, no eager preload", () => {
  const src = strip(rawFile(MEDIA));
  assert.match(src, /"use client"/);
  assert.doesNotMatch(src, /autoPlay|autoplay/i, "the element waits for the listener");
  assert.match(src, /preload="metadata"/);
  assert.doesNotMatch(src, /new (Video|Audio)\(|hls\.js|plyr|video\.js|mux/i, "no player library");
});
t("media player — the restrained controls: play, scrub, clock, speeds, volume", () => {
  const src = strip(rawFile(MEDIA));
  assert.match(src, /\{playing \? "Pause" : "Play"\}/);
  assert.match(src, /formatTime\(current\)/, "the MM:SS clock speaks both ends");
  assert.match(src, /formatTime\(duration\)/);
  assert.match(src, /PLAYBACK_SPEEDS\.map/, "the speeds come from the pure set");
  assert.match(src, /aria-pressed=\{speed === s\}/);
  assert.match(src, /aria-label="Volume"/);
  assert.match(src, /data-media-mute/);
});
t("media player — no timers of its own; the clock is the element's event", () => {
  const src = strip(rawFile(MEDIA));
  assert.match(src, /addEventListener\("timeupdate"/);
  assert.doesNotMatch(src, /setTimeout|setInterval/);
});

/* ── 5 · the viewer — the scholarly drawer, seamless in both directions ───── */
t("viewer — a real dialog: modal, labelled by artifact and session", () => {
  const src = strip(rawFile(VIEWER));
  assert.match(src, /"use client"/);
  assert.match(src, /role="dialog"/);
  assert.match(src, /aria-modal="true"/);
  assert.match(src, /aria-label=\{`\$\{artifact\.word\} — \$\{session\.title\}`\}/);
  assert.match(src, /backdropFilter: "blur\(6px\)"/, "the environment blurs, never hides");
});
t("viewer — Escape departs; the Close button catches focus on arrival", () => {
  const src = strip(rawFile(VIEWER));
  assert.match(src, /if \(e\.key === "Escape"\) onClose\(\);/);
  assert.match(src, /closeRef\.current\?\.focus\(\)/, "focus enters the drawer");
  assert.match(src, /data-artifact-close/);
});
t("viewer — the opener returns focus on departure: the round-trip is seamless", () => {
  const src = strip(rawFile(OPENER));
  assert.match(src, /btnRef\.current\?\.focus\(\)/, "focus goes back to the handle");
  assert.match(src, /aria-haspopup="dialog"/);
  assert.match(src, /aria-expanded=\{open\}/);
  assert.match(src, /\{open && <ArtifactViewer/, "the drawer mounts ONLY while open");
});
t("viewer — the content adapts to the three kinds; every state is one calm sentence", () => {
  const src = rawFile(VIEWER);
  assert.match(src, /artifact\.type === "canvas_snapshot"/);
  assert.match(src, /artifact\.type === "pedagogical_notes"/);
  assert.match(src, /artifact\.type === "session_recording"/);
  assert.match(src, /<CanvasReplay/);
  assert.match(src, /<MediaPlayer/);
  assert.match(src, /The archive is fetching this artifact\./);
  assert.match(src, /This artifact could not be opened\. The archive has not lost it\./);
  assert.match(src, /its bytes open in a credentialed environment\./, "unsigned is stated as a fact");
  assert.match(src, /<SubjectMark subject=\{subject\.id\} size=\{24\}/, "the header wears the subject's mark");
  assert.match(src, /\{session\.dateLabel\} · \{artifact\.word\}/, "the header names the date and the kind");
});
t("viewer — the bytes come ONLY through the signed-URL seam, at open time", () => {
  const src = strip(rawFile(VIEWER));
  assert.match(src, /await openArtifact\(artifact\.id\)/);
  assert.match(src, /opened\.access\?\.mode !== "signed"/, "nothing fetches an unsigned artifact");
  const action = strip(rawFile(ACTIONS));
  assert.match(action, /^"use server"/m);
  assert.match(action, /fetchArtifactDetails\(artifactId\)/, "RLS first, then the signature — never before");
  assert.doesNotMatch(action, /userId|viewerId|currentUser/, "the cookie session is the only identity source");
});

/* ── 6 · the wiring — shelf, card, page ───────────────────────────────────── */
t("wiring — one quiet opener per card; the shelf hands it the subject and the session", () => {
  assert.match(rawFile(CARD), /<ArtifactOpener/);
  assert.match(rawFile(CARD), /notationText\(artifact\)/, "the notation travels with the opener");
  assert.match(rawFile(CARD), /mediaKindOf\(artifact\)/, "the media's own kind travels too");
  const shelf = rawFile(SHELF);
  assert.match(shelf, /dateLabel=\{sessionDate\(s\.scheduledAt\)\}/, "the shelf's own date words reach the drawer");
  assert.match(shelf, /sessionTitle=\{s\.title\}/);
  const page = rawFile(PAGE);
  assert.match(page, /motif=\{s\.motif\} density=\{settings\.levers\.density\} sessions=\{archive\.sessions\}/);
});

/* ── 7 · the rehearsal — honest specimens, no production door ─────────────── */
t("rehearsal — 404s in production; proves both engines and the round-trip", () => {
  const src = rawFile(REHEARSAL);
  assert.match(src, /if \(process\.env\.NODE_ENV === "production"\) notFound\(\);/);
  assert.match(src, /<CanvasReplay/, "the replay engine stands on specimen strokes");
  assert.match(src, /<MediaPlayer/, "the player stands on a generated tone");
  assert.match(src, /type: "canvas_snapshot"/);
  assert.match(src, /type: "pedagogical_notes"/);
  assert.match(src, /type: "session_recording"/);
  assert.match(src, /rehearsal=\{\{ strokes \}\}/, "the drawer's bytes are handed over, honestly labeled");
});

/* ── 8 · the discipline sweeps ────────────────────────────────────────────── */
t("sweep — zero engagement vocabulary in every viewer surface", () => {
  for (const f of [CANVAS, MEDIA, VIEWER, OPENER, RECORD, ACTIONS, REHEARSAL]) {
    const src = strip(rawFile(f));
    assert.doesNotMatch(src, /\bviews\b|\blikes\b|\bshares\b|popularity|trending|subscribe|recommend|watch next|up next|autoplay|auto-play|thumbnail|duration badge/i, `${f} stays clean`);
  }
});
t("sweep — zero telemetry and zero timers in every viewer surface", () => {
  for (const f of [CANVAS, MEDIA, VIEWER, OPENER, RECORD, ACTIONS]) {
    const src = strip(rawFile(f));
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|analytics|telemetry|visibilitychange|navigator\.sendBeacon/i, `${f} stays clean`);
  }
});
t("sweep — no exclamation marks in any copy, no emoji anywhere", () => {
  for (const f of [CANVAS, MEDIA, VIEWER, OPENER, RECORD, REHEARSAL]) {
    const raw = rawFile(f);
    /* Each quoted string literal, examined on its own — code negations
       BETWEEN literals can never be mistaken for copy. */
    const literals = raw.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g) ?? [];
    for (const lit of literals) {
      assert.ok(!lit.includes("!"), `${f} speaks without exclamation marks: ${lit.slice(0, 40)}`);
    }
    assert.doesNotMatch(raw, EMOJI, `${f} carries no emoji`);
  }
});
t("sweep — BANNED archive vocabulary absent from the islands", () => {
  for (const f of [CANVAS, MEDIA, VIEWER, OPENER, RECORD, ACTIONS, REHEARSAL]) {
    assert.doesNotMatch(strip(rawFile(f)), /\bVOD\b|Replay File|Recording Upload/i, `${f} keeps the archive's words`);
  }
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
console.log(`\n${n - failed}/${n} archive-viewer tests passed`);
process.exit(failed === 0 ? 0 : 1);
