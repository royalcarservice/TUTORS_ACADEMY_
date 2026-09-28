"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SubjectMark } from "@/components/brand/subject-mark";
import { Motif } from "@/components/motif/motif";
import { READING_COLUMN } from "@/components/motif/stage";
import { generateMotif } from "@/lib/motif/grammar";
import type { Density, MotifKind } from "@/lib/motif/types";
import { ceremonyFor, createSession, CEREMONY_SCALE, type CeremonySession } from "@/lib/switch/ceremony";
import { planFor, phaseAt, transferProgress, type Phase, type Tier } from "@/lib/switch/machine";
import { morphFor } from "@/lib/switch/morph";
import { selectTier } from "@/lib/switch/tier";

/* ════════════════════════════════════════════════════════════════════════
   SUBJECT SWITCH — orchestrator (client, progressive enhancement).

   The environment ALSO renders server-side with no transition (the dev route
   renders the current subject statically); this component only ANIMATES on
   user action. Direct load = correct, static, no-JS-correct.

   COLOUR TECHNIQUES (deliberately separate):
     · FULL-BLEED surfaces (the motif/substrate layers): LAYERED OPACITY
       CROSSFADE — we animate `opacity` on pre-rendered layers only (a
       compositor property). We never interpolate accent custom properties
       across a full-viewport surface.
     · SMALL elements (subject mark, name): TRUE ACCENT INTERPOLATION, because
       the painted area is small.

   CONVERGENCE: the rAF clamps to the plan total, `finish()` is idempotent, and
   every interruption path lands on a stable single-layer state.
   ════════════════════════════════════════════════════════════════════════ */

export interface SwitchSubject {
  id: string;
  name: string;
  tagline: string;
  motif: MotifKind;
  density: Density;
  accent: { ink: string; ivory: string };
}

export interface SwitchTelemetry {
  tier: Tier;
  reasons: string[];
  ceremony: string;
  worstFrameMs: number;
  longTasks: number;
  triggerToSettleMs: number | null;
  triggerToInteractiveMs: number | null;
  transcript: string[];
  prepMs: number;
  approach: string;
}

interface Layer {
  id: string;
  opacity: number;
}

const hex2rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpHex = (a: string, b: string, t: number) =>
  "#" +
  hex2rgb(a)
    .map((v, i) => Math.round(v + (hex2rgb(b)[i] - v) * t))
    .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
    .join("");

export interface SwitchApi {
  trigger: (id: string) => void;
  abort: () => void;
}

