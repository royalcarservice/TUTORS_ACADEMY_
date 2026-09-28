"use client";

import Link from "next/link";

import { isOpen } from "@/lib/subjects/door";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SubjectMark } from "@/components/brand/subject-mark";
import { SubjectSwitchSurface, type SwitchApi, type SwitchSubject, type SwitchTelemetry } from "@/components/switch/subject-switch";
import { buttonClass } from "@/components/ui/button";
import type { Density, MotifKind } from "@/lib/motif/types";

/* ════════════════════════════════════════════════════════════════════════
   SCENE 4 — ENTER · THE CROSSING (Phase 4 · Step 5), authored.

   THE TRANSFORMATION IS THE CONTENT. One environment at full Stage scale;
   a control that STEPS between environments; the 3.4 switch doing the
   moving. Scene 3 was the visitor's decision — this is the system's move.

   LOCKED, AS BUILT:
   1. NOT A CHOOSER. Two step buttons (previous / next). No subject list, no
      "choose/select/pick/start". All six are reachable by stepping.
   2. THE 3.4 ENGINE, UNCHANGED. `SubjectSwitchSurface` runs the state
      machine, tiers, ceremony rationing, morph decision and announcement.
      This file contains NO transition code: it calls `trigger(id)`.
   3. ONE SUBSTRATE AT A TIME. The surface renders the current layer only,
      plus the incoming layer during TRANSFER. Nothing is pre-rendered.
   4. THE PAGE'S ONE STICKY-STAGE. The hold is spine-owned (scene-slot);
      this file provides the RELEASE RULE (`ENTER_STICKY_RULE` below): the
      hold exists only when JS is live, motion is allowed, the viewport is
      ≥48rem wide and ≥30rem tall. Otherwise the scene is static and flows.
   5. NO AMBIENT, NO 3D, NO CANVAS. The vector substrate at Stage scale is
      the strongest material we have; depth stays inside the route — that
      is the reason to cross (the two-level product).
   6. ELIGIBILITY IS CONFIG-DRIVEN. `status !== "draft"` → real <a> to
      /subjects/[id]. Draft → the 3.6 "in foundation" treatment: text, not
      a link, not focusable. A draft's Stage is otherwise identical.
   7. FOCUS NEVER MOVES ON STEP (inline trigger). Announcement once per step
      via the engine's single polite live region.
   ════════════════════════════════════════════════════════════════════════ */

export interface EnterEntry {
  id: string;
  name: string;
  href: string;
  motif?: string;
  density?: string;
  status?: string;
  tagline?: string;
  accent?: { ink: string; ivory: string };
}

/* ALL AUTHORED COPY, exported for the dev specimen and the report. */
export const ENTER_COPY = {
  eyebrow: "The crossing",
  heading: "The environment becomes the subject.",
  /* Lead A — SHIPPED. Emphasis: the move itself; the visitor watches. */
  lead: "You have seen six environments side by side. Now watch one become another. The mark, the wordmark, the type and the controls hold still. Only the environment moves.",
  /* Lead B — not shipped. Emphasis: the two-level product (why cross). */
  leadCandidateB: "This page shows each environment's identity. Its depth is inside. Step between the six here, then go through the door of the one you came for.",
  /* Control framing — Candidate 1 SHIPPED; 2 and 3 in the report. */
  controlLabel: "Step between environments",
  controlCandidate2: "Cross to the next environment",
  controlCandidate3: "Move through the six",
  prev: "Previous environment",
  next: "Next environment",
  /* Stage caption — the constant frame made legible in words. */
  constant: "What stays: the mark, the wordmark, the nav, the type. What changes: the environment.",
  /* CTA — eligibility-aware. */
  ctaReady: (name: string) => `Enter ${name}`,
  ctaDepth: "Inside, the environment runs its ambient layer. This page never loads it.",
  inFoundation: "In foundation",
  inFoundationLine: "This environment is built. Its door is not open.",
  /* Announcement — once per step, polite, via the 3.4 live region. */
  announce: (name: string, env: string) => `Now showing ${name} — ${env}.`,
} as const;

