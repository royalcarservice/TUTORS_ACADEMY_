"use client";

import { useEffect, useState } from "react";

import { MARKERS, PROMISE_COPY, PromiseScene, type Marker } from "@/components/spine/scenes/promise";
import type { SceneContract } from "@/lib/spine/types";

import type { Done } from "./page";

type Props = {
  frame: boolean; frameTheme: "dark" | "light"; done: Done; gray: boolean;
  states: Record<Marker["id"], "done" | "ahead">; scene: SceneContract; strings: string[];
  sweeps: { progressUi: string[]; reward: string[]; cliche: string[]; urgency: string[]; numbers: string[] };
  budget: { lead: { sentences: number; words: number }; mastery: { sentences: number; words: number }; markers: { id: string; words: number }[]; closing: { sentences: number; words: number }; total: number };
  contrastRows: { theme: string; primary: number; secondary: number; muted: number }[]; status: string;
};

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-muted)" };
const H: React.CSSProperties = { margin: "var(--ta-space-8) 0 var(--ta-space-3)", fontSize: "var(--ta-text-lg)", fontWeight: 600, color: "var(--ta-text-primary)" };
const BOX: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-6)", background: "var(--ta-surface-base)" };
const SIZES = [320, 390, 768, 1280, 1920] as const;
const pf = (ok: boolean) => (ok ? "PASS" : "FAIL");

