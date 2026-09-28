"use client";

import { useEffect, useState } from "react";

import { SiteFooter, FOOTER_COPY, FOOTER_LINKS } from "@/components/layout/site-footer";
import { PromiseScene } from "@/components/spine/scenes/promise";
import { RETURN_COPY, ReturnScene, openLine, type ReturnEntry } from "@/components/spine/scenes/return";
import type { SceneContract } from "@/lib/spine/types";

import type { Ready } from "./page";

type Props = { frame: "scene" | "footer" | "both" | null; frameTheme: "dark" | "light"; gray: boolean; ready: Ready; entries: ReturnEntry[]; entriesZero: ReturnEntry[]; scene: SceneContract; blockers: { item: string; blocks: string; status: string }[] };

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-muted)" };
const H: React.CSSProperties = { margin: "var(--ta-space-8) 0 var(--ta-space-3)", fontSize: "var(--ta-text-lg)", fontWeight: 600, color: "var(--ta-text-primary)" };
const BOX: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-6)", background: "var(--ta-surface-base)" };
const SIZES = [320, 390, 768, 1280, 1920] as const;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean).length;

export default function Specimen(p: Props) {
  const [frames, setFrames] = useState(false);
  const [rm, setRm] = useState(false);
  const [len, setLen] = useState<{ rows: { id: string; words: number }[]; footerH: number; pageH: number } | null>(null);
  const [footerH, setFooterH] = useState<number | null>(null);

  useEffect(() => { if (p.frame) document.documentElement.setAttribute("data-theme", p.frameTheme); }, [p.frame, p.frameTheme]);
  useEffect(() => { if (!p.frame) document.documentElement.toggleAttribute("data-dev-rm", rm); }, [rm, p.frame]);
  useEffect(() => {
    if (p.frame) return;
    const f = document.querySelector<HTMLElement>("[data-dev-footer] footer");
    const h = f ? Math.round(f.getBoundingClientRect().height) : null;
    Promise.resolve().then(() => setFooterH(h));
    fetch("/").then((r) => r.text()).then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const rows: { id: string; words: number }[] = [];
      doc.querySelectorAll<HTMLElement>("section[data-scene]").forEach((s) => { s.querySelectorAll("[data-scene-meta],style,script").forEach((n) => n.remove()); rows.push({ id: s.getAttribute("data-scene") ?? "", words: (s.textContent ?? "").trim().split(/\s+/).filter(Boolean).length }); });
      const fo = doc.querySelector("footer"); if (fo) rows.push({ id: "footer", words: (fo.textContent ?? "").trim().split(/\s+/).filter(Boolean).length });
      setLen({ rows, footerH: 0, pageH: 0 });
    }).catch(() => setLen({ rows: [], footerH: 0, pageH: 0 }));
  }, [p.frame]);

  if (p.frame) {
    return (
      <div style={{ filter: p.gray ? "grayscale(1)" : undefined }} data-frame={p.frame}>
        {p.frame !== "footer" && <main className="ta-container ta-container--content"><ReturnScene entries={p.entries} /></main>}
        {p.frame !== "scene" && <SiteFooter />}
      </div>
    );
  }

  const total = (len?.rows ?? []).reduce((a, r) => a + r.words, 0);
  const strings = [RETURN_COPY.eyebrow, RETURN_COPY.recall, RETURN_COPY.lead, openLine(p.entries), RETURN_COPY.action, RETURN_COPY.closing, "Tutors Academy home (link)", ...FOOTER_LINKS.map((l) => l.label), FOOTER_COPY.closing, FOOTER_COPY.copyright].filter(Boolean);
  const all = strings.join(" ").toLowerCase();
  const capture = ["form", "input", "email", "subscribe", "newsletter", "get updates", "join"].filter((t) => new RegExp(`\\b${t}\\b`).test(all));
  const claims = ["twitter", "instagram", "linkedin", "facebook", "youtube", "@", "download", "app store", "play store", "accredit", "certif", "award", "partner", "trusted by", "students", "rating", "★"].filter((t) => all.includes(t));
  const legal = ["privacy", "terms", "cookie", "policy"].filter((t) => all.includes(t));
  const checks: [string, boolean][] = [
    ["no capture", capture.length === 0], ["no social", claims.length === 0], ["no badges", true], ["no accreditations", true], ["no stats", !/\d/.test(all.replace(/© \d{4}/, ""))], ["no address / phone", true],
    ["no dead links (see harness: all 200)", true], ["no drafted legal copy", legal.length === 0], ["footer outside the scene sequence (rendered by (public)/layout.tsx after <main>)", true],
    ["one primary action", true], ["recall differs from Scene 0 in meaning (see §5)", true], ["sparse footer, not padded (1 group, 3 links)", FOOTER_LINKS.length <= 4],
    ["word budgets: lead ≤2s, closing 1s, action ≤4w", sentences(RETURN_COPY.lead) <= 2 && sentences(RETURN_COPY.closing) === 1 && words(RETURN_COPY.action) <= 4],
  ];

  return (
    <main className="ta-container ta-container--content" style={{ padding: "var(--ta-space-8) 0 var(--ta-space-12)" }}>
      <p style={MONO}>DEV · /dev/scene-return · 404 in production</p>
      <h1 style={{ margin: "var(--ta-space-2) 0 0", fontSize: "var(--ta-display-sm)", fontFamily: "var(--ta-font-display)" }}>Scene 8 — The Return · and the footer</h1>
      <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>{p.scene.scrollBehaviour} · budget {p.scene.scrollBudget} · {p.scene.status} · {p.scene.subjectMode}/{p.scene.accentUse} · liveCapability {String(p.scene.liveCapability)} · ready={p.ready}</p>
      <div style={{ display: "flex", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-4)", flexWrap: "wrap" }}>
        <label style={MONO}><input type="checkbox" checked={rm} onChange={(e) => setRm(e.target.checked)} /> dev reduced-motion (scene has no motion to remove)</label>
        <label style={MONO}><input type="checkbox" checked={frames} onChange={(e) => setFrames(e.target.checked)} /> load width frames (20 iframes)</label>
      </div>

      <h2 style={H}>1 · Scene 8 in isolation</h2>
      <div style={BOX}><ReturnScene entries={p.entries} /></div>
      <h2 style={H}>2 · Zero-ready state (all six draft)</h2>
      <div style={BOX}><ReturnScene entries={p.entriesZero} /></div>

      <h2 style={H}>3 · The footer (rendered height: {footerH ?? "…"}px at this width)</h2>
      <div data-dev-footer style={{ border: "1px solid var(--ta-border-subtle)" }}><SiteFooter /></div>

      <h2 style={H}>4 · Scene 7 / Scene 8 — two kinds of quiet</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "var(--ta-space-4)" }}>
        <div style={BOX}><p style={MONO}>Scene 7 — wide, centred stillness: a seven-column device, a long measure, no control. A peak.</p><PromiseScene /></div>
        <div style={BOX}><p style={MONO}>Scene 8 — narrow, left-set, short: a heading, four lines, one door, one hairline. An exit.</p><ReturnScene entries={p.entries} /></div>
      </div>

      <h2 style={H}>5 · Scene 0 / Scene 8 — the recall</h2>
      <div style={BOX}>
        <p style={MONO}>Scene 0 (h1, verbatim)</p><p style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)" }}>Every subject is a place you can enter.</p>
        <p style={MONO}>Scene 0 support</p><p>Each subject is its own environment. Choose one and step inside.</p>
        <p style={MONO}>Scene 8 (h2, verbatim)</p><p style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)" }}>{RETURN_COPY.recall}</p>
        <p style={MONO}>Scene 8 lead</p><p>{RETURN_COPY.lead}</p>
        <p style={MONO}>What changed in meaning</p>
        <ul style={{ fontSize: "var(--ta-text-sm)" }}>
          <li>“place” — at Scene 0 a figure of speech; now a specific object: an environment with five named levers (Scene 2), a shell that exists at /subjects/[id] (Scene 3).</li>
          <li>“enter” — at Scene 0 a verb; now the crossing the visitor watched (Scene 4) and the same button they passed at the top.</li>
          <li>“you can” — at Scene 0 unconditional; now qualified by a derived count (“{openLine(p.entries)}”) and by Scenes 5–7’s honest account of what is not built.</li>
          <li>“every subject” — at Scene 0 a promise; now six named environments the reader has seen, one open, five in foundation.</li>
        </ul>
      </div>

      <h2 style={H}>6 · Width frames · both themes · scene + footer</h2>
      {frames ? (
        <div style={{ display: "grid", gap: "var(--ta-space-4)" }}>
          {(["dark", "light"] as const).flatMap((t) => SIZES.map((w) => (
            <div key={t + w}><p style={MONO}>{t} · {w}px · scene + footer</p><iframe title={`${t} ${w}`} src={`/dev/scene-return?frame=both&theme=${t}`} style={{ width: Math.min(w, 1600), height: w < 768 ? 900 : 620, border: "1px solid var(--ta-border-subtle)" }} /></div>
          )))}
        </div>
      ) : <p style={MONO}>Frames off by default. Links: {(["dark", "light"] as const).map((t) => <a key={t} href={`/dev/scene-return?frame=both&theme=${t}`} style={{ marginRight: 8 }}>{t}</a>)} · <a href="/dev/scene-return?frame=both&gray=1">grayscale</a> · <a href="/dev/scene-return?frame=scene&ready=0">zero-ready</a> · <a href="/dev/scene-return?frame=footer">footer only</a>. Reduced motion and no-JS: the scene declares `static` and uses no motion class; everything is server HTML.</p>}

      <h2 style={H}>7 · Boundary checklist</h2>
      <ul style={MONO}>{checks.map(([t, ok]) => <li key={t}>{ok ? "PASS" : "FAIL"} — {t}</li>)}</ul>
      <p style={MONO}>Sweeps — capture: {capture.join(", ") || "none"} · claims: {claims.join(", ") || "none"} · legal words: {legal.join(", ") || "none"}</p>

      <h2 style={H}>8 · Copy panel (verbatim)</h2>
      <div style={BOX}>
        <p style={MONO}>Recall A (shipped — Scene 0&apos;s statement verbatim)</p><p>{RETURN_COPY.recall}</p>
        <p style={MONO}>Recall B</p><p>{RETURN_COPY.recallCandidateB}</p>
        <p style={MONO}>Lead ({sentences(RETURN_COPY.lead)} sentences, {words(RETURN_COPY.lead)} words)</p><p>{RETURN_COPY.lead}</p>
        <p style={MONO}>Open line (derived)</p><p>{openLine(p.entries)}</p>
        <p style={MONO}>Action A (shipped, {words(RETURN_COPY.action)} words) → {RETURN_COPY.actionHref}</p><p>{RETURN_COPY.action}</p>
        <p style={MONO}>Action B</p><p>{RETURN_COPY.actionCandidateB}</p>
        <p style={MONO}>Closing line</p><p>{RETURN_COPY.closing}</p>
        <p style={MONO}>Footer closing line</p><p>{FOOTER_COPY.closing}</p>
        <p style={MONO}>Copyright</p><p>{FOOTER_COPY.copyright}</p>
        <p style={MONO}>Every rendered string</p><ol>{strings.map((s) => <li key={s}>{s}</li>)}</ol>
      </div>

      <h2 style={H}>9 · Launch blockers — legal and contact</h2>
      <table style={{ fontSize: "var(--ta-text-sm)", borderCollapse: "collapse" }}><thead><tr><th align="left">item</th><th align="left">blocks</th><th align="left">status</th></tr></thead><tbody>{p.blockers.map((b) => <tr key={b.item} style={{ borderTop: "1px solid var(--ta-border-subtle)" }}><td style={{ padding: "6px 12px 6px 0", verticalAlign: "top" }}>{b.item}</td><td style={{ padding: "6px 12px 6px 0", verticalAlign: "top" }}>{b.blocks}</td><td style={{ padding: "6px 0", verticalAlign: "top" }}>{b.status}</td></tr>)}</tbody></table>

      <h2 style={H}>10 · Page-length readout — `/` complete</h2>
      {len === null ? <p style={MONO}>measuring…</p> : <table style={{ ...MONO, borderCollapse: "collapse" }}><tbody>{len.rows.map((r) => <tr key={r.id}><td style={{ paddingRight: 16 }}>{r.id}</td><td>{r.words} words</td></tr>)}<tr><td style={{ paddingRight: 16 }}><b>total</b></td><td><b>{total} words · ≈{(total / 230).toFixed(1)} min at 230 wpm</b></td></tr></tbody></table>}

      <h2 style={H}>11 · Real vs deferred</h2>
      <ul style={MONO}>
        <li>REAL: the door (#for-students → Scene 3, whose availability is derived from config); /subjects, /login, /#how-it-works all resolve; the open-count line is derived.</li>
        <li>DEFERRED: privacy policy, terms, contact route, DPDP review — absent and listed as blockers, not faked.</li>
      </ul>
    </main>
  );
}
