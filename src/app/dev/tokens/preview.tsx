"use client";

import { useEffect, useMemo, useState } from "react";

/*
 * Client-only token preview (loaded with ssr:false from ./page).
 * Reads the LIVE CSS custom properties and prints computed hex + the actual
 * WCAG contrast ratio for each pairing, in both themes.
 */

const PRIMITIVES: Array<[group: string, tokens: string[]]> = [
  ["ink", ["--ta-ink-950", "--ta-ink-900", "--ta-ink-800", "--ta-ink-700"]],
  ["slate", ["--ta-slate-700", "--ta-slate-600", "--ta-slate-400", "--ta-slate-300", "--ta-slate-200"]],
  ["ivory", ["--ta-ivory-300", "--ta-ivory-200", "--ta-ivory-100", "--ta-ivory-50"]],
  ["brass", ["--ta-brass-700", "--ta-brass-600", "--ta-brass-500", "--ta-brass-400", "--ta-brass-300"]],
  ["signal", ["--ta-signal-700", "--ta-signal-600", "--ta-signal-500", "--ta-signal-400", "--ta-signal-300"]],
  ["danger", ["--ta-danger-600", "--ta-danger-500", "--ta-danger-400"]],
];

const SEMANTIC_GROUPS: Array<[title: string, tokens: string[]]> = [
  ["Surfaces", ["--ta-surface-base", "--ta-surface-raised", "--ta-surface-sunken", "--ta-surface-overlay", "--ta-surface-brand"]],
  ["Text", ["--ta-text-primary", "--ta-text-secondary", "--ta-text-muted", "--ta-text-inverse", "--ta-text-on-brand"]],
  ["Brand / Signal", ["--ta-brand", "--ta-brand-strong", "--ta-brand-quiet", "--ta-signal", "--ta-signal-quiet"]],
  ["Borders / Focus", ["--ta-border-subtle", "--ta-border-strong", "--ta-border-focus", "--ta-focus-ring"]],
  ["Subject slots", ["--ta-accent-1", "--ta-accent-2", "--ta-accent-3"]],
  ["State", ["--ta-state-success", "--ta-state-warning", "--ta-state-danger", "--ta-state-info"]],
];

const PAIRINGS: Array<[label: string, fg: string, bg: string, min: number, scope?: "dark" | "light"]> = [
  ["text-primary / surface-base", "--ta-text-primary", "--ta-surface-base", 4.5],
  ["text-secondary / surface-base", "--ta-text-secondary", "--ta-surface-base", 4.5],
  ["text-muted / surface-base", "--ta-text-muted", "--ta-surface-base", 4.5],
  ["text-primary / surface-raised", "--ta-text-primary", "--ta-surface-raised", 4.5],
  ["text-on-brand / surface-brand", "--ta-text-on-brand", "--ta-surface-brand", 4.5],
  ["signal / surface-base (graphic)", "--ta-signal", "--ta-surface-base", 3],
  ["brand / surface-base (graphic)", "--ta-brand", "--ta-surface-base", 3],
  ["border-subtle / surface-base", "--ta-border-subtle", "--ta-surface-base", 3],
  ["border-strong / surface-base", "--ta-border-strong", "--ta-surface-base", 3],
  ["focus-ring / surface-base", "--ta-focus-ring", "--ta-surface-base", 3],
  ["state-danger / surface-base", "--ta-state-danger", "--ta-surface-base", 3],
];

const SPACES = ["1", "2", "3", "4", "6", "8", "12", "16", "24", "32", "40"];
const RADII = ["1", "2", "3", "4", "5"];
const DURS = ["instant", "fast", "base", "slow", "slower", "cinematic"];

function parseColor(s: string): [number, number, number] | null {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(",").map((n) => parseFloat(n));
  return [p[0], p[1], p[2]];
}
let _ctx: CanvasRenderingContext2D | null = null;
// Fallback for computed values Chrome reports as color()/oklch (e.g. color-mix).
function canvasRGB(css: string): [number, number, number] | null {
  if (!_ctx) _ctx = document.createElement("canvas").getContext("2d");
  if (!_ctx) return null;
  _ctx.clearRect(0, 0, 1, 1);
  _ctx.fillStyle = "#000";
  _ctx.fillStyle = css;
  _ctx.fillRect(0, 0, 1, 1);
  const d = _ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}
