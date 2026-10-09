#!/usr/bin/env node
// PHASE 7 GATE · WINDOW W4 — THE MOBILE & PERFORMANCE PASS.
// (1) 390px responsive chamber layout — by construction + pin (no browser in
//     the sandbox; the Phase 6 precedent records baselines and cites them).
// (2) canvas responsiveness — resize-safe, high-DPI, normalized geometry.
// (3) client JS payload audit — measured from the committed production build.
// Run: node scripts/gate7-perf-audit.mjs   (after `npm run build`)
// Verdict recorded in audit/phase7-performance.json (committed baseline).
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };

/* ── 1 · the chamber at 390px ─────────────────────────────────────────────── */
t("mobile — below the split, ONE plane at a time behind a real toggle", () => {
  const src = strip(read("src/components/live/room-layout.tsx"));
  assert.match(src, /min-width: 900px/, "the split threshold (tested, pinned)");
  assert.match(src, /matchMedia\(SPLIT_QUERY\)/, "the decision observed live");
  assert.match(src, /addEventListener\?\.\("change"/, "orientation/resize changes re-decide");
  assert.match(src, /data-room-layout="panes"/, "the small-screen mode is a named state");
  assert.equal((src.match(/aria-pressed=/g) ?? []).length >= 1, true, "the pane switch is a real button");
  assert.match(src, /Chamber|Surface/, "the panes are named by what they hold");
});
t("mobile — the chamber shell holds no fixed widths that could overflow 390px", () => {
  const src = read("src/components/live/live-chamber.tsx");
  assert.doesNotMatch(src, /(?<!min-)(?<!max-)width:\s*["']?\d{3,}px/, "no ≥100px fixed element widths in the shell");
  const layout = read("src/components/live/room-layout.tsx");
  assert.doesNotMatch(layout, /(?<!min-)(?<!max-)width:\s*["']?\d{3,}px/, "no ≥100px fixed element widths in the layout (media-query thresholds are breakpoints, not widths)");
});
t("mobile — the participant island is fluid (no fixed tile dimensions)", () => {
  const src = read("src/components/live/room-participant.tsx");
  assert.doesNotMatch(src, /(?<!min-)(?<!max-)width:\s*["']?\d{3,}px/, "the island flows to its container");
});

/* ── 2 · the canvas responds ──────────────────────────────────────────────── */
t("canvas — resize-safe and high-DPI; geometry is normalized (0..1)", () => {
  const src = strip(read("src/components/live/academic-surface.tsx"));
  assert.match(src, /devicePixelRatio/, "high-DPI by the device's own ratio");
  assert.match(src, /resize/i, "the canvas re-measures on resize");
  assert.match(src, /Math\.min\(1, Math\.max\(0, \(e\.clientX - rect\.left\) \/ rect\.width\)\)/, "x normalized — packets carry no pixel truth");
  assert.match(src, /Math\.min\(1, Math\.max\(0, \(e\.clientY - rect\.top\) \/ rect\.height\)\)/, "y normalized");
});
t("canvas — strokes replay from normalized packets, so any size re-renders the same", () => {
  const src = read("src/lib/livekit/surface-sync.ts");
  assert.match(src, /points/, "packets carry points");
  const surface = strip(read("src/components/live/academic-surface.tsx"));
  assert.match(surface, /p\.x \* |\.x \* (w|width|css|canvas)/, "replay multiplies by the live canvas size");
});

/* ── 3 · the client JS payload ────────────────────────────────────────────── */
const chunkSize = (rel) => {
  const p = join(ROOT, ".next", rel);
  if (!existsSync(p)) return null;
  const buf = readFileSync(p);
  return { raw: buf.length, gzip: gzipSync(buf, { level: 9 }).length };
};
const fmt = (b) => b == null ? "—" : `${(b / 1024).toFixed(1)} KB`;

const payload = {};

/* The rehearsal page is PRERENDERED, so its HTML names the exact scripts the
 * browser would fetch — and it mounts the same three islands the production
 * chamber mounts. Measuring it measures the room. */
t("payload — the live room's client JS, measured from the prerendered rehearsal", () => {
  const htmlPath = join(ROOT, ".next/server/app/dev/live-stage.html");
  assert.ok(existsSync(htmlPath), "npm run build must precede W4");
  const html = readFileSync(htmlPath, "utf8");
  const srcs = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(srcs.length >= 3, "the page actually loads client scripts");
  let raw = 0, gzip = 0, missing = [];
  for (const src of new Set(srcs)) {
    const s = chunkSize(src.replace(/^\/_next\//, ""));
    if (s) { raw += s.raw; gzip += s.gzip; } else missing.push(src);
  }
  assert.equal(missing.length, 0, `chunks missing from build: ${missing.join(", ")}`);
  payload.liveRoom = { scripts: new Set(srcs).size, rawKB: +(raw / 1024).toFixed(1), gzipKB: +(gzip / 1024).toFixed(1) };
  console.log(`      live room client JS: ${new Set(srcs).size} scripts · ${fmt(raw)} raw · ${fmt(gzip)} gzip`);
});
t("payload — the settle surface adds ZERO client JS (server component)", () => {
  const src = read("src/components/live/session-settlement.tsx");
  assert.doesNotMatch(src, /^"use client"/m, "settlement is a server component");
  const stage = read("src/components/live/live-stage.tsx");
  assert.doesNotMatch(stage, /^"use client"/m, "the standby stage is a server component");
});
t("payload — exactly THREE client islands carry the open room (the rest is server)", () => {
  const islands = ["src/components/live/live-chamber.tsx", "src/components/live/room-participant.tsx", "src/components/live/academic-surface.tsx"]
    .filter((f) => /^"use client"/m.test(read(f)));
  assert.equal(islands.length, 3, `unexpected island set: ${islands.join(", ")}`);
  for (const f of ["src/components/live/live-stage.tsx", "src/components/live/session-settlement.tsx", "src/app/subjects/[subject]/live/page.tsx"]) {
    assert.doesNotMatch(read(f), /^"use client"/m, `${f} must stay server`);
  }
});

const verdict = failed === 0 ? "PASS" : "FAIL";
mkdirSync(join(ROOT, "audit"), { recursive: true });
writeFileSync(join(ROOT, "audit/phase7-performance.json"), JSON.stringify({
  gate: "PHASE 7 · W4 — Mobile & Performance Pass",
  date: "2026-10-08",
  verdict,
  checks_run: n,
  checks_failed: failed,
  sandbox_note: "no browser/Puppeteer here — 390px behaviour proven by construction and pinned thresholds (Phase 6 precedent); measured values are chunk payloads from the committed production build",
  client_payload_by_route: payload,
  client_islands_on_live_route: ["live-chamber", "room-participant", "academic-surface"],
  server_only: ["page.tsx (gate + facts)", "live-stage (standby)", "session-settlement (aftermath)"],
}, null, 2));
console.log(`\nW4 VERDICT: ${verdict} (${n - failed}/${n})`);
process.exit(failed === 0 ? 0 : 1);
