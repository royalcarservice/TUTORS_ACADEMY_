import type { ArchiveSession } from "@/lib/archive/data";

import { ArtifactCard } from "./artifact-card";

/* THE ARTIFACT SHELF (Phase 8 · Step 2, DEC-030) — the archive reads like a
 * library shelf: sessions stand in CHRONOLOGICAL ORDER, most recent first,
 * each with its date, its title, the tutor who opened it, and the artifacts
 * preserved from it. No feed, no thumbnails-with-badges, no counts — the
 * zero-engagement rule (DEC-029) shapes the shelf exactly as it shapes the
 * schema.
 *
 * Server component, zero client JavaScript: the shelf is HTML and tokens;
 * the archive page decides who may stand here, RLS decides what the shelf
 * holds, and this component renders what it is handed — nothing more.
 */

/** One sentence per state, as data — pinned verbatim by the gate's tests. */
export const SHELF_COPY = {
  empty: (subjectName: string) =>
    `No archived sessions in ${subjectName} yet. Artifacts are preserved here after learning sessions conclude.`,
  shelfLabel: (subjectName: string) => `Past sessions in ${subjectName}`,
} as const;

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

/** The session's own date — UTC, deterministic, the house precedent (when.ts). */
function sessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function ArtifactShelf({ subjectName, sessions }: { subjectName: string; sessions: readonly ArchiveSession[] }) {
  if (sessions.length === 0) {
    /* The dignified academic notice — one calm sentence, no empty box art. */
    return (
      <p data-archive-empty style={{ margin: 0, fontSize: "var(--ta-text-md)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
        {SHELF_COPY.empty(subjectName)}
      </p>
    );
  }

  return (
    <div data-archive-shelf style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-8)" }}>
      <h2 style={{ margin: 0, ...MONO }}>{SHELF_COPY.shelfLabel(subjectName)}</h2>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--ta-space-8)" }}>
        {sessions.map((s) => (
          <li key={s.id} data-archive-session={s.id} style={{ borderTop: "1px solid var(--ta-border-subtle)", paddingTop: "var(--ta-space-6)", display: "flex", flexDirection: "column", gap: "var(--ta-space-4)" }}>
            <header style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "var(--ta-space-4)", rowGap: "var(--ta-space-1)" }}>
              {/* The date stands first — the shelf's ordering fact. */}
              <p style={{ ...MONO, color: "var(--ta-text-secondary)" }}>{sessionDate(s.scheduledAt)}</p>
              <h3 style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-lg)", fontWeight: 500, color: "var(--ta-text-primary)" }}>{s.title}</h3>
              {/* The tutor is named only when the boundary allows it; an
                  unreadable name stays silent rather than guessed. */}
              {s.tutorName && <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>{s.tutorName}</p>}
            </header>
            {s.artifacts.length > 0 && (
              <ul aria-label={`Artifacts preserved from ${s.title}`} style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--ta-space-4)", gridTemplateColumns: "repeat(auto-fill, minmax(min(16rem, 100%), 1fr))" }}>
                {s.artifacts.map((a) => (
                  <li key={a.id}>
                    <ArtifactCard artifact={a} subjectName={subjectName} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