/** THE STICKY RELEASE RULE (reported verbatim on the specimen). */
export const ENTER_STICKY_RULE =
  'The spine pins Scene 4 (section 160vh, inner sticky 100vh). Scene 4 releases the pin — position:static, section height auto — when ANY of: no JS (a <noscript> style); prefers-reduced-motion or [data-reduced-motion="on"]; viewport width < 48rem; viewport height < 30rem (mirrors the 2.6 nav rule). 400% zoom on a 1280×800 window is a 320×200 CSS viewport and satisfies both size clauses.';

export function environmentName(tagline?: string) {
  if (!tagline) return "";
  return tagline.split(" — ")[0].trim();
}
export function taglineRest(tagline?: string) {
  if (!tagline) return "";
  const i = tagline.indexOf(" — ");
  return i === -1 ? tagline : tagline.slice(i + 3).trim();
}
/* 5.5: the door predicate now lives in src/lib/subjects/door.ts (one place, readable by the server-side enrolment predicate). Re-exported unchanged. */
export { isOpen };
/** Default environment: first ready in config order; else the first entry. */
export function defaultEnvironment(entries: EnterEntry[]) {
  return (entries.find(isOpen) ?? entries[0])?.id ?? "";
}

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

const FALLBACK_ACCENT = { ink: "#ffffff", ivory: "#000000" };

