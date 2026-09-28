"use client";

import { useEffect, useState } from "react";

/*
 * Client-only TYPE SPECIMEN (ssr:false). Reads live computed metrics so the
 * numbers shown are what the browser actually laid out, in the current theme.
 */

type Row = {
  tok: string;
  name: string;
  display: boolean;
  lh: string;
  track: string;
  weight: string;
  measure: string;
  use: string;
};

const ROWS: Row[] = [
  { tok: "--ta-text-2xs", name: "text-2xs", display: false, lh: "1.4", track: "+0.08em (caps)", weight: "500", measure: "—", use: "micro label · badge" },
  { tok: "--ta-text-xs", name: "text-xs", display: false, lh: "1.4", track: "+0.08em (caps)", weight: "500", measure: "—", use: "label · caption" },
  { tok: "--ta-text-sm", name: "text-sm", display: false, lh: "1.5", track: "0", weight: "400", measure: "68ch", use: "secondary UI · helper" },
  { tok: "--ta-text-base", name: "text-base", display: false, lh: "1.6", track: "0", weight: "400", measure: "68ch", use: "body (16px floor)" },
  { tok: "--ta-text-lg", name: "text-lg", display: false, lh: "1.6", track: "0", weight: "400", measure: "68ch", use: "lead body" },
  { tok: "--ta-text-xl", name: "text-xl", display: false, lh: "1.4", track: "-0.01em", weight: "500", measure: "40ch", use: "subhead" },
  { tok: "--ta-text-2xl", name: "text-2xl", display: false, lh: "1.3", track: "-0.01em", weight: "500", measure: "36ch", use: "section title" },
  { tok: "--ta-display-sm", name: "display-sm", display: true, lh: "1.04", track: "-0.02em", weight: "500", measure: "24ch", use: "card heading" },
  { tok: "--ta-display-md", name: "display-md", display: true, lh: "1.04", track: "-0.02em", weight: "500", measure: "22ch", use: "h2" },
  { tok: "--ta-display-lg", name: "display-lg", display: true, lh: "1.04", track: "-0.03em", weight: "600", measure: "20ch", use: "h1 / hero" },
  { tok: "--ta-display-xl", name: "display-xl", display: true, lh: "0.98", track: "-0.03em", weight: "600", measure: "18ch", use: "hero statement" },
];

const cell: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "0.6875rem" };

function Para() {
  return (
    <p
      className="ta-measure"
      style={{
        fontFamily: "var(--ta-font-text)",
        fontSize: "var(--ta-text-base)",
        lineHeight: "var(--ta-leading-body)",
        color: "var(--ta-text-secondary)",
      }}
    >
      Tutors Academy exists because a timetable, a video link, a homework sheet and a test
      score should never live in four different apps. When a student joins a live class, the
      same record follows them into the recording, the assignment and the assessment — so a
      tutor can see not just what was scored, but how the learning actually happened. Numbers
      matter here: a score of <span className="ta-num">92</span>, a streak of{" "}
      <span className="ta-num">14</span> days, a timer at{" "}
      <span className="ta-num">00:14:32</span>. Setting them in tabular figures keeps every
      column honest and every comparison instant.
    </p>
  );
}

