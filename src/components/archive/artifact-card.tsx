import type { MotifKind } from "@/lib/motif/types";
import type { Density } from "@/lib/subjects/subjects";

import { ArtifactOpener } from "./artifact-opener";
import type { ArchiveArtifact } from "@/lib/archive/data";

/* THE ARTIFACT CARD (Phase 8 · Step 2, DEC-030; viewer wired, Step 3, DEC-031)
 * — one artifact, rendered as a fact on a library shelf, never as a feed item.
 *
 * THE REGISTER — an academy archive, not a streaming service:
 *   · Board Record      — the session's whiteboard, preserved as it stood;
 *                         a subtle preview when the archive can sign one,
 *                         framed by the subject's own accent.
 *   · Session Notation  — the tutor's pedagogical notes for the session.
 *   · Chamber Audio     — the session's audio, kept whole.
 *
 * INSPECTION (DEC-031) — every card carries ONE quiet handle: the artifact
 * opener island, which lifts the artifact into the viewer on demand. The
 * card itself stays server-rendered HTML and tokens; the island mounts
 * nothing until the reader reaches for it, and the bytes are signed only at
 * that moment (the openArtifact seam).
 *
 * BANNED by test: "VOD", "Replay File", "Recording Upload" — and the whole
 * commercial register: no duration badge, no play count, no thumbnail grid,
 * no share icon, nothing recommended or trending (DEC-029's zero-engagement
 * rule, carried to the surface).
 */

/** The archive's own words — one constant, so the shelf cannot drift. */
export const ARTIFACT_CARD_COPY = {
  boardRecord: "Board Record",
  sessionNotation: "Session Notation",
  chamberAudio: "Chamber Audio",
  /** When a notation row exists but carries no readable text yet. */
  notationHeld: "The notation for this session is held in the archive.",
} as const;

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

function wordOf(artifact: ArchiveArtifact): string {
  if (artifact.type === "canvas_snapshot") return ARTIFACT_CARD_COPY.boardRecord;
  if (artifact.type === "pedagogical_notes") return ARTIFACT_CARD_COPY.sessionNotation;
  return ARTIFACT_CARD_COPY.chamberAudio;
}

function notationText(artifact: ArchiveArtifact): string | null {
  const v = artifact.metadata["summary"];
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

/** The recorded media's own kind — audio unless the row's facts say video. */
function mediaKindOf(artifact: ArchiveArtifact): "audio" | "video" {
  return artifact.metadata["media"] === "video" ? "video" : "audio";
}

export function ArtifactCard({
  artifact,
  subjectId,
  subjectName,
  motif,
  density,
  sessionTitle,
  dateLabel,
}: {
  artifact: ArchiveArtifact;
  subjectId: string;
  subjectName: string;
  motif: MotifKind;
  density: Density;
  sessionTitle: string;
  dateLabel: string;
}) {
  const word = wordOf(artifact);
  return (
    <article id={`artifact-${artifact.id}`} data-artifact-card data-artifact-type={artifact.type} style={{ border: "1px solid var(--ta-border-subtle)", borderLeft: "2px solid var(--ta-accent-1)", borderRadius: "var(--ta-radius-2)", background: "var(--ta-surface-base)", padding: "var(--ta-space-4)", display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
      <p style={MONO}>{word}</p>

      {artifact.type === "canvas_snapshot" &&
        (artifact.previewUrl ? (
          /* The board as it stood — signed for a short window, framed by the
             subject's accent; alt names the fact, never a ranking. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artifact.previewUrl}
            alt={`Board record from the ${subjectName} session`}
            style={{ display: "block", width: "100%", maxHeight: "14rem", objectFit: "contain", border: "1px solid var(--ta-accent-1)", borderRadius: "var(--ta-radius-1)", background: "var(--ta-surface-sunken)" }}
          />
        ) : (
          <div aria-hidden style={{ height: "6rem", borderRadius: "var(--ta-radius-1)", background: "var(--ta-surface-sunken)", border: "1px solid var(--ta-border-subtle)" }} />
        ))}

      {artifact.type === "pedagogical_notes" && (
        <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-primary)", maxWidth: "var(--ta-measure)" }}>
          {notationText(artifact) ?? ARTIFACT_CARD_COPY.notationHeld}
        </p>
      )}

      {/* THE HANDLE — one quiet opener per card (DEC-031). The drawer it
          lifts the artifact into is the viewer island; the card's own HTML
          never grows a counter, a badge or a second verb. */}
      <p style={{ margin: 0 }}>
        <ArtifactOpener
          artifact={{ id: artifact.id, type: artifact.type, word, notation: notationText(artifact), mediaKind: mediaKindOf(artifact) }}
          session={{ title: sessionTitle, dateLabel }}
          subject={{ id: subjectId, name: subjectName, motif, density }}
        />
      </p>
    </article>
  );
}
