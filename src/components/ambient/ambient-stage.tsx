"use client";

import { useEffect, useRef, useState } from "react";

import { Motif } from "@/components/motif/motif";
import { READING_COLUMN } from "@/components/motif/stage";
import type { Density, MotifKind } from "@/lib/motif/types";
import { MOTION_CHAR_PARAMS, type AmbientColor } from "@/lib/ambient/contract";
import { decideAmbient, gatherSignals, withBattery } from "@/lib/ambient/eligibility";
import type { AmbientStats, ResourceReport } from "@/lib/ambient/webgl-lattice";

/* ════════════════════════════════════════════════════════════════════════
   AMBIENT STAGE — one canvas, one role, Stage only.

   · The SVG substrate (3.3) renders FIRST and is always the baseline; the
     WebGL lens is layered on top, absolutely positioned, and fades in only
     when ready — no spinner, no layout shift.
   · NEVER IN A ROOM: `scope !== "stage"` refuses the canvas in code.
   · Lazy-loaded: `webgl-lattice` is imported dynamically, so it is never in
     the initial bundle and is absent from any Room bundle.
   · Lifecycle enforced: off-screen pause, blur/tab stop, frame-budget auto
     suspend, reduced-motion off, context-loss fallback. Disposal on unmount.
   · aria-hidden, not focusable, nothing interactive.
   ════════════════════════════════════════════════════════════════════════ */

export interface AmbientSubject {
  id: string;
  name: string;
  motif: MotifKind;
  density: Density;
  motionChar: string;
  accent: { ink: string; ivory: string };
}

export interface AmbientState {
  scope: string;
  refused: boolean;
  loadState: "svg" | "loading" | "active" | "fallback" | "suspended" | "off";
  reasons: string[];
  stats: AmbientStats | null;
  resources: ResourceReport | null;
}

const hexTo01 = (h: string): AmbientColor => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
});

export interface AmbientApi {
  suspend: (reason: string) => void;
  loseContext: () => void;
  restore: () => void;
  report: () => ResourceReport | null;
}

