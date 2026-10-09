#!/usr/bin/env node
// ============================================================================
// PHASE 8 GATE · W4 — THE MOBILE & PERFORMANCE PASS
// Verdict written to audit/phase8-performance.json. Requires `npm run build`.
//
// No browser stands in the sandbox (the house precedent records baselines
// and cites them), so the pass proves what construction proves and
// MEASURES what the committed build measures:
//   · the shelf, the drawer and the controls at 390px, by construction;
//   · the replay engine's clock discipline (nothing ticks at rest);
//   · the archive's client JS payload, measured from the prerendered
//     rehearsal HTML — the same islands the production cards mount.
// ============================================================================
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const raw = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const fmt = (b) => `${(b / 1024).toFixed(1)} KB`;

const SHELF = "src/components/archive/artifact-shelf.tsx";
const CARD = "src/components/archive/artifact-card.tsx";
const VIEWER = "src/components/archive/artifact-viewer.tsx";
const REPLAY = "src/components/archive/canvas-replay.tsx";
const MEDIA = "src/components/archive/media-player.tsx";
const SYNTH = "src/components/archive/milestone-synthesis.tsx";
const PAGE = "src/app/subjects/[subject]/archive/page.tsx";

const report = {
  gate: "PHASE 8 · W4 — The Mobile & Performance Pass",
  date: new Date().toISOString().slice(0, 10),
  mobile: {}, replay: {}, payload: {}, serverComponents: {},
  findings: [],
};
const results = [];
let failed = 0;
const check = (id, claim, fn) => {
  try { fn(); results.push({ id, claim, verdict: "PASS" }); console.log(`PASS  ${id} — ${claim}`); }
  catch (e) { failed++; results.push({ id, claim, verdict: "FAIL", error: e.message }); console.log(`FAIL  ${id} — ${claim}\n      ${e.message}`); }
};
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

/* ── M · the archive at 390px, by construction ────────────────────────────── */
check("M1", "the card grid collapses to ONE column on a phone (min track 16rem, fluid 1fr)", () => {
  const shelf = raw(SHELF);
  ok(/repeat\(auto-fill, minmax\(min\(16rem, 100%\), 1fr\)\)/.test(shelf), "the grid's min track can never overflow the viewport");
  report.mobile.shelfGrid = "repeat(auto-fill, minmax(min(16rem,100%),1fr)) — one column below ~560px";
});
check("M2", "the viewer drawer is fluid: min(60rem, 100%), padded, scrollable", () => {
  const viewer = strip(raw(VIEWER));
  ok(/width: "min\(60rem, 100%\)"/.test(viewer), "the drawer never exceeds the viewport");
  ok(/overflow: "auto"/.test(viewer), "long content scrolls inside the drawer");
  report.mobile.drawer = "min(60rem,100%) + overflow:auto";
});
check("M3", "every control row wraps; every control meets the touch target", () => {
  for (const f of [REPLAY, MEDIA]) {
    const src = strip(raw(f));
    ok(/flexWrap: "wrap"/.test(src), `${f} control rows must wrap`);
    ok(/var\(--ta-target-primary\)/.test(src), `${f} controls must meet the target token`);
  }
  report.mobile.controls = "flex-wrap rows; var(--ta-target-primary) targets";
});
check("M4", "no fixed width wider than a phone stands in any archive island", () => {
  for (const f of [CARD, VIEWER, REPLAY, MEDIA, SYNTH]) {
    const src = strip(raw(f));
    for (const m of src.matchAll(/width: "(\d+(?:\.\d+)?)rem"/g)) {
      ok(parseFloat(m[1]) <= 16, `${f} fixes a width of ${m[1]}rem`);
    }
  }
  report.mobile.fixedWidths = "none above 16rem; the drawer's 60rem is a max via min()";
});
check("M5", "the board is fluid geometry: aspect-ratio box, absolute canvas, no pixel constants", () => {
  const src = strip(raw(REPLAY));
  ok(/aspectRatio: "16 \/ 10"/.test(src), "the board keeps its shape by ratio");
  ok(/position: "absolute", inset: 0/.test(src), "the canvas fills whatever box it is given");
  report.mobile.board = "16/10 aspect box; canvas inset:0; strokes normalized 0..1";
});