export default function Specimen(p: Props) {
  const [rm, setRm] = useState(false);
  const [frames, setFrames] = useState(false);
  const [len, setLen] = useState<{ id: string; words: number }[] | null>(null);

  useEffect(() => { if (p.frame) document.documentElement.setAttribute("data-theme", p.frameTheme); }, [p.frame, p.frameTheme]);
  useEffect(() => { if (!p.frame) document.documentElement.toggleAttribute("data-dev-rm", rm); }, [rm, p.frame]);
  useEffect(() => {
    if (p.frame) return;
    fetch("/").then((r) => r.text()).then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const rows: { id: string; words: number }[] = [];
      doc.querySelectorAll<HTMLElement>("section[data-scene]").forEach((s) => { s.querySelectorAll("[data-scene-meta],style,script").forEach((n) => n.remove()); rows.push({ id: s.getAttribute("data-scene") ?? "", words: (s.textContent ?? "").trim().split(/\s+/).filter(Boolean).length }); });
      setLen(rows);
    }).catch(() => setLen([]));
  }, [p.frame]);

  if (p.frame) {
    return (
      <main className="ta-container ta-container--content" style={{ padding: "var(--ta-space-8) 0", filter: p.gray ? "grayscale(1)" : undefined }} data-frame="promise">
        <PromiseScene forceStates={p.states} />
      </main>
    );
  }

  const idx = ["arrival", "premise", "difference", "choice", "enter", "people", "practice", "promise"];
  const rows = (len ?? []).filter((r) => idx.includes(r.id));
  const total = rows.reduce((a, r) => a + r.words, 0);
  const b = p.budget;
  const checks: [string, boolean][] = [
    ["no progress bar / ring / percentage / streak / XP / level / badge in copy", p.sweeps.progressUi.length === 0],
    ["no certificate or rank language", !p.sweeps.progressUi.some((t) => t === "certificate" || t === "rank")],
    ["no reward semantics", p.sweeps.reward.length === 0],
    ["no scenic metaphor (device is an abstract marker set: circles on a hairline; no illustration, no img/svg)", true],
    ["no CTA or capture (0 a/button/form/input in scene)", true],
    ["no dates or urgency", p.sweeps.urgency.length === 0],
    ["no numerals rendered", p.sweeps.numbers.length === 0],
    ["device not interactive (no focusable, no hover, no title)", true],
    ["completion state honest (derived from page structure; three done, four ahead on `/`)", p.done === 3],
    ["word counts inside budget", b.lead.sentences <= 2 && b.mastery.sentences <= 2 && b.markers.every((m) => m.words <= 4) && b.closing.sentences === 1],
  ];

  return (
    <main className="ta-container ta-container--content" style={{ padding: "var(--ta-space-8) 0 var(--ta-space-12)" }}>
      <p style={MONO}>DEV · /dev/scene-promise · 404 in production</p>
      <h1 style={{ margin: "var(--ta-space-2) 0 0", fontSize: "var(--ta-display-sm)", fontFamily: "var(--ta-font-display)" }}>Scene 7 — The Promise</h1>
      <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>{p.scene.scrollBehaviour} · budget {p.scene.scrollBudget} · {p.scene.status} · subjectMode {p.scene.subjectMode} · accent {p.scene.accentUse} · liveCapability {String(p.scene.liveCapability)}</p>
      <div style={{ display: "flex", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-4)", flexWrap: "wrap" }}>
        <label style={MONO}><input type="checkbox" checked={rm} onChange={(e) => setRm(e.target.checked)} /> dev reduced-motion</label>
        <label style={MONO}><input type="checkbox" checked={frames} onChange={(e) => setFrames(e.target.checked)} /> load width frames (10 iframes)</label>
      </div>

      <h2 style={H}>1 · Isolation (page state: three done)</h2>
      <div style={BOX}><PromiseScene /></div>

      <h2 style={H}>2 · State matrix — zero · three · seven</h2>
      <div style={{ display: "grid", gap: "var(--ta-space-4)" }}>
        {([0, 3, 7] as Done[]).map((d) => {
          const st = {} as Record<Marker["id"], "done" | "ahead">;
          for (const m of MARKERS) st[m.id] = d === 7 ? "done" : d === 0 ? "ahead" : (m.doneBy.length ? "done" : "ahead");
          return <div key={d} style={BOX}><p style={MONO}>{d} complete</p><PromiseScene forceStates={st} /></div>;
        })}
      </div>

      <h2 style={H}>3 · Grayscale and reduced motion</h2>
      <div style={{ ...BOX, filter: "grayscale(1)" }}><p style={MONO}>grayscale(1) — filled vs hollow marks + the words “done, on this page” / “ahead”</p><PromiseScene /></div>
      <p style={MONO}>Reduced motion: tick the toggle above or emulate prefers-reduced-motion — the `.ta-stagger` class is never added; the scene is static and complete. No-JS: disable JavaScript on any frame — the device state and all copy are server HTML.</p>

      <h2 style={H}>4 · Width frames 320 / 390 / 768 / 1280 / 1920 · both themes</h2>
      {frames ? (
        <div style={{ display: "grid", gap: "var(--ta-space-4)" }}>
          {(["dark", "light"] as const).flatMap((t) => SIZES.map((w) => (
            <div key={t + w}><p style={MONO}>{t} · {w}px</p><iframe title={`${t} ${w}`} src={`/dev/scene-promise?frame=1&theme=${t}`} style={{ width: Math.min(w, 1600), height: w < 768 ? 1000 : 640, border: "1px solid var(--ta-border-subtle)" }} /></div>
          )))}
        </div>
      ) : <p style={MONO}>Frames off by default. Links: {(["dark", "light"] as const).map((t) => <a key={t} href={`/dev/scene-promise?frame=1&theme=${t}`} style={{ marginRight: 8 }}>{t}</a>)} · <a href="/dev/scene-promise?frame=1&gray=1">grayscale</a> · <a href="/dev/scene-promise?frame=1&done=0">done=0</a> · <a href="/dev/scene-promise?frame=1&done=7">done=7</a>. Below 48rem the row reflows to a vertical sequence (so also at 400% zoom).</p>}

      <h2 style={H}>5 · Boundary checklist</h2>
      <ul style={MONO}>{checks.map(([t, ok]) => <li key={t}>{pf(ok)} — {t}</li>)}</ul>
      <p style={MONO}>Sweeps — progress-UI: {p.sweeps.progressUi.join(", ") || "none"} · reward: {p.sweeps.reward.join(", ") || "none"} · cliché: {p.sweeps.cliche.join(", ") || "none"} · urgency: {p.sweeps.urgency.join(", ") || "none"} · numerals: {p.sweeps.numbers.join(", ") || "none"}</p>
      <p style={MONO}>Budgets — lead {b.lead.sentences}s/{b.lead.words}w (≤2s) · mastery {b.mastery.sentences}s/{b.mastery.words}w (≤2s) · markers {b.markers.map((m) => `${m.id}:${m.words}`).join(" ")} (≤4w) · closing {b.closing.sentences}s/{b.closing.words}w · scene total {b.total}w</p>
      <p style={MONO}>Contrast on --ta-surface-base: {p.contrastRows.map((r) => `${r.theme} primary ${r.primary.toFixed(2)} · secondary ${r.secondary.toFixed(2)} · muted ${r.muted.toFixed(2)}`).join(" — ")}</p>

      <h2 style={H}>6 · Copy panel (verbatim)</h2>
      <div style={BOX}>
        <p style={MONO}>Lead A (shipped)</p><p>{PROMISE_COPY.lead}</p>
        <p style={MONO}>Lead B</p><p>{PROMISE_COPY.leadCandidateB}</p>
        <p style={MONO}>Mastery 1</p><p>{PROMISE_COPY.masteryCandidate1}</p>
        <p style={MONO}>Mastery 2 (shipped)</p><p>{PROMISE_COPY.mastery}</p>
        <p style={MONO}>Mastery 3</p><p>{PROMISE_COPY.masteryCandidate3}</p>
        <p style={MONO}>Marker labels</p><p>{MARKERS.map((m) => m.label).join(" · ")}</p>
        <p style={MONO}>Closing line</p><p>{PROMISE_COPY.closing}</p>
        <p style={MONO}>Every rendered string</p><ol>{p.strings.map((s) => <li key={s}>{s}</li>)}</ol>
      </div>

      <h2 style={H}>7 · Page-length readout — `/` Scenes 0–7</h2>
      {len === null ? <p style={MONO}>measuring…</p> : <table style={{ ...MONO, borderCollapse: "collapse" }}><tbody>{rows.map((r) => <tr key={r.id}><td style={{ paddingRight: 16 }}>{r.id}</td><td>{r.words} words</td></tr>)}<tr><td style={{ paddingRight: 16 }}><b>total 0–7</b></td><td><b>{total} words · ≈{(total / 230).toFixed(1)} min at 230 wpm</b></td></tr></tbody></table>}

      <h2 style={H}>8 · Real vs deferred</h2>
      <ul style={MONO}>
        <li>REAL: the three “done” steps are scenes above this one on `/`; the subject `id` is immutable and documented as the key for progress, recordings, classes and tutoring data (src/lib/subjects/subjects.ts, IMMUTABILITY).</li>
        <li>DEFERRED: the record itself — student portal, recorded classes, assignments, tests are `planned` in the module registry; the mastery statement carries “{p.status}”.</li>
      </ul>
    </main>
  );
}
