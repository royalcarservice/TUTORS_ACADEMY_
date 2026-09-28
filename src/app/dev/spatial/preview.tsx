"use client";

import { useEffect, useMemo, useState } from "react";
import { BREAKPOINTS, CONTAINERS, bandFor } from "@/lib/spatial";

/* ── spatial specimen — dev-only, mirrors /dev/tokens & /dev/type ── */

const S = {
  h1: { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "0 0 8px" } as const,
  h2: { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "40px 0 12px" } as const,
  note: { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", margin: "0 0 16px", maxWidth: "var(--ta-measure)" } as const,
  card: { background: "var(--ta-surface-raised)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-3)", padding: "var(--ta-pad-card)" } as const,
  mono: { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" } as const,
};

function Section(props: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section style={{ marginTop: "var(--ta-space-section)" }}>
      <h2 style={S.h2}>{props.title}</h2>
      {props.note && <p style={S.note}>{props.note}</p>}
      {props.children}
    </section>
  );
}

export default function SpatialSpecimen() {
  const [width, setWidth] = useState(0);
  const [overlay, setOverlay] = useState(false);
  const [simSafe, setSimSafe] = useState(false);
  const [torture, setTorture] = useState(true);
  const [cqW, setCqW] = useState(640);

  useEffect(() => {
    const onR = () => setWidth(window.innerWidth);
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const band = bandFor(width || 0);

  const overlayCols = useMemo(
    () => Array.from({ length: band.cols }, (_, i) => i),
    [band.cols],
  );

  return (
    <div style={{ maxWidth: "100%", overflowX: "clip", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      {/* GRID OVERLAY — fixed, pointer-transparent, matches .ta-grid of the band */}
      {overlay && (
        <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }}>
          <div style={{ maxWidth: "var(--ta-container-wide)", marginInline: "auto", height: "100%", paddingInline: "var(--ta-gutter)", display: "grid", gridTemplateColumns: `repeat(${band.cols}, minmax(0,1fr))`, gap: band.gap }}>
            {overlayCols.map((i) => (
              <div key={i} style={{ background: "color-mix(in srgb, var(--ta-signal) 12%, transparent)", outline: "1px dashed color-mix(in srgb, var(--ta-signal) 45%, transparent)" }} />
            ))}
          </div>
        </div>
      )}

      <div className="ta-container ta-container--content" style={{ paddingTop: "var(--ta-space-block)", paddingBottom: "var(--ta-space-section)" }}>
        <p style={{ ...S.mono, color: "var(--ta-signal)" }}>Phase 2 · Step 4 — SPATIAL SYSTEM (dev-only)</p>
        <h1 style={S.h1}>Grid · Containers · Breakpoints · Density</h1>
        <p style={S.note}>Two modes, locked: <strong>THE STAGE</strong> (full-bleed, cinematic; may contain Rooms) and <strong>THE ROOM</strong> (contained, calm; never holds Stage). A view is one or the other.</p>

        {/* LIVE READOUT */}
        <div style={{ ...S.card, display: "flex", flexWrap: "wrap", gap: "var(--ta-space-6)" }}>
          <Read k="band" v={band.id} />
          <Read k="viewport" v={`${width}px`} />
          <Read k="gutter" v={`${band.gutter}px`} />
          <Read k="cols / gap" v={`${band.cols} / ${band.gap}px`} />
          <Read k="page container" v="content · 70rem (1120)" />
          <button onClick={() => setOverlay((v) => !v)} style={btn}>
            {overlay ? "hide" : "show"} grid overlay
          </button>
        </div>

        <Section title="Breakpoints (canonical, min-width only)" note="Numbered bands only — no semantic names. CSS + src/lib/spatial.ts are a sync pair; run node scripts/check-breakpoints.mjs to detect drift.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--ta-space-3)" }}>
            {BREAKPOINTS.map((b) => (
              <div key={b.id} style={{ ...S.card, borderColor: b.id === band.id ? "var(--ta-signal)" : undefined }}>
                <div style={{ ...S.mono, color: b.id === band.id ? "var(--ta-signal)" : "var(--ta-text-muted)" }}>{b.id}{b.id === band.id ? " ●" : ""}</div>
                <div style={{ fontSize: "var(--ta-text-sm)" }}>{b.min}px</div>
                <div style={{ ...S.mono, color: "var(--ta-text-muted)" }}>{b.cols}c · g{b.gutter}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Containers (max-width + auto margins, never fixed)" note="ONE default: content. prose = reading only; wide = galleries/grids; stage = full-bleed + safe insets.">
          {(
            [
              ["prose", CONTAINERS.prose, "long-form reading"],
              ["content", CONTAINERS.content, "DEFAULT — Rooms, forms"],
              ["wide", CONTAINERS.wide, "galleries, subject grids"],
              ["stage", "full-bleed", "Stage only"],
            ] as const
          ).map(([name, val, use]) => (
            <div key={name} style={{ marginBottom: "var(--ta-space-3)" }}>
              <div style={{ ...S.mono, color: "var(--ta-text-muted)", marginBottom: 4 }}>{name} · {val} — {use}</div>
              <div style={{ background: "var(--ta-surface-sunken)", borderRadius: "var(--ta-radius-2)", padding: 4 }}>
                <div style={{ maxWidth: name === "stage" ? "none" : val, marginInline: "auto", height: 28, background: "color-mix(in srgb, var(--ta-brand) 30%, transparent)", borderRadius: "var(--ta-radius-1)" }} />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Density — comfortable vs compact (identical content)" note="Compact remaps ROLE TOKENS ONLY (spacing + control heights). Colour, type scale, radius, elevation stay unchanged.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--ta-space-6)" }}>
            <DensitySample label="comfortable (:root)" />
            <div data-density="compact">
              <DensitySample label="compact" />
            </div>
          </div>
        </Section>

        <Section title="Stage vs Room (same component block)" note="Stage owns the edges (full-bleed + safe insets). Room never breaks the container.">
          <div style={{ ...S.card, marginBottom: "var(--ta-space-3)" }}>
            <div style={S.mono}>THE STAGE — .ta-container--stage</div>
          </div>
          <div className="ta-container--stage" style={{ background: "color-mix(in srgb, var(--ta-accent-2) 18%, transparent)", paddingBlock: "var(--ta-space-block)" }}>
            <SampleCard title="Immersive scene" body="Full-bleed. Owns the edges. May contain Rooms." />
          </div>
          <div style={{ ...S.card, margin: "var(--ta-space-3) 0" }}>
            <div style={S.mono}>THE ROOM — .ta-container--content</div>
          </div>
          <div className="ta-container ta-container--content">
            <SampleCard title="Working surface" body="Contained, calm, predictable. Never holds Stage content." />
          </div>
        </Section>

        <Section title="Overflow — wide table & long equation scroll INSIDE, never the page" note="Reusable affordance: .ta-scroll-x (+ .ta-scroll-fade). Keyboard-reachable via tabindex.">
          <div className="ta-scroll-x ta-scroll-fade" tabIndex={0} style={{ ...S.card, padding: 0 }}>
            <table style={{ minWidth: 900, borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>{["tutor", "subject", "sessions", "hrs", "rating", "response", "zone", "rate", "avail"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--ta-border-subtle)", ...S.mono }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((r) => (
                  <tr key={r}>{["A. Rao", "Maths", "12", "18", "4.9", "2h", "IST", "₹900", "evenings"].map((c, i) => (
                    <td key={i} style={{ padding: "10px 12px", borderBottom: "1px solid var(--ta-border-subtle)", fontSize: "var(--ta-text-sm)" }}>{c}</td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ta-scroll-x ta-scroll-fade" tabIndex={0} style={{ ...S.card, marginTop: "var(--ta-space-3)" }}>
            <code style={{ ...S.mono, whiteSpace: "nowrap", display: "inline-block", padding: "8px 24px" }}>
              ∫₀^∞ e^(−x²) dx = √π / 2  ⇒  σ² = (1/N) Σᵢ₌₁ᴺ (xᵢ − μ)²  ⇒  f(x) = (1 / (σ√(2π))) · e^(−(x−μ)² / 2σ²)
            </code>
          </div>
        </Section>

        <Section title={`Text-spacing torture (WCAG 1.4.12) — ${torture ? "FORCED" : "normal"}`} note="line-height 1.5×, paragraph spacing 2×, letter-spacing .12em, word-spacing .16em. No fixed heights on text containers — nothing clips or overlaps.">
          <button onClick={() => setTorture((v) => !v)} style={btn}>{torture ? "relax" : "force"} overrides</button>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--ta-space-6)", marginTop: "var(--ta-space-3)" }}>
            <TortureSample forced={false} />
            <TortureSample forced={torture} />
          </div>
        </Section>

        <Section title="Touch targets — 44 min, 48 primary, 8 gap" note="Visible guides show the 44px floor and 8px separation. Never shrink a target to make a layout work.">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-target-gap)", alignItems: "center" }}>
            <TouchGuide size={44} label="44" />
            <TouchGuide size={48} label="48 primary" primary />
            <button style={{ ...btn, minHeight: "var(--ta-target-min)", minWidth: "var(--ta-target-min)" }}>44 button</button>
            <button style={{ ...btn, minHeight: "var(--ta-target-primary)", minWidth: "var(--ta-target-primary)" }}>48 primary</button>
          </div>
        </Section>

        <Section title={`Safe-area simulator (notched) — ${simSafe ? "ON" : "off"}`} note=".ta-safe respects env(safe-area-inset-*); the simulator drives the same vars so a notch can be previewed.">
          <button onClick={() => setSimSafe((v) => !v)} style={btn}>toggle notch</button>
          <div style={{ position: "relative", marginTop: "var(--ta-space-3)", borderRadius: "var(--ta-radius-4)", overflow: "hidden", border: "1px solid var(--ta-border-subtle)", ["--ta-safe-sim-top" as string]: simSafe ? "44px" : "0px", ["--ta-safe-sim-bottom" as string]: simSafe ? "34px" : "0px" } as React.CSSProperties}>
            <div className="ta-safe" style={{ background: "var(--ta-surface-overlay)", borderBottom: "1px solid var(--ta-border-subtle)" }}>
              <div style={{ padding: "8px 16px", ...S.mono }}>fixed top chrome</div>
            </div>
            <div style={{ padding: "var(--ta-space-6)", minHeight: 120, ...S.note, margin: 0 }}>content</div>
            <div className="ta-safe" style={{ background: "var(--ta-surface-overlay)", borderTop: "1px solid var(--ta-border-subtle)" }}>
              <div style={{ padding: "8px 16px", ...S.mono }}>fixed bottom chrome</div>
            </div>
          </div>
        </Section>

        <Section title="Container queries — components adapt to their container, not the viewport" note="Drag the slider: at the SAME viewport the card re-composes when its container crosses 480px. Pages use media queries; components use @container (mandatory Phase 3+).">
          <input type="range" min={240} max={900} value={cqW} onChange={(e) => setCqW(Number(e.target.value))} style={{ width: "100%", maxWidth: 400, minHeight: "var(--ta-target-min)" }} aria-label="container width" />
          <div style={{ ...S.mono, color: "var(--ta-text-muted)", margin: "4px 0 8px" }}>container = {cqW}px {cqW >= 480 ? "(≥480 → side-by-side)" : "(<480 → stacked)"}</div>
          <div className="ta-cq" style={{ width: cqW, maxWidth: "100%", border: "1px dashed var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-3)" }}>
            <div className="cq-card">
              <div style={{ ...S.card, background: "color-mix(in srgb, var(--ta-brand) 22%, transparent)" }}>media</div>
              <div style={S.card}>copy — re-composes by container width</div>
            </div>
          </div>
        </Section>

        <p style={{ ...S.note, marginTop: "var(--ta-space-section)" }}>Motion is never the only carrier of information. Layout is never the only carrier of structure.</p>
      </div>
    </div>
  );
}

/* ── bits ── */

const btn: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 16px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", cursor: "pointer" };

function Read({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ ...S.mono, color: "var(--ta-text-muted)" }}>{k}</div>
      <div style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-lg)", color: "var(--ta-signal)" }}>{v}</div>
    </div>
  );
}

function DensitySample({ label }: { label: string }) {
  return (
    <div style={S.card}>
      <div style={{ ...S.mono, color: "var(--ta-text-muted)", marginBottom: "var(--ta-space-stack)" }}>{label}</div>
      {["Row one", "Row two", "Row three"].map((t) => (
        <div key={t} style={{ padding: "var(--ta-pad-card)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", marginBottom: "var(--ta-space-stack)", background: "var(--ta-surface-sunken)" }}>
          <div style={{ fontSize: "var(--ta-text-sm)" }}>{t}</div>
          <div style={{ ...S.mono, color: "var(--ta-text-muted)" }}>stack/pad via role tokens</div>
        </div>
      ))}
    </div>
  );
}

function SampleCard(props: { title: string; body: string }) {
  return (
    <div style={S.card} data-cq-card>
      <div style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500 }}>{props.title}</div>
      <p style={{ ...S.note, margin: "var(--ta-space-stack) 0 0" }}>{props.body}</p>
    </div>
  );
}

function TortureSample({ forced }: { forced: boolean }) {
  const style: React.CSSProperties = forced
    ? { lineHeight: 1.5, letterSpacing: "0.12em", wordSpacing: "0.16em" }
    : {};
  return (
    <div style={{ ...S.card, ...style }}>
      <div style={{ ...S.mono, color: "var(--ta-text-muted)", marginBottom: forced ? "2em" : "var(--ta-space-stack)" }}>{forced ? "forced 1.5 / 2 / .12 / .16" : "normal rhythm"}</div>
      <p style={{ margin: 0, marginBottom: forced ? "2em" : "var(--ta-space-stack)" }}>Learning is not a straight line. A student revisits a proof, stalls on a step, and returns the next day with new eyes.</p>
      <p style={{ margin: 0 }}>The room must hold that messiness without breaking — text reflows, containers grow, nothing clips.</p>
    </div>
  );
}

function TouchGuide({ size, label, primary }: { size: number; label: string; primary?: boolean }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", inset: 0, border: "1px dashed var(--ta-signal)", borderRadius: "var(--ta-radius-2)" }} />
      <div style={{ position: "absolute", inset: 6, borderRadius: "var(--ta-radius-2)", background: primary ? "var(--ta-brand)" : "var(--ta-surface-raised)", border: "1px solid var(--ta-border-strong)" }} />
      <div style={{ position: "absolute", top: "100%", left: 0, ...S.mono, color: "var(--ta-text-muted)", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}
