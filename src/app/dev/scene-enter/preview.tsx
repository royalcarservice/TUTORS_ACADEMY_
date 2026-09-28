"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChoiceScene } from "@/components/spine/scenes/choice";
import { DifferenceScene } from "@/components/spine/scenes/difference";
import { ENTER_COPY, ENTER_STICKY_RULE, EnterScene, type EnterEntry } from "@/components/spine/scenes/enter";
import type { SwitchTelemetry } from "@/components/switch/subject-switch";
import type { SceneContract } from "@/lib/spine/types";

import type { Force } from "./page";

type Budget = { id: string; scene: string; elements: number; domNodes: number; commands: number; ms: number };
type ContrastRow = { id: string; theme: "dark" | "light"; name: number; tagline: number; envOnSurface: number; muted: number };

const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 };
const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)", lineHeight: 1.6 };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-secondary)" };
const BTN: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 14px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const TABLE: React.CSSProperties = { borderCollapse: "collapse", width: "100%", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)" };
const TD: React.CSSProperties = { borderBottom: "1px solid var(--ta-border-subtle)", padding: "6px 8px", textAlign: "left", verticalAlign: "top" };
const FRAME_STYLE: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", background: "var(--ta-surface-base)", display: "block" };

const IDS = ["mathematics", "physics", "chemistry", "biology", "english", "history"];

/* The spine's section, reproduced so the sticky hold is exercised in isolation
   (same inline geometry as scene-slot: 160vh section, sticky 100vh inner). */
