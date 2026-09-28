"use client";

import { useEffect, useState } from "react";

import { PeopleScene } from "@/components/spine/scenes/people";
import { PracticeScene } from "@/components/spine/scenes/practice";
import type { ModuleEntry, StatusState } from "@/components/spine/scenes/status";
import type { SceneContract } from "@/lib/spine/types";

import type { Force } from "./page";

/* DEV-ONLY SPECIMEN BODY (Phase 4 · Step 6). Renders the two scenes in isolation
   (never the spine, never the site chrome), the status-state matrix, the
   boundary checklist, the copy panel with candidates, and a live page-length
   readout fetched from `/` (Scenes 0–6). No production code depends on this. */

type Props = {
  frame: "people" | "practice" | null;
  frameTheme: "dark" | "light";
  force: Force;
  modules: ModuleEntry[];
  registry: ModuleEntry[];
  people: SceneContract;
  practice: SceneContract;
  budget: {
    people: { leadSentences: number; lines: number; words: number };
    practice: { beats: { id: string; sentences: number; words: number }[]; consolidatedSentences: number; consolidatedWords: number; words: number };
  };
  banned: string[];
  urgencyHits: string[];
  statusLabels: Record<StatusState, string>;
  statusRules: string[];
  contrastRows: { theme: "dark" | "light"; primary: number; secondary: number; muted: number }[];
  copy: {
    people: { leadA: string; leadB: string; lines: string[] };
    practice: { leadA: string; leadB: string; beats: { id: string; label: string; shipped: string; alt: string }[]; consolidatedA: string; consolidatedB: string; outro: string };
  };
};

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-muted)" };
const H: React.CSSProperties = { margin: "var(--ta-space-8) 0 var(--ta-space-3)", fontSize: "var(--ta-text-lg)", fontWeight: 600, color: "var(--ta-text-primary)" };
const BOX: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-6)", background: "var(--ta-surface-base)" };

const FORCES: Force[] = [null, "live", "foundation", "next"];
const SIZES = [320, 390, 768, 1280] as const;

