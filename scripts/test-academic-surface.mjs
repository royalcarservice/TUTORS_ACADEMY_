#!/usr/bin/env node
// Academic surface tests (Phase 7 · Step 4, DEC-025). Pure — no browser, no canvas, no network.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-academic-surface.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const SS = await import("@/lib/livekit/surface-sync");
const {
  initialSurfaceState, validatePacket, applyPacket, hitTest,
  encodePacket, decodePacket, createMemoryBus,
} = SS;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const file = (p) => strip(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

const stroke = (over = {}) => ({
  type: "stroke",
  stroke: { id: "s-1", tool: "ink", points: [{ x: 0.1, y: 0.2 }, { x: 0.3, y: 0.4 }], color: "ivory", width: 2, ...over },
});

/* ── 1 · the protocol ─────────────────────────────────────────────────────── */
t("purity — surface-sync reads no clock, env, db or network", () => {
  assert.doesNotMatch(file("src/lib/livekit/surface-sync.ts"), /Date\.now\(|process\.env|supabase|fetch\(|localStorage|sessionStorage|WebSocket|XMLHttpRequest/);
});
t("packet shape — the brief's fields, exactly", () => {
  const v = validatePacket(stroke());
  assert.equal(v.ok, true);
  assert.deepEqual(Object.keys(v.packet.stroke).sort(), ["color", "id", "points", "tool", "width"]);
});
t("validation — malformed packets are named defects, never thrown", () => {
  for (const bad of [
    null, "x", [],
    { type: "stroke" },
    stroke({ id: "" }),
    stroke({ tool: "spray" }),
    stroke({ points: [] }),
    stroke({ points: [{ x: NaN, y: 0.5 }] }),
    stroke({ points: [{ x: 5, y: 0.5 }] }),
    stroke({ color: "#ff0000" }),
    stroke({ width: 0 }),
    stroke({ width: 49 }),
    { type: "spray", id: "x" },
    { type: "remove" },
    { type: "remove", id: "r-1" },
    { type: "clear" },
  ]) {
    const v = validatePacket(bad);
    assert.equal(v.ok, false, JSON.stringify(bad));
    assert.ok(v.defect.length > 0);
  }
});
t("validation — points are clamped into the surface, colour stays an id", () => {
  const v = validatePacket(stroke({ points: [{ x: -0.0005, y: 1.0004 }] }));
  assert.equal(v.ok, true);
  assert.deepEqual(v.packet.stroke.points, [{ x: 0, y: 1 }]);
  const json = encodePacket(v.packet);
  assert.doesNotMatch(json, /#[0-9a-f]{3,8}/i, "no hex ever crosses the wire");
});
t("reducer — idempotent by id; optimistic echoes land nothing twice", () => {
  const s0 = initialSurfaceState();
  const s1 = applyPacket(s0, stroke().stroke ? validatePacket(stroke()).packet : stroke());
  const s2 = applyPacket(s1, validatePacket(stroke()).packet);   // the echo
  assert.equal(s2.strokes.length, 1);
  assert.equal(s2, s1, "a duplicate changes nothing — same state back");
});
t("reducer — removal and reset, each idempotent under its own operation id", () => {
  let s = initialSurfaceState();
  s = applyPacket(s, validatePacket(stroke()).packet);
  const rm = { type: "remove", id: "op-1", target: "s-1" };
  s = applyPacket(s, rm);
  assert.equal(s.strokes.length, 0);
  assert.equal(applyPacket(s, rm), s, "a replayed removal is a no-op");
  s = applyPacket(s, validatePacket(stroke({ id: "s-2" })).packet);
  const cl = { type: "clear", id: "op-2" };
  s = applyPacket(s, cl);
  assert.equal(s.strokes.length, 0);
  assert.equal(applyPacket(s, cl), s, "a replayed clear is a no-op");
  s = applyPacket(s, validatePacket(stroke({ id: "s-3" })).packet);
  assert.equal(s.strokes.length, 1, "a stroke after the clear stands");
});
t("reducer — deterministic: the same packets, the same answer, twice", () => {
  const seq = [
    validatePacket(stroke({ id: "a" })).packet,
    validatePacket(stroke({ id: "b", tool: "line", color: "accent", width: 3.5 })).packet,
    { type: "remove", id: "op-a", target: "a" },
  ];
  const run = () => seq.reduce((st, p) => applyPacket(st, p), initialSurfaceState());
  const r1 = run(), r2 = run();
  assert.deepEqual(r1.strokes, r2.strokes);
  assert.deepEqual(r1.strokes.map((s) => s.id), ["b"]);
});
t("eraser — the geometry is pure and exact enough", () => {
  const s = applyPacket(initialSurfaceState(), validatePacket(stroke({ id: "s-1", points: [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }] })).packet);
  assert.deepEqual(hitTest(s, { x: 0.5, y: 0.21 }, 0.02), ["s-1"], "midpoint of the segment");
  assert.deepEqual(hitTest(s, { x: 0.5, y: 0.5 }, 0.02), [], "nowhere near");
  const dot = applyPacket(initialSurfaceState(), validatePacket(stroke({ id: "s-2", points: [{ x: 0.5, y: 0.5 }] })).packet);
  assert.deepEqual(hitTest(dot, { x: 0.505, y: 0.5 }, 0.02), ["s-2"], "a single-point stroke");
});
t("serialization — encode/decode round-trips through plain JSON", () => {
  const p = validatePacket(stroke()).packet;
  const back = decodePacket(encodePacket(p));
  assert.equal(back.ok, true);
  assert.deepEqual(back.packet, p);
  assert.equal(decodePacket("{not json").ok, false);
});
t("memory bus — the brief's in-memory broadcast: total delivery, sender included", () => {
  const bus = createMemoryBus();
  const seen = [];
  const offA = bus.subscribe((p) => seen.push(["a", p.id]));
  const offB = bus.subscribe((p) => seen.push(["b", p.id]));
  bus.send({ type: "clear", id: "op-x" });
  assert.deepEqual(seen, [["a", "op-x"], ["b", "op-x"]]);
  offA();
  bus.send({ type: "clear", id: "op-y" });
  assert.deepEqual(seen.slice(2), [["b", "op-y"]]);
  offB();
});

/* ── 2 · the palette ──────────────────────────────────────────────────────── */
t("palette — the four tools, the two ink widths, the three colours, nothing else", () => {
  const src = rawFile("src/components/live/surface-palette.tsx");
  for (const label of ["Ink", "Line", "Eraser", "Reset", "fine", "medium", "Ivory", "Slate", "Accent"]) {
    assert.ok(src.includes(label), `missing: ${label}`);
  }
  assert.match(src, /var\(--ta-ivory-200\)/);
  assert.match(src, /var\(--ta-slate-300\)/);
  assert.match(src, /var\(--ta-accent-1\)/);
  assert.equal((strip(src).match(/aria-pressed=/g) ?? []).length >= 3, true);
});
t("palette — architectural dignity: no stickers, stamps, emoji, reactions", () => {
  const src = rawFile("src/components/live/surface-palette.tsx");
  assert.doesNotMatch(strip(src), /sticker|stamp|star\b|thumbs|reaction|confetti|sparkle/i);
  assert.doesNotMatch(src, EMOJI);
});

/* ── 3 · the surface ──────────────────────────────────────────────────────── */
t("surface — client island, high-DPI, no library, no transport", () => {
  const raw = rawFile("src/components/live/academic-surface.tsx");
  assert.match(raw, /"use client"/);
  const src = strip(raw);
  assert.match(src, /devicePixelRatio/);
  /* Declared pin update (DEC-031): the fluid renderer moved to the shared
     stroke-render module so the live surface and the archive replay draw
     from ONE implementation — the quadratic smoothing is pinned there, and
     the surface is pinned to import it (never a second vocabulary). */
  assert.match(src, /from "@\/lib\/livekit\/stroke-render"/, "the surface draws through the shared renderer");
  assert.match(strip(rawFile("src/lib/livekit/stroke-render.ts")), /quadraticCurveTo/, "fluid stroke rendering lives in the shared renderer");
  assert.match(src, /e\.pressure/, "pen pressure, where a device reports it");
  assert.doesNotMatch(src, /from "(?!react|@\/)/, "imports only react and the repo's own modules");
  assert.doesNotMatch(src, /fetch\(|WebSocket|RTCPeerConnection|livekit-client|axios/i);
  assert.doesNotMatch(src, /setTimeout|setInterval|spinner/i);
  assert.doesNotMatch(raw, EMOJI);
});
t("surface — the substrate is the subject's OWN motif, inherited, not invented", () => {
  const src = strip(rawFile("src/components/live/academic-surface.tsx"));
  assert.match(src, /import \{ Motif \} from "@\/components\/motif\/motif"/);
  assert.match(src, /<Motif subject=\{subjectId\} kind=\{motif\} role="substrate"/);
});
t("surface — strokes are normalized; packets carry no pixel truth", () => {
  const src = strip(rawFile("src/components/live/academic-surface.tsx"));
  assert.match(src, /Math\.min\(1, Math\.max\(0, \(e\.clientX - rect\.left\) \/ rect\.width\)\)/);
});
t("surface — sync is optimistic: act applies locally, the bus carries the packet", () => {
  /* Declared pin update (DEC-028): Step 6 threads an OPTIONAL session bus
     through useSurfaceSync(bus). Absent, the hook keeps its private memory
     bus, so rehearsal/local behaviour is unchanged; present, strokes ride the
     room's shared channel. The optimistic invariants below are untouched. */
  const src = strip(rawFile("src/components/live/academic-surface.tsx"));
  assert.match(src, /useSurfaceSync\(bus\)/, "the bus is threaded through");
  assert.match(src, /bus\?: SurfaceBus;/, "the bus stays OPTIONAL (local default preserved)");
  assert.match(src, /act\(\{[\s\S]*?type: "stroke"/);
  assert.match(src, /act\(\{ type: "clear"/);
  assert.match(src, /type: "remove"/);
});

/* ── 4 · the room composition ─────────────────────────────────────────────── */
t("layout — desktop split pane, small-screen toggle, observed live", () => {
  const src = strip(rawFile("src/components/live/room-layout.tsx"));
  assert.match(src, /min-width: 900px/);
  assert.match(src, /matchMedia\(SPLIT_QUERY\)/);
  assert.match(src, /addEventListener\?\.\("change"/);
  assert.match(src, /data-room-layout="split"/);
  assert.match(src, /data-room-layout="panes"/);
  assert.equal((src.match(/aria-pressed=/g) ?? []).length >= 1, true);
});
t("integration — the production room composes chamber + surface inside the gate", () => {
  /* Declared pin update (DEC-026): Milestone 2 wraps the room composition in
     the LiveChamber shell; the exact RoomLayout/AcademicSurface props are
     pinned against live-chamber.tsx in test-classroom. The gate shape is
     unchanged: the surface mounts ONLY when the room is open.
     Declared pin update (DEC-028): Step 6 adds the OPTIONAL session bus to
     the surface composition; the subject/motif/density facts are unchanged. */
  const src = rawFile("src/app/subjects/[subject]/live/page.tsx");
  assert.match(src, /roomOpen && session \? \(\s*<LiveChamber/);
  const shell = rawFile("src/components/live/live-chamber.tsx");
  assert.match(shell, /surface=\{\s*<AcademicSurface\s+subjectId=\{subject\.id\}\s+motif=\{subject\.motif\}\s+density=\{density\}\s+bus=\{live \? session\.bus : undefined\}\s*\/>\s*\}/, "surface props pinned in the chamber shell");
});
t("integration — the rehearsal composes the same room, named as rehearsal", () => {
  const src = rawFile("src/app/dev/live-stage/page.tsx");
  assert.match(src, /<RoomLayout/);
  assert.match(src, /<AcademicSurface subjectId=\{subjectId\} motif=\{motif\}/);
  assert.match(src, /rehearsal/);
});

/* ── 5 · the vocabulary sweep ─────────────────────────────────────────────── */
t("copy — no exclamation marks, no toy vocabulary in the new surfaces", () => {
  for (const p of [
    "src/components/live/surface-palette.tsx",
    "src/components/live/academic-surface.tsx",
    "src/components/live/room-layout.tsx",
    "src/lib/livekit/surface-sync.ts",
  ]) {
    const src = strip(rawFile(p));
    const rendered = [...src.matchAll(/"([^"]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2]).join(" ");
    assert.doesNotMatch(rendered, /!/, `${p}: exclamation mark`);
    assert.doesNotMatch(rendered, /\bfun\b|awesome|sticky note|whiteboard toy/i, `${p}: toy vocabulary`);
  }
});

console.log(`\n${n - failed}/${n} passed`);
process.exit(failed ? 1 : 0);