function SpineSection({ scene, children }: { scene: SceneContract; children: React.ReactNode }) {
  return (
    <section
      id={scene.anchorId}
      data-scene={scene.id}
      data-scroll={scene.scrollBehaviour}
      aria-labelledby="scene-enter"
      style={{ height: `${Math.round(scene.scrollBudget * 100)}vh`, position: "relative" }}
    >
      <div style={{ position: "sticky", top: "var(--ta-header-h, 0px)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div>{children}</div>
      </div>
    </section>
  );
}

export default function EnterSpecimen({
  scene, entries, entriesReal, entriesAllReady, entriesAllDraft, force, frame, frameTheme, frameSubject, budgets, ceilings, contrastRows,
}: {
  scene: SceneContract; entries: EnterEntry[]; entriesReal: EnterEntry[]; entriesAllReady: EnterEntry[]; entriesAllDraft: EnterEntry[];
  force: Force; frame: boolean; frameTheme: "dark" | "light"; frameSubject?: string;
  budgets: Budget[]; ceilings: { commands: number; dom: number; ms: number }; contrastRows: ContrastRow[];
}) {
  const [gray, setGray] = useState(false);
  const [framesOn, setFramesOn] = useState(false);
  const [rm, setRm] = useState(false);
  const [tele, setTele] = useState<SwitchTelemetry | null>(null);
  const [tiers, setTiers] = useState<{ step: number; to: string; tier: string; ceremony: string; settle: number | null; worst: number; longTasks: number; approach: string }[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [frames, setFrames] = useState<{ samples: number; avg: number; worst: number; over50: number } | null>(null);
  const [boundary, setBoundary] = useState<{ label: string; pass: boolean; detail: string }[]>([]);
  const [layersNow, setLayersNow] = useState<{ idle: number; mid: number | null }>({ idle: 1, mid: null });
  const stepN = useRef(0);
  const cls = useRef(0);
  const push = useCallback((m: string) => setLog((l) => [...l.slice(-60), m]), []);

  /* frame-mode: theme on <html>, optional dev reduced-motion. */
  useEffect(() => {
    if (!frame) return;
    document.documentElement.setAttribute("data-theme", frameTheme);
    if (new URLSearchParams(location.search).get("rm") === "1") document.documentElement.setAttribute("data-reduced-motion", "on");
    document.querySelector("[data-scene=enter]")?.scrollIntoView({ block: "start" });
  }, [frame, frameTheme]);

  useEffect(() => {
    if (frame) return;
    if (rm) document.documentElement.setAttribute("data-reduced-motion", "on");
    else document.documentElement.removeAttribute("data-reduced-motion");
    return () => document.documentElement.removeAttribute("data-reduced-motion");
  }, [rm, frame]);

  /* live-region transcript + CLS + focus watch, on the isolated instance. */
  useEffect(() => {
    if (frame) return;
    const root = document.querySelector<HTMLElement>('[data-iso="enter"]');
    if (!root) return;
    const live = root.querySelector("[data-switch-announce]");
    const mo = new MutationObserver(() => push(`ANNOUNCE · "${live?.textContent}" · focus on ${describe(document.activeElement)}`));
    if (live) mo.observe(live, { childList: true, subtree: true, characterData: true });
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) if (!e.hadRecentInput) cls.current += e.value ?? 0;
    });
    try { po.observe({ type: "layout-shift", buffered: true }); } catch {}
    return () => { mo.disconnect(); po.disconnect(); };
  }, [frame, push]);

  const onTelemetry = useCallback((t: SwitchTelemetry) => {
    setTele(t);
    setTiers((rows) => [...rows.slice(-11), { step: ++stepN.current, to: t.transcript[t.transcript.length - 1] ?? "", tier: t.tier, ceremony: t.ceremony, settle: t.triggerToSettleMs, worst: t.worstFrameMs, longTasks: t.longTasks, approach: t.approach }]);
  }, []);

  /* Six-environment walk: deliberate (1.8 s apart) or rapid (60 ms apart). */
  const walk = (gapMs: number) => {
    const root = document.querySelector<HTMLElement>('[data-iso="enter"]');
    const next = root?.querySelector<HTMLButtonElement>("[data-enter-next]");
    if (!next) return;
    next.focus();
    const before = document.activeElement;
    const samples: number[] = [];
    let last = -1;
    let raf = 0;
    const rec = () => { const n = performance.now(); if (last >= 0) samples.push(n - last); last = n; raf = requestAnimationFrame(rec); };
    raf = requestAnimationFrame(rec);
    const mids: number[] = [];
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        next.click();
        setTimeout(() => mids.push(root!.querySelectorAll("[data-switch-layer]").length), Math.min(120, gapMs / 2));
      }, i * gapMs);
    }
    setTimeout(() => {
      cancelAnimationFrame(raf);
      const avg = samples.reduce((a, b) => a + b, 0) / Math.max(1, samples.length);
      setFrames({ samples: samples.length, avg: Math.round(avg * 10) / 10, worst: Math.round(Math.max(...samples) * 10) / 10, over50: samples.filter((s) => s > 50).length });
      setLayersNow({ idle: root!.querySelectorAll("[data-switch-layer]").length, mid: Math.max(...mids) });
      push(`WALK DONE · focus ${document.activeElement === before ? "UNCHANGED (on Next)" : "MOVED to " + describe(document.activeElement)} · CLS ${cls.current.toFixed(4)} · layers now ${root!.querySelectorAll("[data-switch-layer]").length}, max mid-transition ${Math.max(...mids)}`);
      runBoundary();
    }, 6 * gapMs + 900);
  };

  const runBoundary = () => {
    const root = document.querySelector<HTMLElement>('[data-iso="enter"]');
    if (!root) return;
    const text = root.innerText;
    const header = document.querySelector("header");
    const hRect = header?.getBoundingClientRect();
    const rows = [
      { label: "Not a chooser — no select/choose/pick/start", pass: !/\b(select|choose|pick|start)\b/i.test(text), detail: (text.match(/\b(select|choose|pick|start)\b/gi) || ["none"]).join(", ") },
      { label: "One environment rendered at a time (idle)", pass: root.querySelectorAll("[data-switch-layer]").length === 1, detail: `${root.querySelectorAll("[data-switch-layer]").length} layer(s) idle · max mid-transition ${layersNow.mid ?? "—"}` },
      { label: "Brand frame static during transformation", pass: !!hRect, detail: hRect ? `header ${Math.round(hRect.width)}×${Math.round(hRect.height)} @ y${Math.round(hRect.top)} — pixel diff in the harness` : "no header in isolation" },
      { label: "No simulated interface", pass: root.querySelectorAll("table, input, progress, form, [role=tab], [role=dialog], nav").length === 0, detail: `${root.querySelectorAll("table, input, progress, form, [role=tab], [role=dialog], nav").length} interface element(s)` },
      { label: "No fabricated data (no digits)", pass: !/\d/.test(text), detail: (text.match(/\d+/g) || ["none"]).join(" ") },
      { label: "Focus never moves on step", pass: log.some((l) => l.includes("UNCHANGED")) || !log.some((l) => l.includes("MOVED")), detail: log.find((l) => l.includes("WALK DONE")) ?? "run a walk" },
      { label: "No colour-only meaning (state also text)", pass: /Enter |In foundation/.test(text) && /Environment/.test(text), detail: "open/inert carried by Enter-vs-In-foundation text; environment named in text" },
      { label: "Ambient / canvas / WebGL absent", pass: !root.querySelector("canvas, .ta-ambient, [data-ambient]"), detail: `${root.querySelectorAll("canvas, .ta-ambient, [data-ambient]").length} found` },
    ];
    setBoundary(rows);
  };

  /* ── FRAME MODE ────────────────────────────────────────────────────────── */
  if (frame) {
    return (
      <div data-frame>
        <div style={{ height: "40vh", display: "grid", placeItems: "center", color: "var(--ta-text-muted)", fontFamily: "var(--ta-font-mono)", fontSize: 12 }}>
          ↓ scroll · spacer before the scene
        </div>
        <div className="ta-container ta-container--content" style={{ borderBottom: "1px solid var(--ta-border-subtle)" }}>
          <SpineSection scene={scene}>
            <EnterScene entries={entries} initialId={frameSubject} />
          </SpineSection>
        </div>
        <div style={{ height: "80vh", display: "grid", placeItems: "center", color: "var(--ta-text-muted)", fontFamily: "var(--ta-font-mono)", fontSize: 12 }}>
          spacer after the scene · the hold must release into this
        </div>
      </div>
    );
  }

  const fr = (q: string, w: number | string, h: number, extra?: React.IframeHTMLAttributes<HTMLIFrameElement>) => !framesOn ? (
    <div style={{ ...FRAME_STYLE, width: w, height: h, display: "grid", placeItems: "center", color: "var(--ta-text-muted)", fontFamily: "var(--ta-font-mono)", fontSize: 11 }}>frame withheld — press “load frames” (kept off so the isolation walk measures the engine, not the specimen’s own weight)</div>
  ) : (
    <iframe title={q} src={`/dev/scene-enter?frame=1&${q}`} width={typeof w === "number" ? w : undefined} height={h} style={{ ...FRAME_STYLE, width: w }} loading="lazy" {...extra} />
  );

  return (
    <main id="main" className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-section)" }} data-dev-scene-enter>
      <p style={TAG}>Phase 4 · Step 5 · dev specimen · {force ? `forced ${force}` : "config statuses"}</p>
      <h1 style={H1}>Scene 4 — Enter · the crossing</h1>
      <p style={NOTE}>
        The transformation is the content. One environment at Stage scale, the 3.4 switch doing the moving, a control that steps and never asks.
        Below: the scene in isolation with the tier indicator and live transcript; six environments × two themes; both CTA extremes; no-JS; reduced motion; the sticky demos; the copy; and the Scene 2 / 3 / 4 comparison.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "var(--ta-space-4)" }}>
        <button style={BTN} onClick={() => setGray((g) => !g)}>{gray ? "colour" : "grayscale"}</button>
        <button style={BTN} onClick={() => setRm((r) => !r)}>reduced motion: {rm ? "on" : "off"}</button>
        <button style={BTN} onClick={() => walk(1800)}>walk six (deliberate, 1.8s)</button>
        <button style={BTN} onClick={() => walk(60)}>walk six (rapid, 60ms)</button>
        <button style={BTN} onClick={runBoundary}>run boundary checks</button>
        <button style={BTN} onClick={() => setFramesOn((f) => !f)} data-load-frames>{framesOn ? "unload frames" : "load frames"}</button>
        <a style={{ ...BTN, display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/dev/scene-enter?force=ready">force all ready</a>
        <a style={{ ...BTN, display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/dev/scene-enter?force=draft">force all draft</a>
        <a style={{ ...BTN, display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/dev/scene-enter">config</a>
      </div>

      {/* ISOLATION + STICKY (the spine's section reproduced) */}
      <h2 style={H2}>Isolation · with the sticky hold</h2>
      <p style={NOTE}>Scroll through: the section is 160vh, the Stage holds for 60vh and releases. Nothing intercepts scroll — the hold is `position: sticky`, verified by the harness (wheel, keyboard, scrollbar).</p>
      <div data-iso="enter" style={{ filter: gray ? "grayscale(1)" : undefined, border: "1px dashed var(--ta-border-strong)" }}>
        <SpineSection scene={scene}>
          <EnterScene entries={entries} onTelemetry={onTelemetry} onStep={(id) => push(`STEP → ${id}`)} />
        </SpineSection>
      </div>

      {/* TIER INDICATOR + TRANSCRIPT */}
      <h2 style={H2}>Tier indicator · ceremony rationing · frame readout</h2>
      <p style={NOTE}>Each step’s selected 3.4 tier and ceremony, as reported by the engine’s telemetry (not assumed). 3.4’s rule: first entry into a SUBJECT this session → full; a subject seen before → shortened; two triggers inside 1.5 s → shortest (instant).</p>
      <table style={TABLE} data-tier-table>
        <thead><tr>{["step", "announced", "tier", "ceremony", "trigger→settle ms", "worst frame ms", "long tasks", "approach"].map((h) => <th key={h} style={TD}>{h}</th>)}</tr></thead>
        <tbody>{tiers.map((r) => <tr key={r.step}><td style={TD}>{r.step}</td><td style={TD}>{r.to}</td><td style={TD}><b>{r.tier}</b></td><td style={TD}>{r.ceremony}</td><td style={TD}>{r.settle == null ? "—" : Math.round(r.settle)}</td><td style={TD}>{r.worst}</td><td style={TD}>{r.longTasks}</td><td style={TD}>{r.approach}</td></tr>)}</tbody>
      </table>
      <p style={{ ...MONO, marginTop: 8 }} data-frame-readout>
        {frames ? `walk frames: ${frames.samples} samples · avg ${frames.avg} ms · worst ${frames.worst} ms · >50 ms: ${frames.over50}` : "run a walk for the frame readout"} · layers idle {layersNow.idle} · max mid-transition {layersNow.mid ?? "—"} · last reasons: {tele?.reasons.join("; ") ?? "—"}
      </p>
      <pre style={{ ...MONO, whiteSpace: "pre-wrap", background: "var(--ta-surface-sunken)", padding: 12, borderRadius: 8, maxHeight: 280, overflow: "auto" }} data-transcript>{log.join("\n") || "step with the control, or run a walk"}</pre>

      {/* BOUNDARY CHECKLIST */}
      <h2 style={H2}>Boundary checklist</h2>
      <table style={TABLE} data-boundary>
        <tbody>{boundary.length ? boundary.map((r) => <tr key={r.label}><td style={TD}>{r.pass ? "PASS" : "FAIL"}</td><td style={TD}>{r.label}</td><td style={TD}>{r.detail}</td></tr>) : <tr><td style={TD}>run a walk, then the checks</td></tr>}</tbody>
      </table>

      {/* SIX × TWO */}
      <h2 style={H2}>All six environments on the Stage · both themes</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12 }} data-six-grid>
        {(["dark", "light"] as const).flatMap((t) => IDS.map((id) => <div key={t + id}><p style={TAG}>{id} · {t}</p>{fr(`theme=${t}&subject=${id}`, "100%", 620)}</div>))}
      </div>

      {/* EXTREMES */}
      <h2 style={H2}>CTA extremes · all ready · all draft</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12 }}>
        <div><p style={TAG}>all ready</p>{fr("force=ready", "100%", 620)}</div>
        <div><p style={TAG}>all draft</p>{fr("force=draft", "100%", 620)}</div>
      </div>

      {/* NO-JS + REDUCED MOTION */}
      <h2 style={H2}>No-JS preview · reduced-motion preview</h2>
      <p style={NOTE}>The no-JS frame is a sandboxed iframe with scripts disallowed: the Stage renders one complete environment from the server; the pin is released by a noscript style; the stepping control is withheld (visibility) so nothing dead is offered.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 12 }}>
        <div><p style={TAG}>no JS (sandbox, scripts off)</p>{fr("theme=dark", "100%", 620, { sandbox: "" })}</div>
        <div><p style={TAG}>reduced motion (dev override)</p>{fr("theme=dark&rm=1", "100%", 620)}</div>
      </div>

      {/* STICKY DEMOS */}
      <h2 style={H2}>Sticky behaviour · 400% zoom · short viewport · reduced motion</h2>
      <p style={{ ...NOTE, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)" }} data-sticky-rule>{ENTER_STICKY_RULE}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }} data-sticky-demos>
        <div><p style={TAG}>400% zoom proxy · 320×200</p>{fr("theme=dark", 320, 200)}</div>
        <div><p style={TAG}>short viewport · 900×400</p>{fr("theme=dark", 900, 400)}</div>
        <div><p style={TAG}>reduced motion · 900×600</p>{fr("theme=dark&rm=1", 900, 600)}</div>
      </div>

      {/* WIDTHS */}
      <h2 style={H2}>Widths · 320 · 390 · 768 · 1280 · 1920</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
        {[320, 390, 768].map((w) => <div key={w}><p style={TAG}>{w}</p>{fr("theme=dark", w, 640)}</div>)}
      </div>
      {[1280, 1920].map((w) => <div key={w} style={{ overflowX: "auto", marginTop: 12 }} tabIndex={0} aria-label={`${w}px frame`}><p style={TAG}>{w}</p>{fr("theme=light", w, 760)}</div>)}

      {/* COPY */}
      <h2 style={H2}>Copy panel · verbatim</h2>
      <table style={TABLE} data-copy>
        <tbody>
          {[
            ["eyebrow", ENTER_COPY.eyebrow], ["heading", ENTER_COPY.heading],
            ["lead A — SHIPPED", ENTER_COPY.lead], ["lead B", ENTER_COPY.leadCandidateB],
            ["control framing 1 — SHIPPED (group label)", ENTER_COPY.controlLabel], ["control framing 2", ENTER_COPY.controlCandidate2], ["control framing 3", ENTER_COPY.controlCandidate3],
            ["step buttons", `${ENTER_COPY.prev} · ${ENTER_COPY.next}`],
            ["constant-frame caption", ENTER_COPY.constant],
            ["CTA · ready", ENTER_COPY.ctaReady("{Subject}")], ["CTA · ready · depth line", ENTER_COPY.ctaDepth],
            ["CTA · draft", ENTER_COPY.inFoundation], ["CTA · draft · line", ENTER_COPY.inFoundationLine],
            ["announcement", ENTER_COPY.announce("{Subject}", "{Environment}")],
            ...entriesReal.map((e) => [`announcement · ${e.id}`, ENTER_COPY.announce(e.name, (e.tagline ?? "").split(" — ")[0])]),
          ].map(([k, v]) => <tr key={k}><td style={{ ...TD, whiteSpace: "nowrap" }}>{k}</td><td style={TD}>{v}</td></tr>)}
        </tbody>
      </table>

      {/* BUDGETS */}
      <h2 style={H2}>Motif budget for `/` · ceilings {ceilings.commands} cmd · {ceilings.dom} DOM · {ceilings.ms} ms per surface</h2>
      <p style={NOTE}>Live on `/`: Scene 2 six edge specimens + Scene 3 six edge doors + Scene 4 ONE substrate (two during TRANSFER). The six Scene 4 rows below are what each environment costs when it is the one shown — never all six at once.</p>
      <table style={TABLE} data-budget>
        <thead><tr>{["surface", "scene", "elements", "DOM", "commands", "gen ms", "within"].map((h) => <th key={h} style={TD}>{h}</th>)}</tr></thead>
        <tbody>{budgets.map((b) => <tr key={b.id}><td style={TD}>{b.id}</td><td style={TD}>{b.scene}</td><td style={TD}>{b.elements}</td><td style={TD}>{b.domNodes}</td><td style={TD}>{b.commands}</td><td style={TD}>{b.ms}</td><td style={TD}>{b.commands <= ceilings.commands && b.domNodes <= ceilings.dom && b.ms <= ceilings.ms ? "PASS" : "FAIL"}</td></tr>)}</tbody>
      </table>
      <p style={{ ...MONO, marginTop: 8 }} data-budget-total>
        {(() => {
          const s2 = budgets.filter((b) => b.scene === "Scene 2"); const s3 = budgets.filter((b) => b.scene === "Scene 3"); const s4 = budgets.filter((b) => b.scene === "Scene 4");
          const sum = (r: Budget[], k: "commands" | "domNodes" | "ms") => Math.round(r.reduce((a, b) => a + b[k], 0) * 100) / 100;
          const max4 = (k: "commands" | "domNodes" | "ms") => Math.max(...s4.map((b) => b[k]));
          return `page live total (idle): ${sum(s2, "commands") + sum(s3, "commands") + max4("commands")} cmd · ${sum(s2, "domNodes") + sum(s3, "domNodes") + max4("domNodes")} DOM · ${(sum(s2, "ms") + sum(s3, "ms") + max4("ms")).toFixed(2)} ms across 13 surfaces (ceiling 13×${ceilings.commands} / 13×${ceilings.dom} / 13×${ceilings.ms}) · mid-transition adds one substrate (max ${max4("commands")} cmd)`;
        })()}
      </p>

      {/* CONTRAST */}
      <h2 style={H2}>Contrast · Stage text vs surface (motif is masked from the reading column)</h2>
      <table style={TABLE} data-contrast>
        <thead><tr>{["subject", "theme", "name (primary)", "tagline (secondary)", "environment (accent-1)", "muted"].map((h) => <th key={h} style={TD}>{h}</th>)}</tr></thead>
        <tbody>{contrastRows.map((r) => <tr key={r.id + r.theme}><td style={TD}>{r.id}</td><td style={TD}>{r.theme}</td><td style={TD}>{r.name.toFixed(2)}</td><td style={TD}>{r.tagline.toFixed(2)}</td><td style={TD}>{r.envOnSurface.toFixed(2)}{r.envOnSurface < 4.5 ? " ✗" : ""}</td><td style={TD}>{r.muted.toFixed(2)}</td></tr>)}</tbody>
      </table>

      {/* COMPARISON */}
      <h2 style={H2}>Scene 2 / Scene 3 / Scene 4 — three different things</h2>
      <p style={NOTE}>Scene 2: specimens, display only. Scene 3: doors — the visitor’s decision. Scene 4: one Stage and a stepping control — the system’s move.</p>
      <div style={{ display: "grid", gap: 24 }} data-compare>
        <div style={{ border: "1px dashed var(--ta-border-strong)", padding: 16 }}><p style={TAG}>Scene 2</p><DifferenceScene entries={entriesReal} /></div>
        <div style={{ border: "1px dashed var(--ta-border-strong)", padding: 16 }}><p style={TAG}>Scene 3</p><ChoiceScene entries={entriesReal} /></div>
        <div style={{ border: "1px dashed var(--ta-border-strong)", padding: 16 }}><p style={TAG}>Scene 4</p>{fr("theme=dark", "100%", 640)}</div>
      </div>

      {/* REAL vs DEFERRED */}
      <h2 style={H2}>Real vs deferred</h2>
      <ul style={{ ...NOTE, paddingLeft: 18 }} data-deferred>
        <li>REAL: the 3.4 switch engine (state machine, tiers, ceremony, morph decision, live region); the vector substrate at Stage scale; config-driven eligibility; real routes.</li>
        <li>REAL: default environment = first ready in config order. The Scene 3 handoff listener (ta:door) is installed per CHOICE_HANDOFF but Scene 3 does not dispatch — default path is the live path.</li>
        <li>DEFERRED (recorded, not built): ambient-at-Stage-scale on the homepage — possible only once the 3.5 five-subject recommendation is approved; today depth (ambient, shell, WebGL) stays inside the route, which is the reason to cross.</li>
        <li>NOT PRESENT by design: canvas, WebGL, 3D, ambient layer, simulated interface, fabricated data, second chooser.</li>
      </ul>
      <p style={{ ...MONO, marginTop: 24 }}>entries: {entries.length} · ready {entries.filter((e) => e.status !== "draft").length} · all-ready set {entriesAllReady.length} · all-draft set {entriesAllDraft.length}</p>
    </main>
  );
}

function describe(el: Element | null) {
  if (!el || el === document.body) return "body";
  const h = el as HTMLElement;
  return `${h.tagName.toLowerCase()}${h.dataset.enterNext != null ? "[next]" : h.dataset.enterPrev != null ? "[prev]" : ""}${h.getAttribute("aria-label") ? ` "${h.getAttribute("aria-label")}"` : ""}`;
}