export function EnterScene({
  entries = [],
  initialId,
  onTelemetry,
  onStep,
}: {
  entries?: EnterEntry[];
  /** Specimen override; production uses the default rule. */
  initialId?: string;
  onTelemetry?: (t: SwitchTelemetry) => void;
  onStep?: (id: string) => void;
}) {
  const subjects = useMemo<SwitchSubject[]>(
    () =>
      entries.map((e) => ({
        id: e.id,
        name: e.name,
        tagline: e.tagline ?? "",
        motif: (e.motif ?? "lattice") as MotifKind,
        density: (e.density ?? "balanced") as Density,
        accent: e.accent ?? FALLBACK_ACCENT,
      })),
    [entries],
  );
  const byId = useMemo(() => Object.fromEntries(entries.map((e) => [e.id, e])), [entries]);
  const startId = initialId ?? defaultEnvironment(entries);

  const api = useRef<SwitchApi | null>(null);
  const stepped = useRef(false);
  /* The control's position = the last TARGET (so rapid stepping never lags). */
  const [target, setTarget] = useState(startId);

  /* Scene 3 handoff — receiving side of CHOICE_HANDOFF. Scene 3 does not
     dispatch today (it is frozen), so this path is documented-but-inert:
     when it does, the drawn-to door becomes the initial environment with no
     change here. Never persisted; ignored once the visitor has stepped. */
  useEffect(() => {
    const onDoor = (ev: Event) => {
      const id = (ev as CustomEvent<{ id?: string }>).detail?.id;
      if (!id || stepped.current || !byId[id]) return;
      setTarget(id);
      api.current?.trigger(id);
    };
    document.addEventListener("ta:door", onDoor);
    return () => document.removeEventListener("ta:door", onDoor);
  }, [byId]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!entries.length) return;
      const i = Math.max(0, entries.findIndex((e) => e.id === target));
      const next = entries[(i + dir + entries.length) % entries.length].id;
      stepped.current = true;
      setTarget(next);
      onStep?.(next);
      api.current?.trigger(next);
    },
    [entries, target, onStep],
  );

  const announceFor = useCallback((s: SwitchSubject) => ENTER_COPY.announce(s.name, environmentName(s.tagline)), []);
  /* Dev-only: the engine's last tier/ceremony, readable by the harness on `/`. */
  const [devTier, setDevTier] = useState("");
  const telemetry = useCallback(
    (t: SwitchTelemetry) => {
      if (process.env.NODE_ENV !== "production") setDevTier(`${t.tier}/${t.ceremony}/${t.approach}/settle ${t.triggerToSettleMs == null ? "-" : Math.round(t.triggerToSettleMs)}ms/worst ${t.worstFrameMs}ms`);
      onTelemetry?.(t);
    },
    [onTelemetry],
  );

  if (!entries.length) return null;
  const position = entries.findIndex((e) => e.id === target);

  return (
    <div data-enter data-enter-tier={process.env.NODE_ENV !== "production" && devTier ? devTier : undefined}>
      <style>{`
        /* ── STICKY RELEASE RULE (see ENTER_STICKY_RULE) ─────────────────── */
        @media (max-width: 47.99rem), (max-height: 29.99rem), (prefers-reduced-motion: reduce) {
          section[data-scene="enter"] { height: auto !important; min-height: 0 !important; }
          section[data-scene="enter"] > div { position: static !important; min-height: 0 !important; }
        }
        [data-reduced-motion="on"] section[data-scene="enter"] { height: auto !important; min-height: 0 !important; }
        [data-reduced-motion="on"] section[data-scene="enter"] > div { position: static !important; min-height: 0 !important; }
        section[data-scene="enter"] > div { padding-block: var(--ta-space-6); box-sizing: border-box; }

        /* ── STAGE ──────────────────────────────────────────────────────── */
        [data-enter-stage] { margin: var(--ta-space-4) 0 0; border: 1px solid var(--ta-border-subtle); border-radius: var(--ta-radius-2); overflow: clip; }
        [data-enter-stage] [data-switch-surface] { min-height: min(26rem, 46vh) !important; display: flex; flex-direction: column; }
        [data-enter-stage] [data-switch-surface] > div:not([data-switch-layer]):not([data-switch-announce]) { flex: 1; display: flex; }
        [data-enter-identity] { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--ta-space-5); align-items: start; align-content: center; padding: var(--ta-space-6) var(--ta-space-8); width: 100%; }
        [data-enter-mark] { color: var(--ta-accent-1); display: block; line-height: 0; }
        [data-enter-mark] svg { width: 72px; height: 72px; }
        [data-enter-name] { margin: 0; font-family: var(--ta-font-display); font-weight: 500; font-size: var(--ta-display-md); line-height: 1; color: var(--ta-text-primary); }
        [data-enter-env] { font-family: var(--ta-font-mono); font-size: var(--ta-text-xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-accent-1); margin: var(--ta-space-2) 0 0; }
        [data-enter-tagline] { margin: var(--ta-space-3) 0 0; font-size: var(--ta-text-lg); color: var(--ta-text-secondary); max-width: 28rem; line-height: 1.45; }
        [data-enter-action] { margin-top: var(--ta-space-5); display: grid; gap: var(--ta-space-3); justify-items: start; }
        [data-enter-depth] { margin: 0; font-size: var(--ta-text-sm); color: var(--ta-text-muted); max-width: 28rem; }
        [data-enter-status] { font-family: var(--ta-font-mono); font-size: var(--ta-text-xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-muted); display: inline-flex; align-items: center; min-height: var(--ta-control-h); padding-inline: var(--ta-space-1); box-shadow: inset 0 -1px 0 var(--ta-accent-3); }
        [data-enter-caption] { margin: var(--ta-space-3) 0 0; }

        /* ── CONTROL — steps, never chooses ─────────────────────────────── */
        [data-enter-control] { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ta-space-3); margin-top: var(--ta-space-5); }
        [data-enter-control] button { min-height: var(--ta-target-min); min-width: var(--ta-target-min); }
        [data-enter-control] button:focus-visible { outline: 2px solid var(--ta-focus-ring); outline-offset: 2px; }
        [data-enter-position] { font-family: var(--ta-font-mono); font-size: var(--ta-text-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-muted); margin: 0 0 0 var(--ta-space-2); }

        @media (max-width: 48rem) {
          [data-enter-identity] { grid-template-columns: 1fr; gap: var(--ta-space-4); padding: var(--ta-space-6) var(--ta-space-5); }
          [data-enter-mark] svg { width: 48px; height: 48px; }
          [data-enter-name] { font-size: var(--ta-display-sm); }
          [data-enter-tagline] { font-size: var(--ta-text-md); }
          [data-enter-stage] [data-switch-surface] { min-height: 0 !important; }
        }
        @media (max-width: 30rem) {
          [data-enter-identity] { padding: var(--ta-space-5) var(--ta-space-4); }
          [data-enter-name] { font-size: var(--ta-display-xs); }
          [data-enter-position] { width: 100%; margin: 0; }
        }
      `}</style>
      {/* NO JS → the pin is released and the stepping control is withheld (it
          would be inert). visibility, not display, so nothing shifts. */}
      <noscript>
        <style>{`section[data-scene="enter"] { height: auto !important; min-height: 0 !important; } section[data-scene="enter"] > div { position: static !important; min-height: 0 !important; } [data-enter-control] { visibility: hidden; }`}</style>
      </noscript>

      <p style={MONO}>{ENTER_COPY.eyebrow}</p>
      <h2
        id="scene-enter"
        style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, color: "var(--ta-text-primary)" }}
      >
        {ENTER_COPY.heading}
      </h2>
      <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-md)", color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)", lineHeight: 1.6 }}>
        {ENTER_COPY.lead}
      </p>

      <div data-enter-control role="group" aria-label={ENTER_COPY.controlLabel}>
        <button type="button" className={buttonClass("outline", "md")} onClick={() => step(-1)} data-enter-prev>
          <span aria-hidden="true">←</span> {ENTER_COPY.prev}
        </button>
        <button type="button" className={buttonClass("outline", "md")} onClick={() => step(1)} data-enter-next>
          {ENTER_COPY.next} <span aria-hidden="true">→</span>
        </button>
        <p data-enter-position>{`${byId[target]?.name} · ${numberWord(position + 1)} of ${numberWord(entries.length)}`}</p>
      </div>

      <div data-enter-stage>
        <SubjectSwitchSurface
          subjects={subjects}
          initialId={startId}
          focusMode="inline"
          apiRef={api}
          onTelemetry={telemetry}
          announceFor={announceFor}
          minHeight={0}
          renderIdentity={({ current, color }) => {
            const e = byId[current.id];
            const open = isOpen(e);
            const env = environmentName(current.tagline);
            return (
              <div data-enter-identity data-subject={current.id} data-spatial="stage" data-enter-open={open ? "true" : "false"}>
                <span data-enter-mark aria-hidden="true" style={color ? { color } : undefined}>
                  <SubjectMark subject={current.id} size={48} />
                </span>
                <div>
                  <p style={MONO}>Environment</p>
                  <h3 data-enter-name>{current.name}</h3>
                  <p data-enter-env style={color ? { color } : undefined}>
                    {env}
                  </p>
                  <p data-enter-tagline>{taglineRest(current.tagline)}</p>
                  <div data-enter-action>
                    {open ? (
                      <>
                        <Link href={e.href} className={buttonClass("primary", "lg")} data-enter-cta>
                          {ENTER_COPY.ctaReady(current.name)}
                        </Link>
                        <p data-enter-depth>{ENTER_COPY.ctaDepth}</p>
                      </>
                    ) : (
                      <>
                        <span data-enter-status>{ENTER_COPY.inFoundation}</span>
                        <p data-enter-depth>{ENTER_COPY.inFoundationLine}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
      <p data-enter-caption style={MONO}>{ENTER_COPY.constant}</p>

    </div>
  );
}

const numberWord = (n: number) => ["zero", "one", "two", "three", "four", "five", "six"][n] ?? String(n);
