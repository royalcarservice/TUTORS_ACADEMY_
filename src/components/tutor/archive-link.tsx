import Link from "next/link";

/* THE WAY IN TO THE ARCHIVE (Phase 8 · Step 2, DEC-030). One quiet link per
 * subject group in the tutor shell — the SHAPE LINK's own grammar (6.5 ·
 * P6-R17), carried to the archive: rendered ONLY where the reader holds an
 * active relationship in the subject, below the rows' weight, never a
 * primary. It stands on the SUBJECT GROUP, not on a relationship's surface —
 * reviewing past work is a subject act, and a student's page is never the
 * place a tutor is invited to one (P6-R10's distance, kept).
 * Weight: text-sm, regular, underlined — identical to ShapeLink, so the two
 * quiet links read as the same kind of way-in. */
export const ARCHIVE_LINK_COPY = { label: (subjectName: string) => `Review the ${subjectName} archive` } as const;

export function ArchiveLink({ subjectId, subjectName, style }: { subjectId: string; subjectName: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/subjects/${subjectId}/archive`}
      data-archive-link
      style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", fontWeight: 400, color: "var(--ta-text-secondary)", textDecoration: "underline", textUnderlineOffset: "0.2em", ...style }}
    >
      {ARCHIVE_LINK_COPY.label(subjectName)}
    </Link>
  );
}
