"use client";

import { useEffect, useState } from "react";
import { AlignLeft, Activity, Box, Circle, Waypoints } from "lucide-react";
import { BrandMark } from "@/components/brand/brand";
import { SubjectMark, type SubjectMarkSize } from "@/components/brand/subject-mark";
import { SUBJECT_MARK_IDS, SUBJECT_MARKS } from "@/components/brand/subject-marks";

const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: 0 };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)" };
const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)" };

const LADDER = [16, 20, 24, 32, 48, 200];
const LUCIDE = [AlignLeft, Activity, Box, Circle, Waypoints];

export default function MarksSpecimen() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); return () => document.documentElement.removeAttribute("data-theme"); }, [theme]);

  return (
    <div style={{ maxWidth: "100%", overflowX: "clip", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 3 · Step 2 — THE SIX SUBJECT MARKS (dev-only)</p>
        <h1 style={H1}>Same hand, different idea</h1>
        <p style={NOTE}>Single-stroke figures in the brand stroke language (2.5/32, round terminals). currentColor only; colour arrives from accent tokens. No animation, no environment art, no motif grammar — those are 3.3–3.5.</p>
        <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} style={{ minHeight: "var(--ta-target-min)", padding: "0 16px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" }}>Theme: {theme}</button>

        <h2 style={H2}>Size ladder — optical sizing holds 16→200</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--ta-space-6)" }}>
          {SUBJECT_MARK_IDS.map((id) => (
            <div key={id} data-subject={id} style={{ color: "var(--ta-accent-1)" }}>
              <div style={{ ...TAG, color: "var(--ta-text-muted)" }}>{id} · {SUBJECT_MARKS[id].idea}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--ta-space-3)", flexWrap: "wrap", marginTop: "var(--ta-space-2)" }}>
                {LADDER.map((s) => <SubjectMark key={s} subject={id} size={s === 200 ? "display" : (s as SubjectMarkSize)} />)}
              </div>
            </div>
          ))}
        </div>

        <h2 style={H2}>Optical weight — six beside the brand mark</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-6)", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}><BrandMark size={48} /><div style={TAG}>brand</div></div>
          {SUBJECT_MARK_IDS.map((id) => (
            <div key={id} data-subject={id} style={{ color: "var(--ta-accent-1)", textAlign: "center" }}>
              <SubjectMark subject={id} size={48} /><div style={TAG}>{id}</div>
            </div>
          ))}
        </div>

        <h2 style={H2}>20px row — distinguishability</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-4)" }}>
          <BrandMark size={20} />
          {SUBJECT_MARK_IDS.map((id) => <span key={id} data-subject={id} style={{ color: "var(--ta-accent-1)" }}><SubjectMark subject={id} size={20} /></span>)}
        </div>

        <h2 style={H2}>Lucide confusion test — same size, different logic</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-4)" }}>
          {SUBJECT_MARK_IDS.map((id) => <span key={id} data-subject={id} style={{ color: "var(--ta-accent-1)" }}><SubjectMark subject={id} size={20} /></span>)}
          <span style={{ width: 1, alignSelf: "stretch", background: "var(--ta-border-subtle)" }} />
          {LUCIDE.map((G, i) => <G key={i} aria-hidden size={20} strokeWidth={1.5} style={{ color: "var(--ta-text-muted)" }} />)}
        </div>

        <h2 style={H2}>Accent on base / raised / sunken — both themes</h2>
        {(["base", "raised", "sunken"] as const).map((surf) => (
          <div key={surf} style={{ marginBottom: "var(--ta-space-4)" }}>
            <div style={TAG}>{surf}</div>
            <div style={{ display: "flex", gap: "var(--ta-space-4)", padding: "var(--ta-space-4)", borderRadius: "var(--ta-radius-3)", marginTop: 4, background: `var(--ta-surface-${surf})`, border: "1px solid var(--ta-border-subtle)" }}>
              {SUBJECT_MARK_IDS.map((id) => <span key={id} data-subject={id} style={{ color: "var(--ta-accent-1)" }}><SubjectMark subject={id} size={32} /></span>)}
            </div>
          </div>
        ))}

        <h2 style={H2}>Clear space + minimum size</h2>
        <p style={NOTE}>Mirrors the brand: clear space = 0.5 × mark height; minimum = 16px. Nothing below 16px, never a favicon (the brand mark is the favicon).</p>
        <div style={{ display: "inline-block", padding: 16, outline: "1px dashed var(--ta-signal)" }} data-subject="mathematics">
          <span style={{ color: "var(--ta-accent-1)" }}><SubjectMark subject="mathematics" size={32} /></span>
        </div>

        <p style={{ ...NOTE, marginTop: "var(--ta-space-section)" }}>REAL: six single-stroke marks, language spec, SubjectMark component, optical sizing. DEFERRED: motif grammar (3.3), environment art (3.4), ambience + switch transition (3.4/3.5). No figure needed simplification below the 10-command cap; none rejected.</p>
      </main>
    </div>
  );
}
