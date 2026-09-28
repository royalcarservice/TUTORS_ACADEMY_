"use client";

import { useEffect, useState } from "react";

import { DifferenceScene, DIFFERENCE_COPY } from "@/components/spine/scenes/difference";
import { BEATS, PREMISE_COPY, PremiseScene } from "@/components/spine/scenes/premise";
import type { SceneContract } from "@/lib/spine/types";

/* SCENE SPECIMEN (Phase 4 · Step 3). Dev-only; judge Scenes 1–2 without the page. */

const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 };
const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)", lineHeight: 1.6 };
const BTN: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 12px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const CELL: React.CSSProperties = { padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-secondary)", verticalAlign: "top", fontFamily: "var(--ta-font-mono)" };
const FRAME: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-3)", padding: "0 var(--ta-space-6)", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)" };

type Entry = { id: string; name: string; href: string; motif?: string; density?: string };
type Budget = { id: string; elements: number; domNodes: number; commands: number; ms: number };
type ContrastRow = { id: string; theme: "dark" | "light"; namePrimary: number; captionMuted: number; accentGraphic: number };

const FORBIDDEN: string[] = ["choose", "start", "enter", "begin", "select"];

export default function ScenesSpecimen({
  scenes,
  entries,
  budgets,
  ceilings,
  contrastRows,
}: {
  scenes: SceneContract[];
  entries: Entry[];
  budgets: Budget[];
  ceilings: { commands: number; dom: number; ms: number };
  contrastRows: ContrastRow[];
}) {
  const [gray, setGray] = useState(false);
  const [rm, setRm] = useState(false);
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const [boundary, setBoundary] = useState<{ label: string; pass: boolean; detail: string }[]>([]);

  useEffect(() => {
    if (rm) document.documentElement.setAttribute("data-reduced-motion", "on");
    else document.documentElement.removeAttribute("data-reduced-motion");
    return () => document.documentElement.removeAttribute("data-reduced-motion");
  }, [rm]);

  /* Live measurements against the rendered isolation frames. */
  useEffect(() => {
    const id = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(id);
    function measure() {
    const vh = window.innerHeight;
    const m: Record<string, number> = {};
    for (const s of scenes) {
      const el = document.querySelector<HTMLElement>(`[data-iso="${s.id}"]`);
      if (el) m[s.id] = Math.round((el.getBoundingClientRect().height / vh) * 100) / 100;
    }
    setMeasured(m);

    const root = document.querySelector<HTMLElement>('[data-iso="difference"]');
    if (!root) return;
    const text = (root.innerText || "").toLowerCase();
    const words: string[] = text.match(/[a-z']+/g) ?? [];
    const hits = FORBIDDEN.filter((w) => words.includes(w));
    const controls = root.querySelectorAll("a, button, input, select, textarea, [role=button], [tabindex]").length;
    const digits = /\d/.test(text);
    const focusable = root.querySelectorAll("[data-specimen] [tabindex], [data-specimen] a, [data-specimen] button").length;
    setBoundary([
      { label: "No CTA / control in Scene 2", pass: controls === 0, detail: `${controls} interactive elements` },
      { label: "No choose/start/enter/begin/select", pass: hits.length === 0, detail: hits.length ? hits.join(", ") : "none" },
      { label: "No fabricated data (no digits rendered)", pass: !digits, detail: digits ? "digits present" : "no digits in rendered text" },
      { label: "Specimens not focusable", pass: focusable === 0, detail: `${focusable} focusable inside specimens` },
    ]);
    }
  }, [scenes]);

  const totals = budgets.reduce((a, b) => ({ commands: a.commands + b.commands, dom: a.dom + b.domNodes, ms: a.ms + b.ms }), { commands: 0, dom: 0, ms: 0 });

  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-section)" }}>
      <p style={TAG}>Dev specimen · Phase 4 · Step 3</p>
      <h1 style={H1}>Scenes 1–2 — The Premise, The Difference</h1>
      <p style={NOTE}>
        REAL: both scenes as shipped on <code>/</code>, six live subject scopes resolving real tokens,
        real motif fragments (edge role, room scope), real marks. DEFERRED: nothing in these scenes —
        Scenes 3–8 remain skeletons and are not previewed here. Controls below affect this page only.
      </p>
      <div style={{ display: "flex", gap: "var(--ta-space-2)", flexWrap: "wrap" }}>
        <button type="button" style={BTN} onClick={() => setGray((g) => !g)} aria-pressed={gray}>grayscale specimens: {gray ? "on" : "off"}</button>
        <button type="button" style={BTN} onClick={() => setRm((r) => !r)} aria-pressed={rm}>reduced-motion preview: {rm ? "on" : "off"}</button>
      </div>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
        No-JS preview: disable JavaScript and reload — every frame below is server-rendered and complete
        (the reveal/stagger classes exist only after hydration).
      </p>

      {/* ISOLATION */}
      <h2 style={H2}>Scene 1 in isolation</h2>
      <div data-iso="premise" style={FRAME}><PremiseScene /></div>

      <h2 style={H2}>Scene 2 in isolation</h2>
      <div data-iso="difference" style={{ ...FRAME, filter: gray ? "grayscale(1)" : undefined }}>
        <DifferenceScene entries={entries} />
      </div>

      {/* BOTH THEMES SIDE BY SIDE */}
      <h2 style={H2}>Six specimens · both themes</h2>
      <p style={NOTE}>Same markup, two theme scopes. What should differ: accent + motif. What must not: mark, type, spacing, geometry.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "var(--ta-space-3)", filter: gray ? "grayscale(1)" : undefined }}>
        {(["dark", "light"] as const).map((theme) => (
          <div key={theme} data-theme={theme} data-theme-frame={theme} style={{ ...FRAME, padding: "0 var(--ta-space-4)" }}>
            <p style={{ ...TAG, paddingTop: "var(--ta-space-4)" }}>theme · {theme}</p>
            <DifferenceScene entries={entries} />
          </div>
        ))}
      </div>

      {/* BUDGETS */}
      <h2 style={H2}>Scroll budget · actual vs declared</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr>{["scene", "declared (vh)", "isolation frame height (vh)", "note"].map((h) => <th key={h} style={{ ...CELL, textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {scenes.map((s) => (
            <tr key={s.id}>
              <td style={CELL}>{s.id} · {s.status}</td>
              <td style={CELL}>{s.scrollBudget}</td>
              <td style={CELL}>{measured[s.id] ?? "…"}</td>
              <td style={CELL}>{measured[s.id] !== undefined && measured[s.id] > s.scrollBudget ? "OVERRUN — defect, declaration untouched" : "inside"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={H2}>Motif budget readout for `/`</h2>
      <p style={NOTE}>Six edge fragments (room scope). Ceilings are PER SURFACE ({ceilings.commands} commands · {ceilings.dom} DOM nodes · {ceilings.ms}ms); combined totals shown against six times the ceiling.</p>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr>{["subject", "elements", "path commands", "DOM nodes", "gen ms"].map((h) => <th key={h} style={{ ...CELL, textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {budgets.map((b) => (
            <tr key={b.id}><td style={CELL}>{b.id}</td><td style={CELL}>{b.elements}</td><td style={CELL}>{b.commands} / {ceilings.commands}</td><td style={CELL}>{b.domNodes} / {ceilings.dom}</td><td style={CELL}>{b.ms} / {ceilings.ms}</td></tr>
          ))}
          <tr><td style={CELL}>combined</td><td style={CELL} /><td style={CELL}>{totals.commands} / {ceilings.commands * 6}</td><td style={CELL}>{totals.dom} / {ceilings.dom * 6}</td><td style={CELL}>{Math.round(totals.ms * 100) / 100} / {ceilings.ms * 6}</td></tr>
        </tbody>
      </table>

      <h2 style={H2}>Contrast on `/` · six subjects × two themes</h2>
      <p style={NOTE}>Specimen surface is the flat card (surface-base). Name = text-primary, caption = text-muted (AA ≥ 4.5), accent rule/mark = graphic (≥ 3).</p>
      <table style={{ borderCollapse: "collapse" }}>
        <thead><tr>{["subject", "theme", "name", "caption", "accent (graphic)"].map((h) => <th key={h} style={{ ...CELL, textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {contrastRows.map((r) => (
            <tr key={r.id + r.theme}>
              <td style={CELL}>{r.id}</td><td style={CELL}>{r.theme}</td>
              <td style={CELL}>{r.namePrimary} {r.namePrimary >= 4.5 ? "✓" : "✗"}</td>
              <td style={CELL}>{r.captionMuted} {r.captionMuted >= 4.5 ? "✓" : "✗"}</td>
              <td style={CELL}>{r.accentGraphic} {r.accentGraphic >= 3 ? "✓" : "✗"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* COPY */}
      <h2 style={H2}>Copy panel · verbatim</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={CELL}>S1 eyebrow</td><td style={CELL}>{PREMISE_COPY.eyebrow}</td></tr>
          <tr><td style={CELL}>S1 heading</td><td style={CELL}>{PREMISE_COPY.heading}</td></tr>
          <tr><td style={CELL}>S1 lead · candidate A · SHIPPED (recommended)</td><td style={CELL}>{PREMISE_COPY.lead}</td></tr>
          <tr><td style={CELL}>S1 lead · candidate B · second choice</td><td style={CELL}>{PREMISE_COPY.leadCandidateB}</td></tr>
          {BEATS.map((b, i) => <tr key={b.title}><td style={CELL}>S1 beat {i + 1}</td><td style={CELL}><strong>{b.title}</strong> {b.body}</td></tr>)}
          <tr><td style={CELL}>S2 eyebrow</td><td style={CELL}>{DIFFERENCE_COPY.eyebrow}</td></tr>
          <tr><td style={CELL}>S2 heading</td><td style={CELL}>{DIFFERENCE_COPY.heading}</td></tr>
          <tr><td style={CELL}>S2 lead (what changes / what does not)</td><td style={CELL}>{DIFFERENCE_COPY.lead}</td></tr>
          <tr><td style={CELL}>S2 group label</td><td style={CELL}>{DIFFERENCE_COPY.groupLabel}</td></tr>
          <tr><td style={CELL}>S2 captions</td><td style={CELL}>{entries.map((e) => `${e.name} / ${e.motif}${DIFFERENCE_COPY.captionSuffix}`).join(" · ")}</td></tr>
          <tr><td style={CELL}>S2 constancy (the non-visual claim)</td><td style={CELL}>{DIFFERENCE_COPY.constancy}</td></tr>
          <tr><td style={CELL}>S2 narrative line → Scene 3</td><td style={CELL}>{DIFFERENCE_COPY.next}</td></tr>
        </tbody>
      </table>

      {/* BOUNDARY */}
      <h2 style={H2}>Boundary checklist · Scene 2</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          {boundary.map((b) => (
            <tr key={b.label}><td style={CELL}>{b.pass ? "PASS" : "FAIL"}</td><td style={CELL}>{b.label}</td><td style={CELL}>{b.detail}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
