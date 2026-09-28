import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import type { SceneContract } from "@/lib/spine/types";

import { Reveal } from "./reveal";
import { SCENE_SLOTS } from "./slots";

/* ════════════════════════════════════════════════════════════════════════
   SCENE SLOT — generic renderer for one spine scene (Phase 4 · Step 1)

   Renders the SKELETON of any scene from its contract alone. Later Phase 4
   steps replace one scene's content at a time; this generic shell is what
   keeps the page always-live and always coherent.

   · Skeleton scenes render as DELIBERATE QUIET STATES — never broken boxes,
     never skeleton/shimmer (these are not loading).
   · liveCapability:false scenes reuse the 3.6 honest treatment verbatim
     (hairline border + accent-3 spine + mono status label) — one treatment
     for the whole product, not a second invention.
   · Dev-only build metadata; production shows the quiet state alone.
   · No scene config is imported here beyond the typed slice passed in.
   ════════════════════════════════════════════════════════════════════════ */

export interface SpineSubjectEntry {
  id: string;
  name: string;
  href: string;
  /** Specimen materials for Scene 2 (4.3): motif kind + density, as strings. */
  motif?: string;
  density?: string;
  /** Door materials for Scene 3 (4.4): config status (availability) + config tagline. */
  status?: string;
  tagline?: string;
  /** Crossing materials for Scene 4 (4.5): accent1 hex pair for the 3.4 identity interpolation. */
  accent?: { ink: string; ivory: string };
}

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

const H2: React.CSSProperties = {
  margin: "var(--ta-space-2) 0 0",
  fontFamily: "var(--ta-font-display)",
  fontSize: "var(--ta-display-xs)",
  fontWeight: 500,
  color: "var(--ta-text-primary)",
};

const QUIET: React.CSSProperties = {
  margin: "var(--ta-space-3) 0 0",
  fontSize: "var(--ta-text-md)",
  color: "var(--ta-text-secondary)",
  maxWidth: "var(--ta-measure)",
  lineHeight: 1.6,
};

function DevMeta({ scene }: { scene: SceneContract }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p style={{ ...MONO, marginTop: "var(--ta-space-4)", color: "var(--ta-signal)" }} data-scene-meta>
      {scene.id} · {scene.narrativeFn} · {scene.status} · {scene.scrollBehaviour} {scene.scrollBudget}vh ·
      subject {scene.subjectMode} · accent {scene.accentUse} · ambient {scene.ambient} · live{" "}
      {String(scene.liveCapability)} · authored {scene.authoredIn}
    </p>
  );
}