export default function Specimen(p: Props) {
  const [rm, setRm] = useState(false);
  const [frames, setFrames] = useState(false);
  const [len, setLen] = useState<{ id: string; words: number }[] | null>(null);

  useEffect(() => {
    if (!p.frame) return;
    document.documentElement.setAttribute("data-theme", p.frameTheme);
  }, [p.frame, p.frameTheme]);
  useEffect(() => {
    if (p.frame) return;
    document.documentElement.toggleAttribute("data-dev-rm", rm);
  }, [rm, p.frame]);
  useEffect(() => {
    if (p.frame) return;
    fetch("/")
      .then((r) => r.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const rows: { id: string; words: number }[] = [];
        doc.querySelectorAll<HTMLElement>("section[data-scene]").forEach((s) => {
          const id = s.getAttribute("data-scene") ?? "";
          s.querySelectorAll("[data-scene-meta],style,script").forEach((n) => n.remove());
          rows.push({ id, words: (s.textContent ?? "").trim().split(/\s+/).filter(Boolean).length });
        });
        setLen(rows);
      })
      .catch(() => setLen([]));
  }, [p.frame]);

  if (p.frame) {
    return (
      <main className="ta-container ta-container--content" style={{ padding: "var(--ta-space-12) 0" }} data-frame={p.frame}>
        {p.frame === "people" ? <PeopleScene modules={p.modules} /> : <PracticeScene modules={p.modules} />}
      </main>
    );
  }

  const sceneIdx = ["arrival", "premise", "difference", "choice", "enter", "people", "practice"];
  const lenRows = (len ?? []).filter((r) => sceneIdx.includes(r.id));
  const total = lenRows.reduce((a, r) => a + r.words, 0);

  return (
    <main className="ta-container ta-container--content" style={{ padding: "var(--ta-space-8) 0 var(--ta-space-12)" }}>
      <p style={MONO}>DEV · /dev/scenes-practice · 404 in production</p>
      <h1 style={{ margin: "var(--ta-space-2) 0 0", fontSize: "var(--ta-display-sm)", fontFamily: "var(--ta-font-display)" }}>Scenes 5 + 6 — The People · The Practice</h1>
      <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>
        people: {p.people.scrollBehaviour} · budget {p.people.scrollBudget} · {p.people.status} · accent {p.people.accentUse} — practice: {p.practice.scrollBehaviour} (the sequence claimant) · budget {p.practice.scrollBudget} · {p.practice.status} · authoredIn {p.practice.authoredIn ?? "—"}
      </p>
      <div style={{ display: "flex", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-4)", flexWrap: "wrap" }}>
        <label style={MONO}><input type="checkbox" checked={rm} onChange={(e) => setRm(e.target.checked)} /> dev reduced-motion</label>
        <label style={MONO}><input type="checkbox" checked={frames} onChange={(e) => setFrames(e.target.checked)} /> load width frames (16 iframes)</label>
      </div>

      <h2 style={H}>1 · Isolation — Scene 5 (registry states{p.force ? `, forced ${p.force}` : ""})</h2>
      <div style={BOX}><PeopleScene modules={p.modules} /></div>
      <h2 style={H}>2 · Isolation — Scene 6</h2>
      <div style={BOX}><PracticeScene modules={p.modules} /></div>

      <h2 style={H}>3 · Status vocabulary (three states, extends 3.6)</h2>
      <table style={{ ...MONO, borderCollapse: "collapse", width: "100%" }}>
        <thead><tr><th align="left">state</th><th align="left">label</th><th align="left">registry source</th><th align="left">used since</th></tr></thead>
        <tbody>
          <tr><td>live</td><td><span data-status data-state="live" style={{ fontFamily: "var(--ta-font-mono)" }}>{p.statusLabels.live}</span></td><td>module status <code>live</code></td><td>4.1 skeleton</td></tr>
          <tr><td>foundation</td><td>{p.statusLabels.foundation}</td><td>module status <code>in-progress</code> · subject <code>draft</code></td><td>3.6 nav · 4.4 Scene 3 · 4.5 Scene 4</td></tr>
          <tr><td>next</td><td>{p.statusLabels.next}</td><td>module status <code>planned</code></td><td>4.1 skeleton · 3.6 shell (“not built”)</td></tr>
        </tbody>
      </table>
      <ul style={{ ...MONO, marginTop: "var(--ta-space-3)" }}>{p.statusRules.map((r) => <li key={r}>{r}</li>)}</ul>
      <p style={MONO}>Registry today: {p.registry.map((m) => `${m.id}=${m.status}`).join(" · ")}</p>

      <h2 style={H}>4 · Status-state matrix (both themes × three states)</h2>
      <p style={MONO}>Contrast of the treatment text on --ta-surface-base: {p.contrastRows.map((r) => `${r.theme}: primary ${r.primary.toFixed(2)} · secondary ${r.secondary.toFixed(2)} · muted ${r.muted.toFixed(2)}`).join(" — ")} (labels use secondary/primary; never muted, never smaller than the copy they describe).</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-3)" }}>
        {(["dark", "light"] as const).flatMap((t) => FORCES.filter(Boolean).map((f) => (
          <div key={`${t}-${f}`} data-theme={t} style={{ ...BOX, background: "var(--ta-surface-base)", color: "var(--ta-text-primary)" }}>
            <p style={MONO}>{t} · {f}</p>
            <p style={{ margin: "var(--ta-space-2) 0 0", fontSize: "var(--ta-text-lg)", color: "var(--ta-text-secondary)" }}>The class happens live, in the same room.</p>
            <p style={{ margin: "var(--ta-space-2) 0 0" }}><span data-status data-state={f!} style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: f === "live" ? "var(--ta-text-primary)" : "var(--ta-text-secondary)", boxShadow: `inset 0 -1px 0 var(${f === "live" ? "--ta-text-primary" : "--ta-border-strong"})`, paddingBottom: 2 }}>{p.statusLabels[f!]}</span></p>
          </div>
        )))}
      </div>

      <h2 style={H}>5 · Width frames · both themes · RM · forced states</h2>
      {frames ? (
        <div style={{ display: "grid", gap: "var(--ta-space-4)" }}>
          {(["people", "practice"] as const).flatMap((sc) => (["dark", "light"] as const).flatMap((t) => SIZES.map((w) => (
            <div key={`${sc}-${t}-${w}`}>
              <p style={MONO}>{sc} · {t} · {w}px{p.force ? ` · ${p.force}` : ""}</p>
              <iframe title={`${sc} ${t} ${w}`} src={`/dev/scenes-practice?frame=${sc}&theme=${t}${p.force ? `&state=${p.force}` : ""}`} style={{ width: w, height: sc === "practice" ? 1100 : 560, border: "1px solid var(--ta-border-subtle)", background: "transparent" }} />
            </div>
          ))))}
        </div>
      ) : (
        <p style={MONO}>Frames are off by default (the 4.5 lesson: many live iframes degrade frame health). Direct links: {(["people", "practice"] as const).flatMap((sc) => (["dark", "light"] as const).map((t) => <a key={sc + t} href={`/dev/scenes-practice?frame=${sc}&theme=${t}`} style={{ marginRight: 8 }}>{sc}/{t}</a>))} · forced: {FORCES.filter(Boolean).map((f) => <a key={f} href={`/dev/scenes-practice?state=${f}`} style={{ marginRight: 8 }}>{f}</a>)}</p>
      )}
      <p style={MONO}>No-JS rendering: open any frame with JavaScript disabled — every beat and the consolidated statement are server HTML; `.ta-reveal` is added only after hydration. Reduced motion: the class is never added.</p>

      <h2 style={H}>6 · Boundary checklist</h2>
      <ul style={MONO}>
        <li>No people imagery, names, avatars, bios, credentials, subject lists, availability — Scene 5 renders no &lt;img&gt;, no list, no card.</li>
        <li>No roster / grid: Scene 5 is heading + lead + two lines + one status; Scene 6 is one &lt;ol&gt; thread with alternating offsets, not a grid.</li>
        <li>No simulated interface: no player, recording list, chat, browser, chart, ring, streak, calendar, tutor card, meeting or notification UI, toolbar or panel.</li>
        <li>No CTA / button / button-styled link / capture: neither scene renders &lt;a&gt;, &lt;button&gt;, &lt;form&gt; or &lt;input&gt;.</li>
        <li>No dates, quarters, “coming soon”, countdowns, waitlists, urgency — sweep hits: {p.urgencyHits.length ? p.urgencyHits.join(", ") : "none"}. Banned-phrase hits: {p.banned.length ? p.banned.join(", ") : "none"}.</li>
        <li>4 beats present without JS: server HTML, ordered list, reveal is enhancement only.</li>
        <li>Word counts — Scene 5: lead {p.budget.people.leadSentences} sentence(s) (≤2) · {p.budget.people.lines} lines (≤3) · {p.budget.people.words} words total. Scene 6: beats {p.budget.practice.beats.map((b) => `${b.id} ${b.sentences}s/${b.words}w`).join(", ")} (each ≤2 sentences) · consolidated {p.budget.practice.consolidatedSentences}s/{p.budget.practice.consolidatedWords}w · {p.budget.practice.words} words total.</li>
      </ul>

      <h2 style={H}>7 · Copy panel — candidates</h2>
      <div style={BOX}>
        <p style={MONO}>Scene 5 lead A (shipped)</p><p>{p.copy.people.leadA}</p>
        <p style={MONO}>Scene 5 lead B</p><p>{p.copy.people.leadB}</p>
        <p style={MONO}>Scene 5 lines</p><ul>{p.copy.people.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        <p style={MONO}>Scene 6 lead A (shipped)</p><p>{p.copy.practice.leadA}</p>
        <p style={MONO}>Scene 6 lead B</p><p>{p.copy.practice.leadB}</p>
        {p.copy.practice.beats.map((b) => (
          <div key={b.id}><p style={MONO}>Beat {b.id} — {b.label}</p><p>A (shipped, more specific): {b.shipped}</p><p>B: {b.alt}</p></div>
        ))}
        <p style={MONO}>Consolidated A (shipped; list derived from registry)</p><p>{p.copy.practice.consolidatedA}</p>
        <p style={MONO}>Consolidated B</p><p>{p.copy.practice.consolidatedB}</p>
        <p style={MONO}>Outro (narrative, not a CTA)</p><p>{p.copy.practice.outro}</p>
      </div>

      <h2 style={H}>8 · Page-length readout — `/` Scenes 0–6 (fetched server HTML)</h2>
      {len === null ? <p style={MONO}>measuring…</p> : (
        <table style={{ ...MONO, borderCollapse: "collapse" }}>
          <tbody>
            {lenRows.map((r) => <tr key={r.id}><td style={{ paddingRight: 16 }}>{r.id}</td><td>{r.words} words</td></tr>)}
            <tr><td style={{ paddingRight: 16 }}><b>total 0–6</b></td><td><b>{total} words · ≈{(total / 230).toFixed(1)} min at 230 wpm</b></td></tr>
          </tbody>
        </table>
      )}

      <h2 style={H}>9 · Real vs deferred</h2>
      <ul style={MONO}>
        <li>REAL: six environments and their five levers (accent, atmosphere, motif, motion character, density) exist in config and render; the switch is live; status states are derived from the module registry.</li>
        <li>DEFERRED (registry: planned): tutor portal, live classroom, recorded classes, assignments, tests, AI assistant, student portal. Every beat that depends on them says so, in its own words, with no date.</li>
      </ul>
    </main>
  );
}
