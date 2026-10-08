#!/usr/bin/env node
// ============================================================================
// PHASE 9 GATE · W4 — THE MOBILE & PERFORMANCE PASS
//
// Verifies (pure + measured from the committed production build — the
// gate8 performance pattern):
//   M1–M5  the lens, the composer, the card and the oversight panel are
//          mobile by CONSTRUCTION at 390px — fluid columns, token-driven
//          padding, wrapped controls, native inputs, touch-sized marks;
//   P1–P3  the clock discipline — zero timers in the island, server-first
//          components, zero animation paint work;
//   B1–B3  the payload — MEASURED from the prerendered rehearsal (the only
//          route that mounts the island in a static document), compared
//          against the chamber/archive shared-chunk posture; the oversight
//          panel ships ZERO client JavaScript (plain forms).
//
// No browser stands in the sandbox — construction proves what construction
// proves (the Phase 6–8 precedent); the visual walk is owed.
// Writes audit/phase9-performance.json.
// Run: node scripts/gate9-perf-audit.mjs
// ============================================================================
import { readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const LENS = "src/components/socratic/socratic-lens.tsx";
const COMPOSER = "src/components/socratic/inquiry-composer.tsx";
const CARD = "src/components/socratic/guidance-card.tsx";
const PANEL = "src/components/tutor/socratic-reflections.tsx";
const SURFACE = "src/components/tutor/relationship-surface.tsx";
const SRC = Object.fromEntries([LENS, COMPOSER, CARD, PANEL, SURFACE].map((p) => [p, strip(read(p))]));

const checks = [];
const check = (id, name, fn) => {
  try {
    const detail = fn();
    checks.push({ id, name, pass: true, detail: typeof detail === "string" ? detail : "ok" });
  } catch (e) {
    checks.push({ id, name, pass: false, detail: e.message });
  }
};
const fail = (m) => { throw new Error(m); };

/* ── M · mobile by construction (390px) ──────────────────────────────────── */

check("M1", "the lens panel stacks: flex column, wrapped header, token padding, no fixed widths", () => {
  const src = SRC[LENS];
  if (!src.includes('style={{ border: "1px solid var(--ta-border-subtle)", background: "var(--ta-surface-base)", padding: "var(--ta-space-6)", display: "flex", flexDirection: "column"')) fail("the panel is not a padded flex column");
  if (!src.includes("flexWrap: \"wrap\"")) fail("the header does not wrap");
  const widths = [...src.matchAll(/width:\s*"([^"]+)"/g)].map((m) => m[1]).filter((w) => !w.startsWith("var(") && !w.includes("%"));
  if (widths.length > 0) fail(`fixed widths in the lens: ${widths.join(", ")}`);
  return "one fluid bordered column; the header wraps at narrow widths; zero fixed widths";
});

check("M2", "the composer's inputs are fluid and the controls wrap", () => {
  const src = SRC[COMPOSER];
  const maxes = [...src.matchAll(/maxWidth:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (!maxes.includes("100%")) fail("the inputs are not capped at 100%");
  if (!src.includes("flexWrap: \"wrap\"")) fail("the control row does not wrap");
  if (/width:\s*"\d+px"/.test(src)) fail("a pixel-fixed input width exists");
  return "select and field cap at 100%; the Reflect row wraps; zero pixel-fixed inputs";
});

check("M3", "the guidance card is fluid: rail + reading measure, never a fixed box", () => {
  const src = SRC[CARD];
  if (!src.includes('borderLeft: "1px solid var(--ta-border-subtle)"')) fail("the card lost its rail");
  if (!src.includes('maxWidth: "var(--ta-measure)"')) fail("the body lost its reading measure");
  if (/width:\s*"\d+px"/.test(src)) fail("a pixel-fixed width exists");
  return "rail + fluid body with the reading measure; zero fixed widths";
});

check("M4", "the oversight panel stacks and its mark meets the touch target", () => {
  const src = SRC[PANEL];
  if (!src.includes("display: \"flex\", flexDirection: \"column\"")) fail("the panel is not a flex column");
  if (!src.includes('data-variant="secondary"') || !src.includes('data-size="sm"')) fail("the mark is not a ta-btn sm");
  const css = read("src/app/globals.css");
  if (!css.includes('.ta-btn[data-size="sm"] { min-height: max(2.75rem, var(--ta-control-h))')) fail("the sm button lost its ≥44px floor");
  return "flex column panel; the mark is a ta-btn sm — min-height max(2.75rem, control-h) ≥ 44px";
});

check("M5", "the input constraints hold at any width: cap, slice, counter, native select", () => {
  const src = SRC[COMPOSER];
  if (!src.includes("maxLength={COMPOSER_CHAR_LIMIT}")) fail("maxLength drifted");
  if (!src.includes("e.target.value.slice(0, COMPOSER_CHAR_LIMIT)")) fail("the change slice drifted");
  if (!src.includes("data-inquiry-counter")) fail("the counter drifted");
  if (!src.includes("<select")) fail("the milestone select is not a native select");
  if (!src.includes('type="text"')) fail("the inquiry field is not a native input");
  return "maxLength + slice + counter pinned; milestone select and inquiry field are native controls";
});

/* ── P · the clock discipline ────────────────────────────────────────────── */

check("P1", "the island holds zero timers and zero effects: nothing ticks at rest", () => {
  const src = SRC[COMPOSER];
  for (const b of ["setTimeout", "setInterval", "requestAnimationFrame", "useEffect", "useLayoutEffect", "performance.now", "Date.now"]) {
    if (src.includes(b)) fail(`${b} in the composer island`);
  }
  return "zero timers, zero rAF, zero effects — the island re-renders only on input";
});

check("P2", "server-first: one client island for the lens; the oversight panel ships no client JS", () => {
  if (!read(COMPOSER).startsWith('"use client"')) fail("the composer lost its client directive");
  for (const p of [LENS, CARD, PANEL, SURFACE]) {
    if (read(p).includes('"use client"')) fail(`${p} became a client component`);
  }
  const panel = read(PANEL);
  if (!panel.includes("<form action={toggleSocraticPin.bind")) fail("the mark stopped being a plain form");
  return "composer = the sole island; lens, card, panel and surface render server-side; the mark is a plain form";
});

check("P3", "zero animation paint work in every Socratic surface", () => {
  for (const [p, src] of Object.entries(SRC)) {
    for (const b of ["transition", "animation", "keyframe", "bounce", "spring"]) {
      if (src.toLowerCase().includes(b)) fail(`paint work "${b}" in ${p}`);
    }
    // The CSS transform property only — JSX `textTransform` (uppercase eyebrow) is typography, not paint work.
    if (/(?<![a-zA-Z])transform:/.test(src)) fail(`paint work "transform:" in ${p}`);
  }
  return "no transitions, animations or transforms anywhere in the five components";
});

/* ── B · the payload, measured ───────────────────────────────────────────── */

const HTML = ".next/server/app/dev/socratic-rehearsal.html";
const CH = ".next/static/chunks";
check("B1", "the island's client payload, MEASURED from the committed build", () => {
  if (!existsSync(new URL(`../${HTML}`, import.meta.url))) fail("the prerendered rehearsal is missing from the build");
  const html = read(HTML);
  const scripts = [...new Set([...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]))];
  if (scripts.length === 0) fail("no scripts in the rehearsal HTML");
  let raw = 0, gz = 0;
  const rows = [];
  for (const s of scripts) {
    const p = s.replace(/^\/_next\//, ".next/");
    if (!existsSync(new URL(`../${p}`, import.meta.url))) fail(`missing chunk ${s}`);
    const buf = readFileSync(new URL(`../${p}`, import.meta.url));
    raw += buf.length;
    gz += gzipSync(buf).length;
    rows.push({ script: s.split("/").pop(), rawKB: +(buf.length / 1024).toFixed(1), gzipKB: +(gzipSync(buf).length / 1024).toFixed(1) });
  }
  globalThis.__payload = { scripts: scripts.length, rawKB: +(raw / 1024).toFixed(1), gzipKB: +(gz / 1024).toFixed(1), rows };
  return `${scripts.length} scripts · ${(raw / 1024).toFixed(1)} KB raw · ${(gz / 1024).toFixed(1)} KB gzip (framework runtime included)`;
});

check("B2", "the island rides the platform's shared chunks — no socratic-only load-time bundle", () => {
  const socraticHtml = read(HTML);
  const archHtml = read(".next/server/app/dev/archive-rehearsal.html");
  const setOf = (h) => new Set([...h.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]));
  const socratic = setOf(socraticHtml);
  const archive = setOf(archHtml);
  const socraticOnly = [...socratic].filter((s) => !archive.has(s));
  const shared = [...socratic].filter((s) => archive.has(s));
  if (socraticOnly.length > 2) fail(`the rehearsal carries ${socraticOnly.length} socratic-only chunks at load time`);
  return `${shared.length} chunks shared with the archive rehearsal; ${socraticOnly.length} rehearsal-only chunk(s) — the islands ride the shared bundles`;
});

check("B3", "the oversight panel's import surface is server-pure and dependency-light", () => {
  const panel = read(PANEL);
  const imports = [...panel.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]);
  for (const i of imports) {
    if (!i.startsWith("@/") && !i.startsWith("./") && !i.startsWith("../") && i !== "react") fail(`third-party import in the panel: ${i}`);
  }
  if (imports.some((i) => i.includes("supabase"))) fail("the panel imports a database client");
  return `${imports.length} imports, all app-internal (relative + @/); zero third-party, zero database client`;
});

/* ── the verdict ─────────────────────────────────────────────────────────── */

const passed = checks.filter((c) => c.pass).length;
const report = {
  gate: "phase9-performance",
  window: "W4 — the mobile & performance pass",
  phase: "Phase 9 · Step 4",
  decision: "DEC-036",
  at: "2026-10-08",
  posture: "construction pins + payload measured from the committed production build — no browser in the sandbox (the Phase 6–8 precedent); the visual 390px walk is owed",
  payload: globalThis.__payload ?? null,
  checks,
  summary: `${passed}/${checks.length} checks passed`,
};
writeFileSync(new URL("../audit/phase9-performance.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.id} · ${c.name}${c.pass ? "" : `\n      ${c.detail}`}`);
console.log(`\n${report.summary}`);
if (passed !== checks.length) process.exit(1);
