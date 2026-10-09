import { AmbientStage } from "@/components/ambient/ambient-stage";
import { SubjectMark } from "@/components/brand/subject-mark";
import { Room } from "@/components/motif/stage";
import { SHELL_REGIONS } from "@/config/shell-regions";
import type { MotionChar } from "@/lib/subjects/subjects";

import { REGION_SLOTS } from "./slots";
import { SubjectNav, type ShellNavEntry } from "./subject-nav";

/* ════════════════════════════════════════════════════════════════════════
   ENVIRONMENT SHELL (Phase 3 · Step 6 · Part 2)

   A subject route = STAGE at the root, one ROOM region beneath the identity.
   The shell ships IDENTITY, NOT FEATURES. Its responsibilities, in order:

     1. APPLY SUBJECT SCOPE   — [data-subject] on the environment root; tokens
                                resolve inside the subtree and nowhere else.
     2. APPLY LAYER MODE      — root is Stage (data-spatial="stage"); the room
                                region is data-spatial="room" + compact density
                                (spacing-only switch, 2.4).
     3. RENDER IDENTITY       — mark (3.2), name in the single h1, tagline.
     4. RENDER THE MOTIF      — Stage substrate + Room edge vector, both via
                                the 3.3 renderer, server-rendered.
     5. MOUNT THE AMBIENT     — AmbientStage (3.5): Stage-only, lazy, SVG
                                substrate already beneath; never in the Room.
     6. SUBJECT CONTEXT       — scoping is the [data-subject] mechanism (3.1);
                                nothing more is exposed to the client.
     7. ENTRY SEMANTICS       — heading is the focus target; the layout-level
                                SubjectEntry handles announce/focus (Part 4).

   It contains NO feature logic: no fetches, no roles, no assumptions.
   It imports NO subject config (3.1 guard) — the page passes everything in.
   ════════════════════════════════════════════════════════════════════════ */

export interface ShellSubject {
  id: string;
  name: string;
  tagline: string;
  motif: "lattice" | "field" | "bonds" | "living" | "typographic" | "strata";
  density: "sparse" | "balanced" | "dense";
}

export interface ShellAmbientSubject {
  id: string;
  name: string;
  motif: ShellSubject["motif"];
  density: ShellSubject["density"];
  motionChar: string;
  accent: { ink: string; ivory: string };
}