function toHex(rgb: [number, number, number]): string {
  return "#" + rgb.map((n) => Math.round(n).toString(16).padStart(2, "0")).join("");
}
function lum(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export default function TokenPreview() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    // Bump so the resolver re-reads computed values after the attribute flips.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTick((t) => t + 1);
  }, [theme]);

  const resolve = useMemo(() => {
    const probe = document.createElement("span");
    document.body.appendChild(probe);
    const map = new Map<string, [number, number, number]>();
    const all = [
      ...PRIMITIVES.flatMap(([, t]) => t),
      ...SEMANTIC_GROUPS.flatMap(([, t]) => t),
      ...PAIRINGS.flatMap(([, f, b]) => [f, b]),
    ];
    for (const tok of new Set(all)) {
      probe.style.color = "";
      probe.style.color = `var(${tok})`;
      const css = getComputedStyle(probe).color;
      const c = parseColor(css) ?? canvasRGB(css);
      if (c) map.set(tok, c);
    }
    probe.remove();
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const hex = (tok: string) => {
    const c = resolve.get(tok);
    return c ? toHex(c) : "—";
  };

  const cell: React.CSSProperties = { fontFamily: "ui-monospace, monospace", fontSize: 11 };

  return (
    <main style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100vh", padding: "32px 24px 96px" }}>
      <header style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ font: "700 22px/1.2 system-ui", margin: 0 }}>Token preview — INK &amp; SIGNAL</h1>
          <p style={{ ...cell, color: "var(--ta-text-muted)", margin: "6px 0 0" }}>dev-only · reads live CSS vars · theme: {theme}</p>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", font: "600 13px system-ui" }}
        >
          Switch to {theme === "dark" ? "light" : "dark"}
        </button>
      </header>

      <h2 style={{ font: "700 15px system-ui", margin: "24px 0 10px" }}>Primitives</h2>
      {PRIMITIVES.map(([group, tokens]) => (
        <div key={group} style={{ marginBottom: 14 }}>
          <p style={{ ...cell, color: "var(--ta-text-muted)", margin: "0 0 6px" }}>{group}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tokens.map((t) => (
              <div key={t} style={{ width: 96 }}>
                <div style={{ height: 44, borderRadius: 8, background: `var(${t})`, border: "1px solid var(--ta-border-subtle)" }} />
                <p style={{ ...cell, margin: "4px 0 0" }}>{t.replace("--ta-", "")}</p>
                <p style={{ ...cell, color: "var(--ta-text-muted)", margin: 0 }}>{hex(t)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 style={{ font: "700 15px system-ui", margin: "32px 0 10px" }}>Semantic (as their role)</h2>
      {SEMANTIC_GROUPS.map(([title, tokens]) => (
        <div key={title} style={{ marginBottom: 16 }}>
          <p style={{ ...cell, color: "var(--ta-text-muted)", margin: "0 0 6px" }}>{title}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tokens.map((t) => (
              <div key={t} style={{ width: 120 }}>
                <div style={{ height: 44, borderRadius: 8, background: `var(${t})`, border: "1px solid var(--ta-border-subtle)" }} />
                <p style={{ ...cell, margin: "4px 0 0" }}>{t.replace("--ta-", "")}</p>
                <p style={{ ...cell, color: "var(--ta-text-muted)", margin: 0 }}>{hex(t)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 style={{ font: "700 15px system-ui", margin: "32px 0 10px" }}>Contrast (measured, this theme)</h2>
      <table style={{ borderCollapse: "collapse", ...cell }}>
        <thead>
          <tr>
            {["pairing", "fg", "bg", "ratio", "need", ""].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "4px 10px", borderBottom: "1px solid var(--ta-border-strong)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PAIRINGS.filter(([, , , , scope]) => !scope || scope === theme).map(
            ([label, fg, bg, min]) => {
            const f = resolve.get(fg);
            const b = resolve.get(bg);
            const r = f && b ? ratio(f, b) : 0;
            const pass = r >= min;
            return (
              <tr key={label}>
                <td style={{ padding: "4px 10px" }}>{label}</td>
                <td style={{ padding: "4px 10px" }}>{hex(fg)}</td>
                <td style={{ padding: "4px 10px" }}>{hex(bg)}</td>
                <td style={{ padding: "4px 10px", fontWeight: 700 }}>{r.toFixed(2)}</td>
                <td style={{ padding: "4px 10px" }}>{min}</td>
                <td style={{ padding: "4px 10px", color: pass ? "var(--ta-state-success)" : "var(--ta-state-danger)", fontWeight: 700 }}>{pass ? "PASS" : "FAIL"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={{ font: "700 15px system-ui", margin: "32px 0 10px" }}>Spacing</h2>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
        {SPACES.map((s) => (
          <div key={s} style={{ textAlign: "center" }}>
            <div style={{ width: `var(--ta-space-${s})`, height: 24, background: "var(--ta-signal)", borderRadius: 4 }} />
            <p style={{ ...cell, margin: "4px 0 0" }}>{s}</p>
          </div>
        ))}
      </div>

      <h2 style={{ font: "700 15px system-ui", margin: "24px 0 10px" }}>Radius</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {RADII.map((r) => (
          <div key={r} style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "var(--ta-brand)", borderRadius: `var(--ta-radius-${r})` }} />
            <p style={{ ...cell, margin: "4px 0 0" }}>{r}</p>
          </div>
        ))}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, background: "var(--ta-brand)", borderRadius: "var(--ta-radius-full)" }} />
          <p style={{ ...cell, margin: "4px 0 0" }}>full</p>
        </div>
      </div>

      <h2 style={{ font: "700 15px system-ui", margin: "24px 0 10px" }}>Elevation</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[0, 1, 2, 3, 4].map((e) => (
          <div key={e} style={{ textAlign: "center" }}>
            <div style={{ width: 88, height: 64, background: "var(--ta-surface-raised)", borderRadius: 12, boxShadow: `var(--ta-elev-${e})` }} />
            <p style={{ ...cell, margin: "6px 0 0" }}>elev-{e}</p>
          </div>
        ))}
      </div>

      <h2 style={{ font: "700 15px system-ui", margin: "24px 0 10px" }}>Motion durations</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DURS.map((d) => (
          <span key={d} style={{ ...cell, border: "1px solid var(--ta-border-strong)", borderRadius: 999, padding: "4px 10px" }}>--ta-dur-{d}</span>
        ))}
      </div>
    </main>
  );
}
