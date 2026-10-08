import { SubjectMark } from "@/components/brand/subject-mark";
import type { ExchangeRecord } from "@/lib/socratic/data";
import { dateWordOf } from "@/lib/socratic/lexicon";
import { scaffoldFor } from "@/lib/socratic/resolver";

import { GuidanceCard } from "./guidance-card";
import { InquiryComposer, type ComposerOption } from "./inquiry-composer";

/* THE SOCRATIC LENS (Phase 9 · Step 2, DEC-034)
 *
 * An integrated architectural lens on the subject's substrate — a bordered
 * region in the workspace, NOT a floating chatbot widget: no avatar, no
 * bubble, no typing indicator, no greeting. Its parts, in reading order:
 *
 *   1. the header — the subject mark beside "Pedagogical Reflection ·
 *      {Subject}" (the brief's verbatim pin);
 *   2. ONE honest capabilities statement (verbatim below) — the lens names
 *      what it does and what it refuses;
 *   3. the student's own recent exchanges for the current subject's
 *      milestones — the query in their words, each guidance a structured
 *      card;
 *   4. the inquiry composer.
 *
 * The lens is presentational: the environment page's resolver hands it the
 * assembled data (exchanges · artifacts · options); the dev rehearsal hands
 * it specimen data through the same props. Empty means ABSENT-but-named:
 * one calm sentence, then the composer — the lens still works before any
 * exchange exists. Zero animation anywhere in this region.
 */

export const LENS_COPY = {
  titleOf: (subjectName: string) => `Pedagogical Reflection · ${subjectName}`,
  capability:
    "This lens provides conceptual scaffolding and references based on your active milestones. It does not replace your tutor or solve exercises directly.",
  empty: "No reflections are recorded here yet. Ask about the stage you are working on; the lens keeps the guidance it returns.",
  exchangesLabel: "Recent reflections",
} as const;

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export interface SocraticLensProps {
  subjectId: string;
  subjectName: string;
  exchanges: readonly ExchangeRecord[];
  options: readonly ComposerOption[];
  /** DEV rehearsal only — production never sets it (DEC-031 precedent). */
  rehearsalComposer?: Parameters<typeof InquiryComposer>[0]["rehearsal"];
}

export function SocraticLens({ subjectId, subjectName, exchanges, options, rehearsalComposer }: SocraticLensProps) {
  const initialMilestoneKey = exchanges[0]?.milestoneKey ?? options[0]?.key ?? "";
  return (
    <section
      data-socratic-lens
      aria-label={LENS_COPY.titleOf(subjectName)}
      style={{ border: "1px solid var(--ta-border-subtle)", background: "var(--ta-surface-base)", padding: "var(--ta-space-6)", display: "flex", flexDirection: "column", gap: "var(--ta-space-5)" }}
    >
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ta-space-3)" }}>
        <SubjectMark subject={subjectId} size={24} label={subjectName} />
        <h4 style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-lg)", fontWeight: 500, color: "var(--ta-text-primary)" }}>
          {LENS_COPY.titleOf(subjectName)}
        </h4>
      </header>

      <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
        {LENS_COPY.capability}
      </p>

      {exchanges.length === 0 ? (
        <p data-socratic-empty style={{ margin: 0, fontSize: "var(--ta-text-md)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
          {LENS_COPY.empty}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
          <p style={MONO}>{LENS_COPY.exchangesLabel}</p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--ta-space-5)" }}>
            {exchanges.map((ex) => (
              <li key={ex.id} data-socratic-exchange={ex.id} style={{ borderTop: "1px solid var(--ta-border-subtle)", paddingTop: "var(--ta-space-4)", display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
                <p style={{ ...MONO, color: "var(--ta-text-secondary)" }}>
                  {scaffoldFor(subjectId, ex.milestoneKey)?.path ?? ex.milestoneKey} · {dateWordOf(ex.createdAt)}
                </p>
                <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
                  {ex.queryText}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
                  {ex.guidance.map((g, i) => (
                    <GuidanceCard
                      key={`${ex.id}-${i}`}
                      type={g.type}
                      text={g.text}
                      artifact={
                        g.referencedArtifactId && g.artifactWord && g.artifactDate
                          ? { word: g.artifactWord, dateIso: g.artifactDate, subjectId, artifactId: g.referencedArtifactId }
                          : undefined
                      }
                    />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <InquiryComposer
        subjectId={subjectId}
        options={options}
        initialMilestoneKey={initialMilestoneKey}
        rehearsal={rehearsalComposer}
      />
    </section>
  );
}