export function SubjectSwitchSurface({
  subjects,
  initialId,
  focusMode = "inline",
  devForceTier = null,
  devPrep = "ok",
  onTelemetry,
  apiRef,
  renderIdentity,
  announceFor,
  minHeight = 320,
}: {
  subjects: SwitchSubject[];
  initialId: string;
  focusMode?: "navigation" | "inline";
  devForceTier?: Tier | null;
  devPrep?: "ok" | "slow" | "fail";
  onTelemetry?: (t: SwitchTelemetry) => void;
  apiRef?: React.MutableRefObject<SwitchApi | null>;
  /* PRESENTATION SLOTS (Phase 4 · Step 5) — optional, default-preserving.
     The state machine, tiers, ceremony, morph decision and every timing above
     are untouched; a host may only swap WHAT the identity block renders and
     WHAT the live region says. Omit both and the 3.4 specimen renders as
     before. */
  renderIdentity?: (ctx: { current: SwitchSubject; color: string | null; phase: Phase; headingRef: React.RefObject<HTMLHeadingElement | null> }) => React.ReactNode;
  announceFor?: (s: SwitchSubject) => string;
  minHeight?: number | string;
}) {
  const byId = useMemo(() => {
    const m: Record<string, SwitchSubject> = {};
    for (const s of subjects) m[s.id] = s;
    return m;
  }, [subjects]);

  const [currentId, setCurrentId] = useState(initialId);
  const [layers, setLayers] = useState<Layer[]>([{ id: initialId, opacity: 1 }]);
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [announce, setAnnounce] = useState("");
  const [identityColor, setIdentityColor] = useState<string | null>(null);

  const session = useRef<CeremonySession>(createSession());
  const raf = useRef<number | null>(null);
  const recRaf = useRef<number | null>(null);
  const layerEls = useRef<Record<string, HTMLDivElement | null>>({});
  const frameTimes = useRef<number[]>([]);
  const longTasks = useRef(0);
  const transcript = useRef<string[]>([]);
  const lastAvgFrame = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const running = useRef(false);
  const currentIdRef = useRef(currentId);

  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  const current = byId[currentId] ?? subjects[0];

  /* Long-task observer (stutter readout); cleaned up on unmount. */
  useEffect(() => {
    let obs: PerformanceObserver | null = null;
    try {
      obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (e.duration > 50) longTasks.current++;
      });
      obs.observe({ entryTypes: ["longtask"] });
    } catch {
      obs = null;
    }
    return () => obs?.disconnect();
  }, []);

  const announceText = useCallback((s: SwitchSubject) => (announceFor ? announceFor(s) : `Now entering ${s.name} — ${s.tagline}`), [announceFor]);

  const say = useCallback((msg: string) => {
    transcript.current = [...transcript.current.slice(-7), msg];
    setAnnounce(msg);
  }, []);

  const emit = useCallback(
    (x: { tier: Tier; reasons: string[]; ceremony: string; prepMs: number; approach: string; settle?: number; interactive?: number }) => {
      onTelemetry?.({
        tier: x.tier,
        reasons: x.reasons,
        ceremony: x.ceremony,
        worstFrameMs: frameTimes.current.length ? Math.round(Math.max(...frameTimes.current) * 10) / 10 : 0,
        longTasks: longTasks.current,
        triggerToSettleMs: x.settle ?? null,
        triggerToInteractiveMs: x.interactive ?? null,
        transcript: [...transcript.current],
        prepMs: Math.round(x.prepMs * 10) / 10,
        approach: x.approach,
      });
    },
    [onTelemetry],
  );

  const finish = useCallback(
    (toId: string, opts: { announce: boolean; focus: boolean }) => {
      running.current = false;
      if (raf.current != null) cancelAnimationFrame(raf.current);
      if (recRaf.current != null) cancelAnimationFrame(recRaf.current);
      raf.current = null;
      recRaf.current = null;
      setLayers([{ id: toId, opacity: 1 }]);
      setCurrentId(toId);
      setIdentityColor(null);
      setPhase("IDLE");
      const t = byId[toId];
      if (opts.announce && t) say(announceText(t));
      if (opts.focus && focusMode === "navigation") headingRef.current?.focus();
    },
    [byId, focusMode, say, announceText],
  );

  /* Tab backgrounded mid-flight: COMPLETE INSTANTLY (documented choice). */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && running.current) finish(currentIdRef.current, { announce: true, focus: false });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [finish]);

  const measurePrep = useCallback(
    (to: SwitchSubject): { ms: number; ok: boolean } => {
      const t0 = performance.now();
      if (devPrep === "fail") return { ms: performance.now() - t0, ok: false };
      if (devPrep === "slow") {
        const until = performance.now() + 140;
        while (performance.now() < until) {
          /* bounded busy-wait to exceed the prepare budget */
        }
      }
      try {
        generateMotif({ subject: to.id, kind: to.motif, role: "substrate", density: to.density, purpose: "prepare" });
      } catch {
        return { ms: performance.now() - t0, ok: false };
      }
      return { ms: performance.now() - t0, ok: true };
    },
    [devPrep],
  );

  const trigger = useCallback(
    (toId: string) => {
      const to = byId[toId];
      if (!to) return;
      if (toId === currentIdRef.current && !running.current) return;

      // INTERRUPT: retarget from the current visual state; never queue, never
      // snap back. Cancel the old timeline and start a fresh one.
      if (raf.current != null) cancelAnimationFrame(raf.current);
      if (recRaf.current != null) cancelAnimationFrame(recRaf.current);
      running.current = true;

      const now = performance.now();
      const ceremony = ceremonyFor(session.current, toId, now);
      const rm =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
        document.documentElement.getAttribute("data-reduced-motion") === "on";
      const decision = selectTier({
        prefersReducedMotion: !!rm,
        forced: devForceTier,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
        viewportWidth: window.innerWidth,
        coarsePointer: window.matchMedia?.("(pointer: coarse)").matches || false,
        avgFrameMs: lastAvgFrame.current,
        preparationOk: true,
        ceremony,
      });

      const prep = measurePrep(to);
      let tier: Tier = decision.tier;
      const reasons = [...decision.reasons];
      if (!prep.ok) {
        tier = "instant";
        reasons.push("preparation failed → instant, honest fallback");
      } else if (prep.ms > planFor(tier).prepareBudget) {
        const order: Tier[] = ["full", "reduced", "short", "instant"];
        tier = order[Math.min(order.length - 1, order.indexOf(tier) + 1)];
        reasons.push(`prep ${prep.ms.toFixed(0)}ms over budget → transition shortened`);
      }

      const morph = morphFor(byId[currentIdRef.current]?.motif ?? to.motif, to.motif);

      // INSTANT: state swap + announcement; full function, no motion.
      if (tier === "instant") {
        finish(toId, { announce: true, focus: focusMode === "navigation" });
        emit({ tier, reasons, ceremony, prepMs: prep.ms, approach: morph.approach, settle: 0, interactive: 0 });
        return;
      }

      const plan = planFor(tier);
      const scale = ceremony === "full" ? 1 : CEREMONY_SCALE[ceremony] || 1;
      const total = Math.max(1, Math.round(plan.total * scale));
      const fromId = currentIdRef.current;
      const from = byId[fromId];

      // PREPARE done: destination present. Ensure both layers exist.
      setLayers((ls) => {
        const next: Layer[] = ls.filter((l) => l.id === fromId || l.opacity > 0.01);
        if (!next.some((l) => l.id === fromId)) next.push({ id: fromId, opacity: 1 });
        if (!next.some((l) => l.id === toId)) next.push({ id: toId, opacity: 0 });
        return next.map((l) => (l.id === toId ? { ...l, opacity: 0 } : { ...l, opacity: 1 }));
      });

      setPhase("PREPARE");
      const t0 = performance.now();
      frameTimes.current = [];
      let announced = false;
      let interactive = false;

      const k = total / plan.total;
      const spans = plan.spans.map((s) => ({ ...s, start: s.start * k, end: s.end * k }));
      const interactiveAt = plan.interactiveAt * k;

      const tick = () => {
        const t = performance.now() - t0;
        const clamped = Math.min(t, total);
        const ph = phaseAt({ ...plan, spans, total }, clamped);
        setPhase(ph);
        const p = transferProgress({ ...plan, spans, total }, clamped);

        const fromEl = layerEls.current[fromId];
        const toEl = layerEls.current[toId];
        if (fromEl) fromEl.style.opacity = String(1 - p);
        if (toEl) toEl.style.opacity = String(p);

        if (from && to) {
          const themeKey = document.documentElement.getAttribute("data-theme") === "light" ? "ivory" : "ink";
          setIdentityColor(lerpHex(from.accent[themeKey], to.accent[themeKey], p));
        }

        if (!interactive && clamped >= interactiveAt) {
          interactive = true;
          setCurrentId(toId);
        }
        if (!announced && (ph === "ARRIVE" || clamped >= interactiveAt)) {
          announced = true;
          say(announceText(to));
        }

        if (clamped >= total) {
          if (frameTimes.current.length) lastAvgFrame.current = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
          finish(toId, { announce: !announced, focus: focusMode === "navigation" });
          emit({ tier, reasons, ceremony, prepMs: prep.ms, approach: morph.approach, settle: performance.now() - t0, interactive: interactiveAt });
          return;
        }
        raf.current = requestAnimationFrame(tick);
      };

      let last = performance.now();
      const rec = () => {
        const n = performance.now();
        frameTimes.current.push(n - last);
        last = n;
        if (running.current) recRaf.current = requestAnimationFrame(rec);
      };
      recRaf.current = requestAnimationFrame(rec);
      raf.current = requestAnimationFrame(tick);
    },
    [byId, devForceTier, emit, finish, focusMode, measurePrep, say, announceText],
  );

  const abort = useCallback(() => finish(currentIdRef.current, { announce: false, focus: false }), [finish]);

  /* Expose an imperative handle for the specimen (and later route wiring). */
  useEffect(() => {
    if (apiRef) apiRef.current = { trigger, abort };
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef, trigger, abort]);

  useEffect(
    () => () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      if (recRaf.current != null) cancelAnimationFrame(recRaf.current);
    },
    [],
  );

  return (
    <div data-switch-surface style={{ position: "relative", isolation: "isolate", overflow: "clip", minHeight }}>
      {layers.map((l) => (
        <div
          key={l.id}
          ref={(el) => {
            layerEls.current[l.id] = el;
          }}
          data-subject={l.id}
          data-switch-layer={l.id}
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, opacity: l.opacity, background: "var(--ta-surface-base)", pointerEvents: "none", zIndex: 0 }}
        >
          <Motif subject={l.id} kind={byId[l.id].motif} role="substrate" density={byId[l.id].density} purpose="switch" exclude={[READING_COLUMN]} />
        </div>
      ))}

      {renderIdentity ? (
        <div style={{ position: "relative", zIndex: 1 }}>{renderIdentity({ current, color: identityColor, phase, headingRef })}</div>
      ) : (
      <div style={{ position: "relative", zIndex: 1, padding: "var(--ta-space-6)", display: "flex", alignItems: "center", gap: "var(--ta-space-4)" }}>
        <span data-subject={currentId} style={{ color: identityColor ?? "var(--ta-accent-1)", display: "inline-flex" }}>
          <SubjectMark subject={currentId} size={48} />
        </span>
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            data-switch-identity
            style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", color: identityColor ?? "var(--ta-accent-1)", outline: "none" }}
          >
            {current.name}
          </h2>
          <p style={{ margin: 0, color: "var(--ta-text-secondary)", fontSize: "var(--ta-text-sm)" }}>{current.tagline}</p>
        </div>
        <span data-switch-phase style={{ marginLeft: "auto", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)" }}>
          {phase}
        </span>
      </div>
      )}

      <div
        aria-live="polite"
        role="status"
        data-switch-announce
        style={{ position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}
      >
        {announce}
      </div>
    </div>
  );
}
