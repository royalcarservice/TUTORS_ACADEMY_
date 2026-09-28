"use client";

import { BRAND, BrandLockup, BrandMark, BrandWordmark, type BrandVariant } from "@/components/brand/brand";

/* BANNED CLICHÉS (never drawn — kept as a comment, not rendered):
   graduation cap · owl · open book · pencil · lightbulb · brain · rocket ·
   atom · infinity loop · gradient orb · generic play-triangle · globe.      */

const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: 0 };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)" };
const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)" };

const SIZES = [16, 20, 24, 32, 64, 200];
const VARIANTS: Array<{ v: BrandVariant; label: string; bg?: string }> = [
  { v: "brass", label: "primary · brass (default)" },
  { v: "ink", label: "ink-only (on light)", bg: "var(--ta-ivory-50)" },
  { v: "ivory", label: "ivory / reversed (on dark)", bg: "var(--ta-ink-900)" },
  { v: "mono", label: "monochrome (currentColor)" },
];

export default function BrandSpecimen() {
  return (
    <div style={{ maxWidth: "100%", overflowX: "clip", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 2 · Step 6 · Part A — BRAND MARK (dev-only)</p>
        <h1 style={H1}>The Unbroken Line</h1>
        <p style={NOTE}>A single continuous stroke through the letterforms — discover → master is one path. Brand frame: identical in every subject environment; brass, always; never animated, never gradient.</p>

        <h2 style={H2}>Size ladder — does it read at 16px?</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-6)", alignItems: "flex-end" }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)", alignItems: "center" }}>
              <BrandMark size={s} strokeWidth={s <= 20 ? 3 : 2.5} />
              <span style={TAG}>{s}px</span>
            </div>
          ))}
        </div>

        <h2 style={H2}>Clear space — a ratio of the mark height</h2>
        <p style={NOTE}>Clear space = {BRAND.clearSpace} × mark height on all sides. Minimum lockup height = {BRAND.minLockupHeight}px.</p>
        <div style={{ display: "inline-block", padding: `calc(64px * ${BRAND.clearSpace})`, outline: "1px dashed var(--ta-signal)", background: "var(--ta-surface-sunken)" }}>
          <BrandMark size={64} />
        </div>

        <h2 style={H2}>Wordmark & lockup</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-6)" }}>
          <BrandWordmark />
          <BrandLockup variant="brass" markSize={32} />
          <div style={{ background: "var(--ta-ink-900)", padding: "var(--ta-space-4)", borderRadius: "var(--ta-radius-3)", width: "fit-content" }}>
            <BrandLockup variant="ivory" tone="inverse" markSize={32} />
          </div>
        </div>

        <h2 style={H2}>Variants</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--ta-space-4)" }}>
          {VARIANTS.map(({ v, label, bg }) => (
            <div key={v} style={{ background: bg ?? "var(--ta-surface-sunken)", padding: "var(--ta-space-4)", borderRadius: "var(--ta-radius-3)", color: "var(--ta-text-primary)" }}>
              <BrandMark size={48} variant={v} />
              <div style={{ ...TAG, marginTop: "var(--ta-space-2)" }}>{label}</div>
            </div>
          ))}
        </div>

        <h2 style={H2}>Favicon at real size</h2>
        <div style={{ display: "flex", gap: "var(--ta-space-4)", alignItems: "center" }}>
          <span style={{ background: "var(--ta-ink-900)", borderRadius: 3, display: "inline-flex", padding: 0 }}>
            <BrandMark size={16} strokeWidth={3} variant="brass" />
          </span>
          <span style={{ background: "var(--ta-ink-900)", borderRadius: 6, display: "inline-flex" }}>
            <BrandMark size={32} strokeWidth={3} variant="brass" />
          </span>
          <span style={TAG}>favicon = src/app/icon.svg (ink tile + heavier 3px stroke for 16px)</span>
        </div>

        <p style={{ ...NOTE, marginTop: "var(--ta-space-section)" }}>Type is the brand: the wordmark is set in the display family, never drawn. Subjects recolour the surface, never the mark.</p>
      </div>
    </div>
  );
}
