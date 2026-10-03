import Link from "next/link";

/* THE WAY IN TO THE LEVERS (6.5 · P6-R17). One quiet link, rendered ONLY
 * where the write permission exists (a subject the tutor holds an active
 * relationship in): on that subject's group in the tutor shell (primary
 * entry) and on that subject's environment page (contextual entry). Never on
 * a relationship's surface — "shape this environment" beside a student
 * invites the reading P6-R10 forbids. Weight: text-sm, regular, underlined —
 * below a relationship row (text-base, 500) and never a primary. */
export const SHAPE_LINK_COPY = { label: (subjectName: string) => `Shape the ${subjectName} environment` } as const;

export function ShapeLink({ subjectId, subjectName, style }: { subjectId: string; subjectName: string; style?: React.CSSProperties }) {
  return (
    <Link
      href={`/tutor/${subjectId}/environment`}
      data-shape-link
      style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", fontWeight: 400, color: "var(--ta-text-secondary)", textDecoration: "underline", textUnderlineOffset: "0.2em", ...style }}
    >
      {SHAPE_LINK_COPY.label(subjectName)}
    </Link>
  );
}