export default function TypeSpecimen() {
  const [sizes, setSizes] = useState<Record<string, { px: string; lh: string; ls: string }>>({});

  useEffect(() => {
    const probe = document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    const out: Record<string, { px: string; lh: string; ls: string }> = {};
    for (const r of ROWS) {
      probe.style.fontFamily = r.display ? "var(--ta-font-display)" : "var(--ta-font-text)";
      probe.style.fontSize = `var(${r.tok})`;
      probe.style.lineHeight = r.lh;
      probe.style.letterSpacing = r.track.includes("caps") ? "var(--ta-tracking-caps)" : r.track.replace("em", "em");
      const cs = getComputedStyle(probe);
      out[r.tok] = { px: cs.fontSize, lh: cs.lineHeight, ls: cs.letterSpacing };
    }
    probe.remove();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSizes(out);
  }, []);

  const themePanel = (label: string, light: boolean) => (
    <div
      data-theme={light ? "light" : undefined}
      style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", borderRadius: 16, padding: 24, border: "1px solid var(--ta-border-subtle)" }}
    >
      <p style={{ ...cell, color: "var(--ta-text-muted)", margin: "0 0 8px" }}>{label}</p>
      <p style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", lineHeight: "var(--ta-leading-display)", letterSpacing: "var(--ta-tracking-display)", fontWeight: 500, margin: "0 0 12px" }}>
        Learn it once, keep it for life.
      </p>
      <Para />
      <p style={{ ...cell, marginTop: 12 }}>
        <span className="ta-num">00:14:32</span> · score <span className="ta-num">92/100</span> ·{" "}
        <span className="ta-num">87%</span>
      </p>
    </div>
  );

  return (
    <main style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100vh", padding: "32px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-lg)", lineHeight: "var(--ta-leading-display)", letterSpacing: "var(--ta-tracking-display-xl)", fontWeight: 600, margin: 0 }}>
        Type specimen — the brand frame
      </h1>
      <p style={{ ...cell, color: "var(--ta-text-muted)", margin: "8px 0 24px" }}>
        display Fraunces · text Instrument Sans · mono JetBrains Mono · dev-only
      </p>

      {/* Both themes side by side */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginBottom: 32 }}>
        {themePanel("dark (default)", false)}
        {themePanel("light", true)}
      </div>

      {/* Scale + rhythm */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "8px 0 12px" }}>Scale & rhythm</h2>
      <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", ...cell }}>
        <thead>
          <tr>
            {["step", "computed", "line-height", "tracking", "weight", "measure", "use"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--ta-border-strong)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => {
            const m = sizes[r.tok];
            return (
              <tr key={r.tok}>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>
                  <span style={{ fontFamily: r.display ? "var(--ta-font-display)" : "var(--ta-font-text)", fontSize: `var(${r.tok})`, lineHeight: 1.2, fontWeight: r.display ? 500 : 400 }}>
                    Ag
                  </span>
                  <span style={{ marginLeft: 8, color: "var(--ta-text-muted)" }}>{r.name}</span>
                </td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{m ? m.px : "…"}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{r.lh}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{r.track}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{r.weight}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{r.measure}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{r.use}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* Long-form */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "32px 0 12px" }}>Long-form reading</h2>
      <Para />

      {/* Numerals */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "32px 0 12px" }}>Numerals & data</h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--ta-font-text)", fontSize: "var(--ta-text-2xl)", fontWeight: 600 }} className="ta-num">00:14:32</span>
        <span style={{ fontSize: "var(--ta-text-xl)", fontWeight: 600 }} className="ta-num">92 / 100</span>
        <span style={{ fontSize: "var(--ta-text-lg)", fontWeight: 500 }} className="ta-num">87%</span>
      </div>
      <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", ...cell }}>
        <tbody>
          {[["Week 1", "78", "64"], ["Week 2", "84", "71"], ["Week 3", "92", "80"]].map(([w, a, b]) => (
            <tr key={w}>
              <td style={{ padding: "4px 14px 4px 0" }}>{w}</td>
              <td style={{ padding: "4px 14px" }} className="ta-num">{a}</td>
              <td style={{ padding: "4px 0" }} className="ta-num">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Mono / equations */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "32px 0 12px" }}>Mono — code & equations</h2>
      <div style={{ ...cell, fontSize: "0.8125rem", display: "flex", flexDirection: "column", gap: 6 }}>
        <code className="ta-mono">E = mc²&nbsp;&nbsp;·&nbsp;&nbsp;a² + b² = c²&nbsp;&nbsp;·&nbsp;&nbsp;∫₀¹ x² dx = 1/3</code>
        <code className="ta-mono">2H₂ + O₂ → 2H₂O</code>
        <code className="ta-mono">{`const grade = score >= 90 ? "A" : "B";`}</code>
      </div>

      {/* Fallback vs loaded */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "32px 0 12px" }}>Metric-matched fallback vs loaded</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ fontFamily: "var(--ta-font-text)", fontSize: "var(--ta-text-lg)", margin: 0 }}>
          Loaded — Instrument Sans: the quick brown fox 0123456789
        </p>
        <p style={{ fontFamily: '"Instrument Sans Fallback", Arial, sans-serif', fontSize: "var(--ta-text-lg)", margin: 0, color: "var(--ta-text-muted)" }}>
          Fallback — metric-matched: the quick brown fox 0123456789
        </p>
      </div>
    </main>
  );
}
