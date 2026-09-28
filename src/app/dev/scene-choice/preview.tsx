"use client";

import { useEffect, useRef, useState } from "react";

import { ChoiceScene, CHOICE_COPY, CHOICE_HANDOFF, availabilityLine, environmentName, type DoorEntry } from "@/components/spine/scenes/choice";
import { DifferenceScene } from "@/components/spine/scenes/difference";
import type { SceneContract } from "@/lib/spine/types";

/* SCENE 3 SPECIMEN (Phase 4 · Step 4). Dev-only; judge the threshold without the page. */

const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 };
const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)", lineHeight: 1.6 };
const BTN: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 12px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const CELL: React.CSSProperties = { padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-secondary)", verticalAlign: "top", fontFamily: "var(--ta-font-mono)" };
const FRAME: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-3)", padding: "0 var(--ta-space-6)", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)" };

type Budget = { id: string; elements: number; domNodes: number; commands: number; ms: number };
type ContrastRow = { id: string; theme: "dark" | "light"; name: number; tagline: number; envOnSurface: number; status: number };
const WIDTHS = [320, 390, 768, 1280, 1920];

export default function ChoiceSpecimen({
  scene, entries, entriesReal, entriesAllReady, specimenEntries, allReady, frame, frameTheme, budgets, ceilings, contrastRows,
}: {
  scene: SceneContract; entries: DoorEntry[]; entriesReal: DoorEntry[]; entriesAllReady: DoorEntry[]; specimenEntries: DoorEntry[];
  allReady: boolean; frame: boolean; frameTheme: "dark" | "light";
  budgets: Budget[]; ceilings: { commands: number; dom: number; ms: number }; contrastRows: ContrastRow[];
}) {
  const [gray, setGray] = useState(false);
  const [rm, setRm] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [measured, setMeasured] = useState<{ vh?: number; boundary: { label: string; pass: boolean; detail: string }[] }>({ boundary: [] });
  const cls = useRef(0);

  useEffect(() => {
    if (rm) document.documentElement.setAttribute("data-reduced-motion", "on");
    else document.documentElement.removeAttribute("data-reduced-motion");
    return () => document.documentElement.removeAttribute("data-reduced-motion");
  }, [rm]);

  /* FOCUS WALKTHROUGH PANEL: focus events, CLS, live-region mutations. */
  useEffect(() => {
    if (frame) return;
    const root = document.querySelector<HTMLElement>('[data-iso="choice"]');
    if (!root) return;
    const push = (m: string) => setLog((l) => [...l.slice(-40), m]);
    const onFocus = (ev: FocusEvent) => {
      const a = ev.target as HTMLElement;
      if (!a.matches?.("[data-door]")) return;
      const cs = getComputedStyle(a);
      push(`focus → ${a.getAttribute("aria-label")} · outline ${cs.outlineStyle} ${cs.outlineWidth} · transform ${cs.transform === "none" ? "none" : "lift"} · CLS so far ${cls.current.toFixed(4)}`);
    };
    root.addEventListener("focusin", onFocus);
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { hadRecentInput?: boolean; value?: number })[]) if (!e.hadRecentInput) cls.current += e.value ?? 0;
    });
    try { po.observe({ type: "layout-shift", buffered: true }); } catch {}
    const live = [...document.querySelectorAll('[aria-live], [role="status"], [role="alert"], output')];
    const mo = new MutationObserver((muts) => { for (const m of muts) push(`LIVE REGION MUTATION: ${(m.target as HTMLElement).nodeName} "${(m.target.textContent || "").slice(0, 40)}"`); });
    for (const l of live) mo.observe(l, { childList: true, characterData: true, subtree: true });
    push(`live regions present on page: ${live.length}${live.length ? " (" + live.map((l) => l.nodeName + "." + (l.getAttribute("role") || l.getAttribute("aria-live"))).join(", ") + ")" : ""}`);

    const raf = requestAnimationFrame(() => {
      const doors = [...root.querySelectorAll<HTMLElement>("[data-door]")];
      const links = doors.filter((d) => d.tagName === "A");
      const inert = doors.filter((d) => d.tagName !== "A");
      const sizes = new Set(doors.map((d) => `${Math.round(d.getBoundingClientRect().width)}×${Math.round(d.getBoundingClientRect().height)}`));
      const text = (root.innerText || "").toLowerCase();
      const badWords = ["popular", "recommended", "featured", "most chosen", "coming soon", "waitlist", "start learning", "get started", "enrol", "journey"].filter((w) => text.includes(w));
      const dialogs = root.querySelectorAll('dialog, [role="dialog"], [aria-haspopup], [aria-expanded]').length;
      const hoverOnly = [...root.querySelectorAll<HTMLElement>("[data-door] *")].filter((el) => getComputedStyle(el).opacity === "0" || getComputedStyle(el).visibility === "hidden").length;
      const inertFocusable = inert.filter((d) => d.tabIndex >= 0 || d.querySelector("a,button,[tabindex]")).length;
      const drafts = entries.filter((e) => e.status === "draft").map((e) => e.id);
      const draftLinked = links.filter((l) => drafts.includes(l.dataset.door!)).length;
      setMeasured({
        vh: Math.round((root.getBoundingClientRect().height / window.innerHeight) * 100) / 100,
        boundary: [
          { label: "No preview takeover (no page-level state on hover/focus)", pass: root.querySelectorAll("[data-preview],[data-takeover]").length === 0, detail: "hover/focus styles scoped to a[data-door] only" },
          { label: "No two-step entry (no dialog/popup/expanded)", pass: dialogs === 0, detail: `${dialogs} dialog/popup attrs` },
          { label: "No hover-only affordance (nothing hidden until hover)", pass: hoverOnly === 0, detail: `${hoverOnly} hidden descendants` },
          { label: "No featured / popular / recommended / urgency language", pass: badWords.length === 0, detail: badWords.join(", ") || "none" },
          { label: "Equal weight (all six rows same rendered size)", pass: sizes.size === 1, detail: [...sizes].join(" / ") },
          { label: "All six present and reachable in page flow", pass: doors.length === 6, detail: `${doors.length} doors, ${links.length} links, ${inert.length} inert` },
          { label: "Drafts excluded from links (config-driven)", pass: draftLinked === 0, detail: `drafts: ${drafts.join(", ") || "none"}; linked drafts: ${draftLinked}` },
          { label: "Inert items not focusable", pass: inertFocusable === 0, detail: `${inertFocusable} focusable inert items` },
          { label: "No colour-only meaning (name + environment + status as text)", pass: doors.every((d) => d.querySelector("[data-door-name]")?.textContent && d.querySelector("[data-door-env]")?.textContent), detail: "text carried per door" },
          { label: "Exactly one action per door (link IS the action)", pass: root.querySelectorAll("[data-door] a, [data-door] button").length === 0, detail: "no nested controls" },
        ],
      });
    });
    return () => { root.removeEventListener("focusin", onFocus); po.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); };
  }, [frame, entries]);

  if (frame) {
    return (
      <div data-theme={frameTheme} style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100vh" }}>
        <div className="ta-container ta-container--content"><ChoiceScene entries={entries} /></div>
      </div>
    );
  }

  const totals = budgets.reduce((a, b) => ({ commands: a.commands + b.commands, dom: a.dom + b.domNodes, ms: a.ms + b.ms }), { commands: 0, dom: 0, ms: 0 });
  const qs = (t: string) => `/dev/scene-choice?frame=1&theme=${t}${allReady ? "&allReady=1" : ""}`;

  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-section)" }}>
      <p style={TAG}>Dev specimen · Phase 4 · Step 4</p>
      <h1 style={H1}>Scene 3 — The Choice</h1>
      <p style={NOTE}>
        REAL: the scene as shipped on <code>/</code>; six live subject scopes; real links to the real routes; availability read from
        the 3.1 config (today: {availabilityLine(entriesReal)}). DEFERRED: Scene 4 (the crossing) — the handoff contract below is
        documented, not implemented. Controls affect this page only.
      </p>
      <div style={{ display: "flex", gap: "var(--ta-space-2)", flexWrap: "wrap" }}>
        <button type="button" style={BTN} onClick={() => setGray((g) => !g)} aria-pressed={gray}>grayscale: {gray ? "on" : "off"}</button>
        <button type="button" style={BTN} onClick={() => setRm((r) => !r)} aria-pressed={rm}>reduced-motion preview: {rm ? "on" : "off"}</button>
        <a style={{ ...BTN, display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={allReady ? "/dev/scene-choice" : "/dev/scene-choice?allReady=1"}>
          availability: {allReady ? "FORCED all-ready (dev) — click for real config" : "real config — click to force all-ready"}
        </a>
      </div>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>No-JS preview: disable JavaScript and reload — the scene below is server-rendered; every open door is a plain link.</p>

      <h2 style={H2}>Scene 3 in isolation {allReady ? "· all six forced ready" : "· real availability"}</h2>
      <div data-iso="choice" style={{ ...FRAME, filter: gray ? "grayscale(1)" : undefined }}><ChoiceScene entries={entries} /></div>

      <h2 style={H2}>Both extremes</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "var(--ta-space-3)", filter: gray ? "grayscale(1)" : undefined }}>
        <div style={FRAME}><p style={{ ...TAG, paddingTop: "var(--ta-space-4)" }}>one ready (today)</p><ChoiceScene entries={entriesReal} /></div>
        <div style={FRAME}><p style={{ ...TAG, paddingTop: "var(--ta-space-4)" }}>six ready (forced)</p><ChoiceScene entries={entriesAllReady} /></div>
      </div>

      <h2 style={H2}>Both themes</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "var(--ta-space-3)", filter: gray ? "grayscale(1)" : undefined }}>
        {(["dark", "light"] as const).map((t) => (
          <div key={t} data-theme={t} style={FRAME}><p style={{ ...TAG, paddingTop: "var(--ta-space-4)" }}>theme · {t}</p><ChoiceScene entries={entries} /></div>
        ))}
      </div>

      <h2 style={H2}>Widths · both themes</h2>
      <p style={NOTE}>Each frame is the bare scene rendered at that viewport width (iframes of this route in frame mode).</p>
      {WIDTHS.map((w) => (
        <div key={w} style={{ marginBottom: "var(--ta-space-4)" }}>
          <p style={TAG}>{w}px</p>
          <div tabIndex={0} aria-label={`Scene 3 at ${w}px, both themes`} style={{ display: "flex", gap: "var(--ta-space-3)", overflowX: "auto", paddingBottom: "var(--ta-space-2)" }}>
            {(["dark", "light"] as const).map((t) => (
              <iframe key={t} title={`Scene 3 at ${w}px · ${t}`} src={qs(t)} width={w} height={w < 768 ? 900 : 760} style={{ border: "1px solid var(--ta-border-subtle)", flex: "0 0 auto", background: "transparent", filter: gray ? "grayscale(1)" : undefined }} />
            ))}
          </div>
        </div>
      ))}

      <h2 style={H2}>Scene 2 vs Scene 3 · side by side</h2>
      <p style={NOTE}>Left: the specimen sheet (evidence, display-only). Right: the threshold (action). Plates vs rows; captions vs an action label; nothing focusable vs real links.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))", gap: "var(--ta-space-3)" }}>
        <div style={FRAME}><DifferenceScene entries={specimenEntries} /></div>
        <div style={FRAME}><ChoiceScene entries={entries} /></div>
      </div>

      <h2 style={H2}>Focus walkthrough</h2>
      <p style={NOTE}>Tab through the isolation frame above. Each door logs focus visibility, whether it lifted, cumulative CLS, and any live-region mutation.</p>
      <pre style={{ ...CELL, whiteSpace: "pre-wrap", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-3)", maxHeight: 280, overflow: "auto" }}>{log.join("\n") || "(no focus events yet)"}</pre>

      <h2 style={H2}>Boundary checklist</h2>
      <table style={{ borderCollapse: "collapse" }}><tbody>
        {measured.boundary.map((b) => <tr key={b.label}><td style={CELL}>{b.pass ? "PASS" : "FAIL"}</td><td style={CELL}>{b.label}</td><td style={CELL}>{b.detail}</td></tr>)}
      </tbody></table>

      <h2 style={H2}>Scroll budget</h2>
      <table style={{ borderCollapse: "collapse" }}><tbody>
        <tr><td style={CELL}>{scene.id} · {scene.status} · {scene.scrollBehaviour}</td><td style={CELL}>declared {scene.scrollBudget} vh</td><td style={CELL}>isolation frame {measured.vh ?? "…"} vh</td><td style={CELL}>{measured.vh !== undefined && measured.vh > scene.scrollBudget ? "OVERRUN — defect, declaration untouched" : "inside"}</td></tr>
      </tbody></table>

      <h2 style={H2}>Motif budget · `/` · Scenes 2 + 3</h2>
      <p style={NOTE}>Twelve edge fragments (room scope). Ceilings are PER SURFACE ({ceilings.commands} · {ceilings.dom} · {ceilings.ms}ms).</p>
      <table style={{ borderCollapse: "collapse" }}><tbody>
        {budgets.map((b) => <tr key={b.id}><td style={CELL}>{b.id}</td><td style={CELL}>{b.commands} / {ceilings.commands}</td><td style={CELL}>{b.domNodes} / {ceilings.dom}</td><td style={CELL}>{b.ms} / {ceilings.ms}</td></tr>)}
        <tr><td style={CELL}>combined (12)</td><td style={CELL}>{totals.commands} / {ceilings.commands * 12}</td><td style={CELL}>{totals.dom} / {ceilings.dom * 12}</td><td style={CELL}>{Math.round(totals.ms * 100) / 100} / {ceilings.ms * 12}</td></tr>
      </tbody></table>

      <h2 style={H2}>Contrast · six × two themes</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr>{["subject", "theme", "name", "tagline", "environment label (accent)", "status"].map((h) => <th key={h} style={{ ...CELL, textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>{contrastRows.map((r) => <tr key={r.id + r.theme}><td style={CELL}>{r.id}</td><td style={CELL}>{r.theme}</td><td style={CELL}>{r.name}</td><td style={CELL}>{r.tagline}</td><td style={CELL}>{r.envOnSurface} {r.envOnSurface >= 4.5 ? "✓" : "✗"}</td><td style={CELL}>{r.status}</td></tr>)}</tbody>
      </table>

      <h2 style={H2}>Copy panel · verbatim</h2>
      <table style={{ borderCollapse: "collapse" }}><tbody>
        <tr><td style={CELL}>eyebrow</td><td style={CELL}>{CHOICE_COPY.eyebrow}</td></tr>
        <tr><td style={CELL}>heading</td><td style={CELL}>{CHOICE_COPY.heading}</td></tr>
        <tr><td style={CELL}>lead · A · SHIPPED</td><td style={CELL}>{CHOICE_COPY.lead}</td></tr>
        <tr><td style={CELL}>lead · B</td><td style={CELL}>{CHOICE_COPY.leadCandidateB}</td></tr>
        <tr><td style={CELL}>availability (derived)</td><td style={CELL}>{availabilityLine(entries)}</td></tr>
        <tr><td style={CELL}>action · 1 · SHIPPED</td><td style={CELL}>{CHOICE_COPY.action}</td></tr>
        <tr><td style={CELL}>action · 2</td><td style={CELL}>{CHOICE_COPY.actionCandidate2}</td></tr>
        <tr><td style={CELL}>action · 3</td><td style={CELL}>{CHOICE_COPY.actionCandidate3}</td></tr>
        <tr><td style={CELL}>inert status</td><td style={CELL}>{CHOICE_COPY.inFoundation}</td></tr>
        {entries.map((e) => <tr key={e.id}><td style={CELL}>door · {e.id}</td><td style={CELL}>{e.name} — {environmentName(e.tagline)} · “{e.tagline}” · {e.status}</td></tr>)}
        <tr><td style={CELL}>narrative → Scene 4</td><td style={CELL}>{CHOICE_COPY.next}</td></tr>
      </tbody></table>

      <h2 style={H2}>Handoff contract → Scene 4</h2>
      <table style={{ borderCollapse: "collapse" }}><tbody>
        <tr><td style={CELL}>what</td><td style={CELL}>{CHOICE_HANDOFF.what}</td></tr>
        <tr><td style={CELL}>how</td><td style={CELL}>{CHOICE_HANDOFF.how}</td></tr>
        <tr><td style={CELL}>not shared</td><td style={CELL}>{CHOICE_HANDOFF.notShared}</td></tr>
      </tbody></table>
    </main>
  );
}