const MONO_LABEL: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export function SubjectShell({
  subject,
  ambient,
  draft,
  entries,
  threshold,
  regions,
  shaping,
  levers,
}: {
  subject: ShellSubject;
  ambient: ShellAmbientSubject;
  draft: boolean;
  entries: ShellNavEntry[];
  /* 5.5 · P5-R5 (one environment, role-scoped regions). Both optional and
     decided by the PAGE from the identity; when absent NOTHING is rendered,
     so a visitor's HTML is unchanged from the certified 3.6 composition.
     `threshold` — the Begin control, header position, one state only.
     `regions`   — the student's own regions inside the Room, after 3.6's
                   honest labels (which stay the single honest statement). */
  threshold?: React.ReactNode;
  regions?: React.ReactNode;
  /* 6.5 · P6-R17 contextual entry: a quiet link to the levers, header position
     after the tagline/threshold, rendered ONLY for a reader who may write
     (an active relationship in this subject). Absent → byte-identical. */
  shaping?: React.ReactNode;
  /* 6.4 · THE LEVERS, as the page resolved them (authored default or the
     subject's settings row). ADDITIVE and optional: when absent the markup is
     byte-identical to the certified 3.6 composition. When present, two data
     attributes name the effective values so a harness can fingerprint the
     furniture; `source` says whether a row shaped it. Nothing here is
     per-reader: the page passes the same object for everyone (P6-R10). */
  levers?: { density: ShellSubject["density"]; motionChar: MotionChar; source: "authored" | "shaped" };
}) {
  return (
    <div data-subject={subject.id} data-spatial="stage" data-shell-root data-density={levers?.density} data-motion-char={levers?.motionChar} data-levers-source={levers?.source}>
      {/* 5 + 4: Stage layer — SVG substrate first, ambient lens lazy on top. */}
      <AmbientStage subject={ambient} scope="stage">
        <div
          style={{
            maxWidth: "76rem",
            margin: "0 auto",
            padding: "var(--ta-space-16) var(--ta-gutter) var(--ta-space-section)",
          }}
        >
          {draft && (
            <p
              role="note"
              data-shell-draft
              style={{
                border: "1px dashed var(--ta-accent-1)",
                borderRadius: "var(--ta-radius-2)",
                padding: "var(--ta-space-2) var(--ta-space-3)",
                marginBottom: "var(--ta-space-6)",
                fontSize: "var(--ta-text-sm)",
                color: "var(--ta-text-secondary)",
              }}
            >
              {/* 5.8: the old sentence ("visible in development only — in production this
                  route returns the framework 404") was FALSE for the one audience that sees it
                  in production: an enrolled student (5.3 door logic). Now true in both. */}
              Draft subject — still in foundation. Open here ahead of its public listing.
            </p>
          )}

          {/* 3: identity — mark, single h1, tagline. */}
          <header data-shell-identity>
            <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }}>
              <SubjectMark subject={subject.id} size={48} />
            </span>
            <h1
              id="subject-heading"
              tabIndex={-1}
              data-subject-name={subject.name}
              data-subject-tagline={subject.tagline}
              style={{
                margin: "var(--ta-space-3) 0 0",
                fontFamily: "var(--ta-font-display)",
                fontSize: "var(--ta-display-md)",
                fontWeight: 500,
                color: "var(--ta-accent-1)",
                outline: "none",
              }}
            >
              {subject.name}
            </h1>
            <p
              style={{
                margin: "var(--ta-space-2) 0 0",
                fontSize: "var(--ta-text-md)",
                color: "var(--ta-text-secondary)",
                maxWidth: "46rem",
              }}
            >
              {subject.tagline}
            </p>
            {threshold}
            {shaping}
          </header>

          {/* navigation position */}
          <div style={{ marginTop: "var(--ta-space-8)" }}>
            <SubjectNav current={subject.id} entries={entries} />
          </div>

          {/* 2: ROOM region — contained, compact, vector-only, calm. */}
          <div style={{ marginTop: "var(--ta-space-block)" }} data-density="compact">
            <Room subject={subject.id} motif={subject.motif} density={subject.density} role="edge">
              <p style={MONO_LABEL}>Room · compact density · vector only</p>
              <h2
                style={{
                  margin: "var(--ta-space-2) 0 0",
                  fontFamily: "var(--ta-font-display)",
                  fontSize: "var(--ta-display-xs)",
                  fontWeight: 500,
                  color: "var(--ta-text-primary)",
                }}
              >
                Inside this room
              </h2>
              <p
                style={{
                  margin: "var(--ta-space-2) 0 0",
                  fontSize: "var(--ta-text-sm)",
                  color: "var(--ta-text-secondary)",
                  maxWidth: "46rem",
                }}
              >
                The room is the working surface of this environment. It holds no
                substrate and no canvas — only calm, compact space for the
                features that arrive in later phases. Nothing here is loading;
                nothing here is built yet.
              </p>

              <div
                style={{
                  marginTop: "var(--ta-space-block)",
                  display: "grid",
                  gap: "var(--ta-space-stack)",
                }}
              >
                {SHELL_REGIONS.map((r) => {
                  const Slot = REGION_SLOTS[r.id];
                  return (
                    <section key={r.id} data-shell-region={r.id} aria-label={r.title}>
                      {Slot ? (
                        /* 8.2 (DEC-030): the slot receives the subject it stands in —
                           the fill point's one declared contract growth. */
                        <Slot subjectId={subject.id} subjectName={subject.name} regionTitle={r.title} />
                      ) : (
                        <div
                          style={{
                            border: "1px solid var(--ta-border-subtle)",
                            borderLeft: "2px solid var(--ta-accent-3)",
                            borderRadius: "var(--ta-radius-2)",
                            background: "var(--ta-surface-base)",
                            padding: "var(--ta-space-4)",
                          }}
                        >
                          <p style={MONO_LABEL}>System state · not built</p>
                          <h3
                            style={{
                              margin: "var(--ta-space-1) 0 0",
                              fontSize: "var(--ta-text-md)",
                              fontWeight: 600,
                              color: "var(--ta-text-primary)",
                            }}
                          >
                            {r.title}
                          </h3>
                          <p
                            style={{
                              margin: "var(--ta-space-1) 0 0",
                              fontSize: "var(--ta-text-sm)",
                              color: "var(--ta-text-secondary)",
                            }}
                          >
                            {r.note}
                          </p>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
              {regions}
            </Room>
          </div>
        </div>
      </AmbientStage>
    </div>
  );
}
