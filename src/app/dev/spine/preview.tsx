"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { BANNED_PHRASES, VOICE_RULES } from "@/lib/spine/voice";
import { PAGE_SCROLL_CEILING, type SceneContract } from "@/lib/spine/types";

/* SPINE SPECIMEN (Phase 4 · Step 1) — judge the structure before any art.
   The reorder control proves the spine is DATA: it re-sorts the slice passed
   in; no component is edited. */

const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 };
const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)", lineHeight: 1.6 };
const BTN: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 12px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const CELL: React.CSSProperties = { padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)", fontSize: "var(--ta-text-xs)", color: "var(--ta-text-secondary)", verticalAlign: "top", fontFamily: "var(--ta-font-mono)" };

export default function SpineSpecimen({
  scenes,
  total,
  subjects,
}: {
  scenes: SceneContract[];
  total: number;
  subjects: { id: string; name: string }[];
}) {
  const [order, setOrder] = useState(() => scenes.map((s) => s.id));
  const [rmPreview, setRmPreview] = useState(false);

  useEffect(() => {
    if (rmPreview) document.documentElement.setAttribute("data-reduced-motion", "on");
    else document.documentElement.removeAttribute("data-reduced-motion");
    return () => document.documentElement.removeAttribute("data-reduced-motion");
  }, [rmPreview]);

  const byId = Object.fromEntries(scenes.map((s) => [s.id, s]));
  const ordered = order.map((id) => byId[id]);

  const move = (id: string, d: -1 | 1) => {
    setOrder((o) => {
      const i = o.indexOf(id);
      const j = i + d;
      if (j < 0 || j >= o.length) return o;
      const n = [...o];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };

  return (
    <div style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 4 · Step 1 — THE NARRATIVE SPINE (dev-only)</p>
        <h1 style={H1}>The story&apos;s architecture, before its art</h1>
        <p style={NOTE}>
          This step produced: the scene contract, the nine-scene spine, the scroll grammar, the copy
          voice, and a live skeleton at <Link href="/" style={{ color: "var(--ta-accent-1)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>/</Link>.
          Deferred: hero design, scene art and real copy (Steps 4.2–4.8), the chooser design (4.3),
          the footer (4.8). The spine is data — reorder it below and the sequence and budget readouts on this page follow; the rendered-page proof is on /dev/page (frame=spine&order=swap).
        </p>

        <h2 style={H2}>Sequence — reorder to prove the spine is data</h2>
        <div style={{ display: "grid", gap: "var(--ta-space-2)" }}>
          {ordered.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-3)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-2) var(--ta-space-3)" }}>
              <span style={{ ...TAG, width: "1.5rem" }}>{i}</span>
              <strong style={{ fontSize: "var(--ta-text-sm)", minWidth: "7rem" }}>{s.name}</strong>
              <span style={{ ...TAG, color: "var(--ta-accent-1)" }}>{s.narrativeFn}</span>
              <span style={TAG}>{s.scrollBehaviour} · {s.scrollBudget}vh · {s.status} · live {String(s.liveCapability)}</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: "var(--ta-space-1)" }}>
                <button type="button" style={BTN} onClick={() => move(s.id, -1)} aria-label={`Move ${s.name} earlier`}>↑</button>
                <button type="button" style={BTN} onClick={() => move(s.id, 1)} aria-label={`Move ${s.name} later`}>↓</button>
              </span>
            </div>
          ))}
        </div>
        <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
          <button type="button" style={BTN} onClick={() => setOrder(scenes.map((s) => s.id))}>reset to default</button>
        </p>

        <h2 style={H2}>Scroll grammar — budget against the ceiling</h2>
        <p style={NOTE}>
          Page-wide ceiling {PAGE_SCROLL_CEILING} viewport-heights; declared total {total}. Sticky-stage is
          claimed by <strong>enter</strong> only — the signature 3.4 transformation needs a held viewport; no
          other scene earns a pin. Sequence is claimed by <strong>practice</strong> only (four beats inside one
          scene). Motion cap: 8 concurrently animating elements per scene. With reduced motion every behaviour
          collapses to static and the story still reads in order (toggle below).
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-1)", maxWidth: "40rem" }}>
          {ordered.map((s) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "7rem 1fr 4rem", gap: "var(--ta-space-2)", alignItems: "center" }}>
              <span style={TAG}>{s.id}</span>
              <div style={{ height: 8, background: "var(--ta-surface-raised)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(s.scrollBudget / PAGE_SCROLL_CEILING) * 100}%`, height: "100%", background: "var(--ta-accent-1)" }} />
              </div>
              <span style={TAG}>{s.scrollBudget}vh</span>
            </div>
          ))}
          <p style={TAG}>total {total} / {PAGE_SCROLL_CEILING} viewport-heights</p>
        </div>
        <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
          <button type="button" style={BTN} aria-pressed={rmPreview} onClick={() => setRmPreview(!rmPreview)}>
            reduced-motion preview: {rmPreview ? "on" : "off"}
          </button>{" "}
          No-JS preview: the same spine is what <Link href="/" style={{ color: "var(--ta-accent-1)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>/</Link> serves
          without JavaScript — every scene server-rendered, in order (verified with JS disabled in the test pass).
        </p>

        <h2 style={H2}>Scene coverage — no blank degradation plan</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "60rem" }}>
            <thead>
              <tr>
                {["scene", "fn", "status", "scroll", "pins", "subject", "accent", "ambient", "reducedMotion", "mobile", "noJs", "live"].map((h) => (
                  <th key={h} style={{ ...CELL, color: "var(--ta-text-muted)", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenes.map((s) => (
                <tr key={s.id}>
                  <td style={CELL}>{s.id}</td>
                  <td style={CELL}>{s.narrativeFn}</td>
                  <td style={CELL}>{s.status}</td>
                  <td style={CELL}>{s.scrollBehaviour}</td>
                  <td style={CELL}>{String(s.pins)}</td>
                  <td style={CELL}>{s.subjectMode}</td>
                  <td style={CELL}>{s.accentUse}</td>
                  <td style={CELL}>{s.ambient}</td>
                  <td style={CELL}>{s.reducedMotion}</td>
                  <td style={CELL}>{s.mobileBehaviour}</td>
                  <td style={CELL}>{s.noJsBehaviour}</td>
                  <td style={CELL}>{String(s.liveCapability)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={H2}>liveCapability map — the honesty treatment</h2>
        <ul style={{ ...NOTE, paddingLeft: 20 }}>
          {scenes.map((s) => (
            <li key={s.id}>
              <strong>{s.id}</strong>: {s.liveCapability ? "describes capability that exists today" : "describes what's next"}
              {s.liveCapability
                ? ""
                : s.id === "practice"
                  ? " — the one authored roadmap beat; confident, specific, no apology."
                  : " — renders with the 3.6 honest treatment (quiet system state), never a disclaimer."}
            </li>
          ))}
        </ul>

        <h2 style={H2}>The copy voice</h2>
        <ul style={{ ...NOTE, paddingLeft: 20 }}>
          {VOICE_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p style={TAG}>Banned outright</p>
        <p style={NOTE}>{BANNED_PHRASES.join(" · ")}</p>
        <p style={TAG}>Subjects in the system</p>
        <p style={NOTE}>{subjects.map((s) => s.name).join(" · ")}</p>
      </main>
    </div>
  );
}
