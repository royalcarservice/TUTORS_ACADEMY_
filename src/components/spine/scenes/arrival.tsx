import Link from "next/link";

import { buttonClass } from "@/components/ui/button";

import { ArrivalAmbience } from "./arrival-ambience";

/* ════════════════════════════════════════════════════════════════════════
   SCENE 0 — ARRIVAL (Phase 4 · Step 2), authored.

   LOCKED DECISIONS, AS BUILT:
   1. THE WORDS DO NOT ANIMATE. The h1 statement, supporting line and CTAs are
      server-rendered at full opacity; only the environmental layer settles
      (one --ta-dur-cinematic orient, JS-only, never under reduced motion).
   2. NO 3D. No canvas, no WebGL, no ambient chunk; the Stage is ink, type,
      the brand stroke language and brass — server-rendered vector.
   3. NO SUBJECT PREVIEW. One statement, one door. Choosing is Scene 3.
      (4.4: the primary CTA now points at Scene 3's anchor, #for-students —
      it was parked on /subjects only while Scene 3 did not exist.)
   4. NO ROTATION / CAROUSEL / AUTOPLAY / VIDEO. One statement. It stays.
   5. FITS THE VIEWPORT: statement + both CTAs visible without scroll at
      375×667 and 1280×800 (verified); the scroll cue only renders when the
      viewport is tall enough to be truthful.

   The environmental layer is ONE structural idea from the brand language
   (3.3's primitive vocabulary, brand-neutral): a single brass horizon — one
   line, three nodes — the surface the statement stands on. Restrained: one
   idea, not a scene. Brass is a seal, not a paint. No subject accent appears.
   ════════════════════════════════════════════════════════════════════════ */

export function ArrivalScene() {
  return (
    <div
      data-arrival
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        isolation: "isolate",
        overflow: "clip",
      }}
    >
      {/* environmental layer — settles around the statement; never the words */}
      <ArrivalAmbience />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1
          id="scene-arrival"
          style={{
            margin: 0,
            fontFamily: "var(--ta-font-display)",
            fontSize: "var(--ta-display-xl)",
            lineHeight: "var(--ta-leading-display-xl)",
            letterSpacing: "var(--ta-tracking-display-xl)",
            fontWeight: 500,
            color: "var(--ta-text-primary)",
            textWrap: "balance",
          }}
        >
          Every subject is a place you can enter.
        </h1>
        <p
          data-arrival-support
          style={{
            color: "var(--ta-text-secondary)",
            maxWidth: "var(--ta-measure)",
          }}
        >
          Each subject is its own environment. Choose one and step inside.
        </p>

        <div
          data-arrival-cta
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--ta-space-3)",
          }}
        >
          <Link href="#for-students" className={buttonClass("primary", "lg")}>
            Enter a world
          </Link>
          <Link href="#how-it-works" className={buttonClass("outline", "lg")}>
            Understand it
          </Link>
        </div>
      </div>

      {/* scroll cue — a REAL anchor to Scene 1; only when there is room. */}
      <style>{`
        [data-arrival] { padding-top: var(--ta-space-16); padding-bottom: var(--ta-space-12); }
        [data-arrival] h1 { max-width: 12ch; }
        [data-arrival-cta] { margin-top: var(--ta-space-6); }
        [data-arrival-support] { margin: var(--ta-space-4) 0 0; font-size: var(--ta-text-md); line-height: 1.6; }
        @media (max-height: 40rem) { [data-arrival-cue] { display: none; } }
        @media (max-height: 42rem), (max-width: 30rem) {
          [data-arrival] { padding-top: var(--ta-space-4); padding-bottom: var(--ta-space-12); }
          [data-arrival] h1 { max-width: 18ch; }
          [data-arrival-support] { margin-top: var(--ta-space-2); font-size: var(--ta-text-sm); }
          [data-arrival-cta] { margin-top: var(--ta-space-2); gap: var(--ta-space-2); }
          [data-arrival-support] { margin-top: var(--ta-space-2); }
        }
      `}</style>
      <a
        href="#how-it-works"
        data-arrival-cue
        className="ta-attention"
        aria-label="Continue to the premise"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          margin: "0 auto",
          width: "max-content",
          bottom: "var(--ta-space-4)",
          color: "var(--ta-text-muted)",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          fontSize: "var(--ta-text-2xs)",
          fontFamily: "var(--ta-font-mono)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
          minHeight: "var(--ta-target-min)",
          minWidth: "var(--ta-target-min)",
          justifyContent: "center",
        }}
      >
        <span aria-hidden>·</span>
        <span aria-hidden>↓</span>
      </a>
    </div>
  );
}
