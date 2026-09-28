"use client";

import { useMemo, useState } from "react";
import { BrandMark, BrandWordmark } from "@/components/brand/brand";
import { Button, Input } from "@/components/ui";
import { SUBJECTS, getSubject } from "@/lib/subjects/subjects";
import { mutualMatrix, validateSubject } from "@/lib/subjects/validate";

const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: 0 };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)" };
const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)" };

function Swatch({ c }: { c: string }) {
  return <span aria-hidden style={{ width: 18, height: 18, borderRadius: "var(--ta-radius-1)", background: c, border: "1px solid var(--ta-border-subtle)", display: "inline-block" }} />;
}

function RoomSample() {
  return (
    <div style={{ background: "var(--ta-surface-base)", border: "1px solid var(--ta-accent-3)", borderRadius: "var(--ta-radius-4)", padding: "var(--ta-pad-card)", display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-3)" }}>
        <BrandMark size={28} variant="brass" />
        <BrandWordmark />
      </div>
      <p style={{ color: "var(--ta-text-primary)", fontSize: "var(--ta-text-base)", margin: 0 }}>A working Room keeps the subject accent but calms the atmosphere.</p>
      <div style={{ height: 4, borderRadius: 99, background: "var(--ta-surface-sunken)", overflow: "clip" }}>
        <div style={{ width: "62%", height: "100%", background: "var(--ta-accent-1)" }} />
      </div>
      <Input placeholder="Answer in simplest form" aria-label="Sample answer" />
      <div style={{ display: "flex", gap: "var(--ta-space-2)" }}>
        <Button variant="primary" size="sm">Check</Button>
        <Button variant="ghost" size="sm">Skip</Button>
      </div>
    </div>
  );
}

function InvariancePanel({ id }: { id: string }) {
  return (
    <div data-subject={id} style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-3)", padding: "var(--ta-space-4)", background: "var(--ta-surface-base)" }}>
      <div style={TAG}>{id} — accent changes, frame identical</div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-3)", margin: "var(--ta-space-2) 0" }}>
        <BrandMark size={32} variant="brass" />
        <BrandWordmark />
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "var(--ta-surface-sunken)", marginBottom: "var(--ta-space-3)" }}>
        <div style={{ width: "50%", height: "100%", background: "var(--ta-accent-1)" }} />
      </div>
      <Button variant="primary" size="sm">Same geometry</Button>
    </div>
  );
}

export default function SubjectsSwitchboard() {
  const [activeId, setActiveId] = useState("mathematics");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const active = getSubject(activeId)!;
  const report = useMemo(() => validateSubject(active), [active]);
  const matrix = useMemo(() => mutualMatrix(), []);

  return (
    <div style={{ maxWidth: "100%", overflowX: "clip", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 3 · Step 1 — SUBJECT IDENTITY SCHEMA + SWITCHBOARD (dev-only)</p>
        <h1 style={H1}>One brand, many environments</h1>
        <p style={NOTE}>Subjects are config, not components. The switcher re-points the three accent slots via <code>[data-subject]</code>; the brand frame (mark, type, motion, spatial, primitives) is pixel-identical everywhere. Environment art, custom marks, ambience and transitions are DEFERRED to 3.2–3.5 and shown as labelled placeholders.</p>

        <div style={{ display: "flex", gap: "var(--ta-space-2)", marginBottom: "var(--ta-space-4)" }}>
          <Button variant="secondary" size="sm" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>Theme: {theme}</Button>
          <Button variant="secondary" size="sm" onClick={() => setDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))}>Density: {density}</Button>
        </div>

        {/* SWITCHER */}
        <div role="radiogroup" aria-label="Choose a subject" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--ta-space-4)" }}>
          {SUBJECTS.map((s) => (
            <button key={s.id} role="radio" aria-checked={s.id === activeId} onClick={() => setActiveId(s.id)}
              style={{ textAlign: "left", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-4)", borderRadius: "var(--ta-radius-3)", border: `1px solid ${s.id === activeId ? "var(--ta-accent-1)" : "var(--ta-border-subtle)"}`, background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}><Swatch c={s.accent1.ink} /><Swatch c={s.accent2.ink} /><Swatch c={s.accent3.ink} /></div>
              <div style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-lg)", fontWeight: 500 }}>{s.name}</div>
              <div style={TAG}>{s.tagline}</div>
              <div style={{ ...TAG, marginTop: 6 }}>{s.atmosphere} · {s.motif} · {s.motionChar} · {s.density} · [{s.status}]</div>
            </button>
          ))}
        </div>

        {/* LIVE PREVIEW PANEL */}
        <h2 style={H2}>Live preview — {active.name}</h2>
        <div data-theme={theme}>
          <div data-subject={activeId} data-density={density === "compact" ? "compact" : undefined} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--ta-space-6)", background: "var(--ta-surface-sunken)", padding: "var(--ta-space-6)", borderRadius: "var(--ta-radius-4)" }}>
            <div>
              <div style={TAG}>ROOM — accent retained, atmosphere reduced</div>
              <div style={{ marginTop: "var(--ta-space-2)" }}><RoomSample /></div>
            </div>
            <div>
              <div style={TAG}>STAGE — atmosphere intent (placeholder, real art in 3.4)</div>
              <div style={{ marginTop: "var(--ta-space-2)", minHeight: 160, borderRadius: "var(--ta-radius-4)", background: `color-mix(in srgb, var(--ta-accent-1) 16%, var(--ta-surface-sunken))`, border: "1px solid var(--ta-accent-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ta-accent-1)" }}>
                <span style={TAG}>{active.atmosphere} · {active.motif} — environment art deferred</span>
              </div>
              <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>{active.environment}</p>
            </div>
          </div>
        </div>

        {/* BRAND-FRAME INVARIANCE */}
        <h2 style={H2}>Brand-frame invariance — side by side</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--ta-space-4)" }}>
          <InvariancePanel id="mathematics" />
          <InvariancePanel id="physics" />
        </div>

        {/* VALIDATOR LIVE */}
        <h2 style={H2}>Validator — {active.id}</h2>
        <div style={{ ...TAG, marginBottom: "var(--ta-space-2)" }}>status [{active.status}] · {report.pass ? "PASS" : "FAIL"}</div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {report.checks.map((c) => <li key={c.name} style={{ ...TAG, color: c.pass ? "var(--ta-state-success)" : "var(--ta-state-danger)" }}>{c.pass ? "✓" : "✗"} {c.name}: {c.detail}</li>)}
        </ul>
        <h2 style={{ ...H2, fontSize: "var(--ta-text-xl)" }}>Mutual distinctness matrix (ΔE ink/ivory ≥15)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 4 }}>
          {matrix.map((m) => <div key={m.pair} style={{ ...TAG, color: m.pass ? "var(--ta-text-muted)" : "var(--ta-state-danger)" }}>{m.pass ? "✓" : "✗"} {m.pair}: {m.dInk.toFixed(0)}/{m.dIvory.toFixed(0)}</div>)}
        </div>

        <p style={{ ...NOTE, marginTop: "var(--ta-space-section)" }}>REAL here: schema, configs, validator, accent scoping, switcher, brand invariance. PLACEHOLDER (deferred): environment art, custom subject marks, ambient layer, transition choreography, subject routing (3.5). No draft subject can ship — the provider throws in production.</p>
      </main>
    </div>
  );
}
