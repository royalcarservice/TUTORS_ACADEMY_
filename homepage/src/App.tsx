import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Approach } from "./components/Approach";
import { SubjectExplorer } from "./components/SubjectExplorer";
import { SubjectDialog } from "./components/SubjectDialog";
import { LearningExperience } from "./components/LearningExperience";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { SUBJECTS, getSubject } from "./data/subjects";
import {
  scrollState,
  usePointerParallax,
  useScrollChoreography,
} from "./lib/scroll";
import { useCanvasActive } from "./lib/useCanvasActive";
import { useIsCompact, useReducedMotion, useWebGLSupport } from "./lib/env";
import { SculptureContext } from "./lib/sculpture-context";

/* Three.js and React Three Fiber are only fetched once the browser has
   confirmed it can actually use them, so the page shell, the copy and every
   sample interaction are interactive before the 3D chunk arrives. */
const SceneCanvas = lazy(() =>
  import("./three/SceneCanvas").then((m) => ({ default: m.SceneCanvas })),
);

/* ════════════════════════════════════════════════════════════════════════
   PAGE

   Layer order is the whole trick:
     z-0  fixed, transparent WebGL canvas
     z-10 the page, with every section background transparent and only the
          cards opaque — so the sculpture shows through the windows the
          layout leaves for it (see [data-sculpture-window]).
   ════════════════════════════════════════════════════════════════════════ */

export default function App() {
  const reduced = useReducedMotion();
  const compact = useIsCompact();
  const webgl = useWebGLSupport();

  const [openId, setOpenId] = useState<string | null>(null);
  const [stage, setStage] = useState(0);

  const pageRef = useRef<HTMLDivElement>(null);
  const experiencePanelRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const choreoRefs = useMemo(
    () => ({ page: pageRef, experiencePanel: experiencePanelRef }),
    [],
  );

  /* The live sculpture is scrubbed by design, so a reduced-motion request
     turns it off entirely rather than merely slowing it down. Each window
     then renders the static composition that belongs to it. */
  const live3D = webgl === true && !reduced;

  useScrollChoreography(choreoRefs, reduced);
  usePointerParallax(reduced || webgl !== true);

  // The dialog occludes the page, so the GPU can idle while it is open.
  const rendering = useCanvasActive(canvasHostRef, openId !== null);

  const openSubject = getSubject(openId);

  useEffect(() => {
    scrollState.stage = stage;
  }, [stage]);

  useEffect(() => {
    scrollState.focusSubject = openId
      ? SUBJECTS.findIndex((s) => s.id === openId)
      : -1;
  }, [openId]);

  // Re-measure the anchors and pinned panel after fonts/images settle.
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 400);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <SculptureContext.Provider value={{ live: live3D }}>
      <div ref={pageRef} className="relative min-h-screen">
        <a
          href="#main"
          className="skip-link inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white"
        >
          Skip to content
        </a>

        <Nav />

        {/* ── the 3D layer ─────────────────────────────────────────────── */}
        <div
          ref={canvasHostRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
        >
          {live3D && (
            <Suspense fallback={null}>
              <SceneCanvas compact={compact} active={rendering} />
            </Suspense>
          )}
        </div>

        {/* ── the page ─────────────────────────────────────────────────── */}
        <div className="relative z-10">
          <main id="main">
            <Hero />
            <Approach />
            <SubjectExplorer openId={openId} onOpen={setOpenId} />
            <LearningExperience
              ref={experiencePanelRef}
              stage={stage}
              onStageChange={setStage}
            />
            <FinalCta />
          </main>
          <Footer />
        </div>

        {openSubject && (
          <SubjectDialog subject={openSubject} onClose={() => setOpenId(null)} />
        )}
      </div>
    </SculptureContext.Provider>
  );
}
