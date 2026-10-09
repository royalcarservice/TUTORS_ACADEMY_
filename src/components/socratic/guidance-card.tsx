import type { GuidanceKind } from "@/lib/socratic/contract";
import { GUIDANCE_BADGE, artifactLinkText, dateWordOf } from "@/lib/socratic/lexicon";

/* STRUCTURED GUIDANCE CARD (Phase 9 · Step 2, DEC-034)
 *
 * One guidance item in academic typography: the TYPE BADGE (the three words
 * stand in src/lib/socratic/lexicon.ts, pinned verbatim by the suite), the
 * body in the reading face, and — when the guidance points at the student's
 * own archive — ONE compact link to the record, in the archive's own word.
 *
 * THE REGISTER, pinned by test: no conversational filler ("Certainly!",
 * "Great question!", "I'd love to help…") can stand here — the body is the
 * engine's text and the engine's text is swept. No exclamation, no emoji,
 * no avatar, no bubble: this is a card in a scholarly panel, not a chat.
 *
 * Presentational on purpose: no hooks, no state, no directive — the server
 * renders it in the lens and the rehearsal renders it in the island.
 */

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export interface GuidanceCardProps {
  type: GuidanceKind;
  text: string;
  /** Present when the guidance cites the student's own archive row. */
  artifact?: { word: string; dateIso: string; subjectId: string; artifactId: string };
}

export function GuidanceCard({ type, text, artifact }: GuidanceCardProps) {
  return (
    <article data-guidance-card={type} style={{ borderLeft: "1px solid var(--ta-border-subtle)", paddingLeft: "var(--ta-space-4)", display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
      <p style={MONO}>{GUIDANCE_BADGE[type]}</p>
      <p style={{ margin: 0, fontSize: "var(--ta-text-md)", lineHeight: 1.6, color: "var(--ta-text-primary)", maxWidth: "var(--ta-measure)" }}>{text}</p>
      {artifact && (
        <p style={{ margin: 0, fontSize: "var(--ta-text-sm)" }}>
          <a
            href={`/subjects/${artifact.subjectId}/archive#artifact-${artifact.artifactId}`}
            style={{ color: "var(--ta-accent-1)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}
          >
            {artifactLinkText(artifact.word, dateWordOf(artifact.dateIso))}
          </a>
        </p>
      )}
    </article>
  );
}