export function AmbientStage({
  subject,
  scope = "stage",
  forced = null,
  reduced = false,
  devOverride = null,
  apiRef,
  onState,
  children,
}: {
  subject: AmbientSubject;
  scope?: "stage" | "room";
  forced?: boolean | null;
  reduced?: boolean;
  devOverride?: Partial<import("@/lib/ambient/eligibility").AmbientSignals> | null;
  apiRef?: React.MutableRefObject<AmbientApi | null>;
  onState?: (s: AmbientState) => void;
  children?: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [canvasOn, setCanvasOn] = useState(false);

  const report = useRef<(s: AmbientState) => void>(() => {});
  useEffect(() => {
    report.current = (s: AmbientState) => onState?.(s);
  });

  useEffect(() => {
    // ROOM REFUSES THE CANVAS — enforced in code, not convention.
    if (scope !== "stage") {
      report.current({ scope, refused: true, loadState: "off", reasons: ["scope=room → ambient canvas refused (Rooms are for working)"], stats: null, resources: null });
      return;
    }

    let disposed = false;
    let instance: import("@/lib/ambient/webgl-lattice").LatticeAmbient | null = null;
    let io: IntersectionObserver | null = null;
    let eligibleOn = false;
    let lastStats: AmbientStats | null = null;
    let loadState: AmbientState["loadState"] = "svg";
    let reasons: string[] = [];

    const push = () =>
      report.current({
        scope,
        refused: false,
        loadState,
        reasons,
        stats: lastStats,
        resources: instance ? instance.resourceReport() : null,
      });

    const cleanup = () => {
      io?.disconnect();
      instance?.dispose();
      instance = null;
    };

    const teardown: (() => void)[] = [];

    (async () => {
      let signals = gatherSignals();
      if (reduced) signals = { ...signals, reducedMotion: true };
      signals = await withBattery(signals);
      if (devOverride) signals = { ...signals, ...devOverride };
      if (disposed) return;
      const decision = decideAmbient(signals, forced);
      reasons = decision.reasons;
      eligibleOn = decision.on;

      if (!decision.on) {
        loadState = reduced || signals.reducedMotion ? "off" : "svg";
        setCanvasOn(false);
        push();
        return;
      }

      loadState = "loading";
      push();
      const [{ LatticeAmbient, GLOBAL_RESOURCES }, { toSpatial: toSp }, { generateMotif: gen }] = await Promise.all([
        import("@/lib/ambient/webgl-lattice"),
        import("@/lib/ambient/contract"),
        import("@/lib/motif/grammar"),
      ]);
      if (disposed) return;

      const data = gen({ subject: subject.id, kind: subject.motif, role: "substrate", density: subject.density, purpose: "ambient" });
      const char = MOTION_CHAR_PARAMS[subject.motionChar] ?? MOTION_CHAR_PARAMS.precise;
      const input = toSp(data, char);
      const theme = document.documentElement.getAttribute("data-theme") === "light" ? "ivory" : "ink";
      const canvas = canvasRef.current;
      if (!canvas) return;

      instance = new LatticeAmbient(canvas, input, {
        color: hexTo01(subject.accent[theme]),
        cycleSeconds: char.cycleSeconds,
        maxCameraMove: char.maxCameraMove,
        maxParallax: char.maxParallax,
        onStats: (s) => {
          lastStats = s;
          push();
        },
        onLost: () => {
          loadState = "fallback";
          setCanvasOn(false);
          push();
        },
        onRestored: () => {
          if (eligibleOn && !document.hidden) {
            loadState = "active";
            instance?.resize(Math.min(1.5, window.devicePixelRatio || 1));
            instance?.start();
            setCanvasOn(true);
            push();
          }
        },
        onAutoSuspend: (why) => {
          loadState = "suspended";
          reasons = [...reasons, `auto-suspend: ${why}`];
          setCanvasOn(false);
          push();
        },
      });

      if (apiRef)
        apiRef.current = {
          suspend: (r) => instance?.suspendNow(r),
          loseContext: () => instance?.forceContextLoss(),
          restore: () => instance?.forceRestore(),
          report: () => instance?.resourceReport() ?? null,
        };

      if (!instance.initGL()) {
        loadState = "svg";
        reasons = [...reasons, "WebGL init failed → SVG substrate"];
        setCanvasOn(false);
        push();
        return;
      }
      instance.resize(Math.min(1.5, window.devicePixelRatio || 1));
      instance.start();
      loadState = "active";
      setCanvasOn(true);
      push();
      void GLOBAL_RESOURCES;

      // OFF-SCREEN PAUSE
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!instance) continue;
            if (e.isIntersecting) instance.start();
            else instance.pause();
          }
        },
        { threshold: 0.05 },
      );
      if (rootRef.current) io.observe(rootRef.current);

      // BLUR / BACKGROUND STOP
      const onVis = () => {
        if (!instance) return;
        if (document.hidden) instance.pause();
        else if (eligibleOn) instance.start();
      };
      const onBlur = () => instance?.pause();
      const onFocus = () => eligibleOn && instance?.start();
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("blur", onBlur);
      window.addEventListener("focus", onFocus);
      teardown.push(() => {
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("blur", onBlur);
        window.removeEventListener("focus", onFocus);
      });
    })();

    return () => {
      disposed = true;
      for (const t of teardown) t();
      if (apiRef) apiRef.current = null;
      cleanup();
    };
  }, [scope, forced, reduced, devOverride, apiRef, subject.id, subject.motif, subject.density, subject.motionChar, subject.accent]);

  return (
    <div ref={rootRef} data-ambient-scope={scope} style={{ position: "relative", isolation: "isolate", overflow: "clip", minHeight: 360 }}>
      <Motif subject={subject.id} kind={subject.motif} role="substrate" density={subject.density} purpose="ambient" exclude={[READING_COLUMN]} />
      {scope === "stage" && (
        <canvas
          ref={canvasRef}
          data-ambient-canvas
          aria-hidden="true"
          tabIndex={-1}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: canvasOn ? 1 : 0, transition: "opacity 600ms linear" }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