/* The one honest roadmap beat (Scene 6), authored in the committed voice. */
function PracticeBeats() {
  const beats = [
    { label: "Live classes", state: "next", body: "A shared room with a whiteboard and a tutor in it. Phase 7." },
    { label: "Recorded classes & notes", state: "next", body: "Every session leaves a record you can return to. After Phase 7." },
    { label: "Assignments, tests & progress", state: "next", body: "One record of your work, seen the same way by you and your tutor. Student portal." },
    { label: "AI learning assistant", state: "next", body: "Described when it is built, not before. Phase 9." },
  ] as const;
  return (
    <div style={{ marginTop: "var(--ta-space-block)" }}>
      <div
        style={{
          border: "1px solid var(--ta-border-subtle)",
          borderLeft: "2px solid var(--ta-accent-1)",
          borderRadius: "var(--ta-radius-2)",
          background: "var(--ta-surface-base)",
          padding: "var(--ta-space-4)",
        }}
      >
        <p style={MONO}>Live today</p>
        <p style={{ ...QUIET, marginTop: "var(--ta-space-1)" }}>
          Six subject environments, each with its own structure, and the switch that turns one into
          another. That is the product today, and it is real.
        </p>
      </div>
      <ol
        style={{
          listStyle: "none",
          margin: "var(--ta-space-stack) 0 0",
          padding: 0,
          display: "grid",
          gap: "var(--ta-space-stack)",
        }}
      >
        {beats.map((b) => (
          <li
            key={b.label}
            style={{
              border: "1px solid var(--ta-border-subtle)",
              borderLeft: "2px solid var(--ta-accent-3)",
              borderRadius: "var(--ta-radius-2)",
              background: "var(--ta-surface-base)",
              padding: "var(--ta-space-4)",
            }}
          >
            <p style={MONO}>Next · {b.state === "next" ? "not built yet" : "live"}</p>
            <h3 style={{ margin: "var(--ta-space-1) 0 0", fontSize: "var(--ta-text-md)", fontWeight: 600, color: "var(--ta-text-primary)" }}>
              {b.label}
            </h3>
            <p style={{ ...QUIET, marginTop: "var(--ta-space-1)" }}>{b.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SceneSlot({
  scene,
  entries,
}: {
  scene: SceneContract;
  entries?: SpineSubjectEntry[];
}) {
  const headingId = `scene-${scene.id}`;
  const Slot = SCENE_SLOTS[scene.id];

  const inner = Slot ? (
    <Slot entries={entries} />
  ) : (
    <>
      {scene.order === 0 ? (
        <h1
          id={headingId}
          style={{
            margin: 0,
            fontFamily: "var(--ta-font-display)",
            fontSize: "var(--ta-display-lg)",
            fontWeight: 500,
            color: "var(--ta-text-primary)",
          }}
        >
          Tutors Academy
        </h1>
      ) : (
        <h2 id={headingId} style={H2}>
          {scene.name}
        </h2>
      )}

      <p style={QUIET}>{scene.quietLine}</p>

      {scene.id === "choice" && entries && (
        <ul style={{ listStyle: "none", margin: "var(--ta-space-4) 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "var(--ta-space-2)" }}>
          {entries.map((e) => (
            <li key={e.id}>
              <Link href={e.href} className={buttonClass("outline", "md")}>
                {e.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {scene.id === "practice" && <PracticeBeats />}

      {scene.id === "return" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-3)", marginTop: "var(--ta-space-4)" }}>
          <Link href="/subjects" className={buttonClass("primary", "lg")}>
            Enter a world
          </Link>
          <Link href="#premise" className={buttonClass("outline", "lg")}>
            Understand it
          </Link>
        </div>
      )}

      {scene.liveCapability === false && scene.status === "skeleton" && (
        <div
          data-honest-state
          style={{
            marginTop: "var(--ta-space-4)",
            border: "1px solid var(--ta-border-subtle)",
            borderLeft: "2px solid var(--ta-accent-3)",
            borderRadius: "var(--ta-radius-2)",
            background: "var(--ta-surface-base)",
            padding: "var(--ta-space-3) var(--ta-space-4)",
          }}
        >
          <p style={MONO}>System state · not built</p>
        </div>
      )}

      <DevMeta scene={scene} />
    </>
  );

  /* Authored scenes own their entrance; the skeleton reveal never wraps them
     (Decision 1: the statement never moves in). */
  const content =
    !Slot && scene.scrollBehaviour === "reveal-once" ? <Reveal>{inner}</Reveal> : <div>{inner}</div>;

  return (
    <section
      id={scene.anchorId}
      data-scene={scene.id}
      data-scroll={scene.scrollBehaviour}
      aria-label={scene.name}
      style={
        scene.scrollBehaviour === "sticky-stage"
          ? { height: `${Math.round(scene.scrollBudget * 100)}vh`, position: "relative" }
          : { minHeight: `${Math.round(scene.scrollBudget * 100)}vh`, display: "flex", flexDirection: "column", justifyContent: "center" }
      }
    >
      {scene.scrollBehaviour === "sticky-stage" ? (
        <div style={{ position: "sticky", top: "var(--ta-header-h, 0px)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {content}
        </div>
      ) : (
        content
      )}
    </section>
  );
}
