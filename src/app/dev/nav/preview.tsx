"use client";

import { useEffect, useState } from "react";
import { NavShell } from "@/components/layout/nav-shell";
import { ThemePrepaint } from "@/components/layout/theme";

const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)" };
const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)" };

const STAGE_ITEMS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For students", href: "/#for-students" },
  { label: "For tutors", href: "/#for-tutors" },
  { label: "Nav specimen", href: "/dev/nav" },
];
const ROOM_ITEMS = [
  { label: "Overview", href: "/student" },
  { label: "Classes", href: "/student" },
  { label: "Progress", href: "/student" },
];

export default function NavSpecimen() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute("data-reduced-motion", reduced ? "on" : "off");
    return () => document.documentElement.setAttribute("data-reduced-motion", "off");
  }, [reduced]);

  return (
    <div style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh" }}>
      <ThemePrepaint />
      {/* REAL sticky Stage shell — scroll to see transparent → solid (opacity only) */}
      <NavShell mode="stage" items={STAGE_ITEMS} />

      <main id="main">
      <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 2 · Step 6 · Part C — NAVIGATION SHELL (dev-only)</p>
        <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500 }}>Two modes, one shell</h1>
        <p style={NOTE}>Stage floats over content and materialises on scroll (opacity/transform only). Room is solid compact chrome. Reduced motion: <button onClick={() => setReduced((r) => !r)} style={{ color: "var(--ta-signal)", background: "none", border: "none", cursor: "pointer", font: "inherit", textDecoration: "underline" }}>{reduced ? "on" : "off"}</button>. The sticky shell above is live — scroll the page.</p>

        <p style={{ ...NOTE, border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-3)", padding: "var(--ta-space-3)" }}>
          <strong>REAL vs PLACEHOLDER:</strong> theme toggle = REAL (persisted, pre-paint). “Sign in / Create account” = REAL routes (/login, /register) but the auth backend is NOT built — they lead to explicit placeholders. Nav anchors resolve to public-page sections. No fake avatar or account menu is rendered.
        </p>

        <h2 style={H2}>Room mode (solid, compact)</h2>
        <div style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-3)", overflow: "auto", maxHeight: 320, background: "var(--ta-surface-sunken)" }}>
          <NavShell mode="room" items={ROOM_ITEMS} navLabel="Student portal" />
          <div style={{ height: 480, padding: "var(--ta-space-6)" }}><p style={NOTE}>Scrollable Room frame — the shell stays solid.</p></div>
        </div>

        <h2 style={H2}>Mobile (375px frame) — open, trap, Esc, return</h2>
        <div style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-3)", overflow: "hidden", maxWidth: 375, background: "var(--ta-surface-sunken)" }}>
          <NavShell mode="stage" items={STAGE_ITEMS} navLabel="Demo stage" />
          <div style={{ height: 300, padding: "var(--ta-space-4)" }}><p style={NOTE}>Use the trigger; Esc closes and returns focus; focus is trapped; background scroll locks without layout shift.</p></div>
        </div>

        <div style={{ height: "60vh" }} />
      </div>
      </main>
    </div>
  );
}