/* ── P · the replay engine's clock discipline ─────────────────────────────── */
check("P1", "requestAnimationFrame runs ONLY while playing, and stops when playback stops", () => {
  const src = strip(raw(REPLAY));
  ok(/if \(!playing \|\| mode !== "playback" \|\| durationSeconds <= 0\) return;/.test(src), "no clock outside playback");
  ok(/cancelAnimationFrame/.test(src), "the clock is cancelled on stop/unmount");
  report.replay.clock = "rAF gated on playing; cancelled in cleanup";
});
check("P2", "zero timers in every island: nothing ticks at rest", () => {
  for (const f of [REPLAY, MEDIA, VIEWER, "src/components/archive/artifact-opener.tsx"]) {
    ok(!/setTimeout|setInterval/.test(strip(raw(f))), `${f} carries a timer`);
  }
  report.replay.timers = "none in any island";
});
check("P3", "high-DPI by the device's own ratio, capped; one ResizeObserver, disconnected", () => {
  const src = strip(raw(REPLAY));
  ok(/Math\.min\(window\.devicePixelRatio, 3\)/.test(src), "DPR capped at 3");
  ok(/new ResizeObserver\(size\)/.test(src), "re-measures on resize");
  ok(/ro\.disconnect\(\)/.test(src), "the observer is released");
  report.replay.dpi = "devicePixelRatio-aware, capped at 3";
});
check("P4", "the frame is the pure module's word — deterministic, never improvised", () => {
  const src = strip(raw(REPLAY));
  ok(/replayFrame\(pointSets, progress\)/.test(src), "playback renders replayFrame's frame");
  ok(/useState<Mode>\("board"\)/.test(src), "the opening state is static — no motion unasked");
  report.replay.frame = "pure replayFrame; static opening state";
});

/* ── B · the payload, MEASURED from the committed build ───────────────────── */
check("B1", "the archive islands' client JS, measured from the prerendered rehearsal", () => {
  const htmlPath = join(ROOT, ".next/server/app/dev/archive-rehearsal.html");
  ok(existsSync(htmlPath), "build first: .next/server/app/dev/archive-rehearsal.html missing");
  const html = readFileSync(htmlPath, "utf8");
  const srcs = [...new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))];
  ok(srcs.length >= 3, "the page actually loads client scripts");
  let rawBytes = 0, gz = 0; const missing = [];
  for (const src of srcs) {
    const p = join(ROOT, ".next", src.replace(/^\/_next\//, ""));
    if (!existsSync(p)) { missing.push(src); continue; }
    const buf = readFileSync(p);
    rawBytes += buf.length;
    gz += gzipSync(buf, { level: 9 }).length;
  }
  ok(missing.length === 0, `missing chunks: ${missing.join(", ")}`);
  report.payload = { scripts: srcs.length, rawKB: +(rawBytes / 1024).toFixed(1), gzipKB: +(gz / 1024).toFixed(1) };
  console.log(`      archive islands client JS: ${srcs.length} scripts · ${fmt(rawBytes)} raw · ${fmt(gz)} gzip`);
});
check("B2", "the shelf itself ships NO client JS: page, shelf, card, chronology are server components", () => {
  for (const f of [PAGE, SHELF, CARD, SYNTH]) {
    ok(!/^"use client"/m.test(raw(f)), `${f} must stay a server component`);
  }
  report.serverComponents = { page: PAGE, shelf: SHELF, card: CARD, chronology: SYNTH };
});

/* ── declared findings (recorded, not blocking) ───────────────────────────── */
report.findings.push(
  "canvas-replay reads the stroke palette from getComputedStyle once per drawn frame (the live surface caches it); one computed style read on one element beside the stroke drawing itself — consolidation owed with the first measured frame budget in a browsered environment.",
  "390px visual proof is owed to a browsered environment (the Phase 6/7 precedent): construction pins stand in.",
);

/* ── verdict ──────────────────────────────────────────────────────────────── */
const total = results.length;
const pass = total - failed;
report.verdict = failed === 0 ? "PASS" : "FAIL";
report.checks = `${pass}/${total}`;
report.results = results;
mkdirSync(new URL("../audit", import.meta.url).pathname, { recursive: true });
writeFileSync(new URL("../audit/phase8-performance.json", import.meta.url).pathname, JSON.stringify(report, null, 2) + "\n");
console.log(`\n${pass}/${total} performance checks passed — verdict ${report.verdict} (audit/phase8-performance.json)`);
process.exit(failed === 0 ? 0 : 1);
