import type { Metadata } from "next";
import Link from "next/link";

import { SUBJECTS } from "@/lib/subjects/subjects";

/* /subjects — MINIMAL SCAFFOLD INDEX (Phase 3 · Step 6 · Part 1)
 *
 * NOT the chooser. A plain, accessible list so the six environment routes are
 * reachable and testable. The real subject chooser is built in Phase 4 and
 * will replace this page; the page says so, on the page.
 *
 * Production honesty: draft subjects are UNREACHABLE in production, so they
 * are rendered as plain text ("in foundation"), never as links to a 404.
 */

export const metadata: Metadata = {
  title: "Subjects",
  description:
    "The six subject environments of Tutors Academy. This list is a temporary scaffold; the six doors on the homepage are the chooser.",
};

export default function SubjectsIndexPage() {
  const prod = process.env.NODE_ENV === "production";

  return (
    <div
      className="ta-container ta-container--content"
      style={{ paddingBlock: "var(--ta-space-16) var(--ta-space-section)" }}
    >
      <p
        style={{
          fontFamily: "var(--ta-font-mono)",
          fontSize: "var(--ta-text-2xs)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ta-text-muted)",
        }}
      >
        Temporary scaffold
      </p>
      <h1
        style={{
          margin: "var(--ta-space-2) 0 0",
          fontFamily: "var(--ta-font-display)",
          fontSize: "var(--ta-display-md)",
          fontWeight: 500,
          color: "var(--ta-text-primary)",
        }}
      >
        Subjects
      </h1>
      <p
        style={{
          margin: "var(--ta-space-3) 0 0",
          fontSize: "var(--ta-text-md)",
          color: "var(--ta-text-secondary)",
          maxWidth: "46rem",
        }}
      >
        {/* 5.8 gate fix (contradiction): the old sentence promised "the real subject chooser is built in
            Phase 4 and will replace it" — Phase 4 closed with the homepage's six doors as the chooser and
            this list still here (4.9 §14 recommended its replacement; not done). A claim about a past
            future is false. Now it says what is true today. */}
        Each subject is a place, not a page of content. This list is a scaffold
        so the environments are reachable; the six doors on the homepage are
        the chooser, and this list is not. Draft subjects are not linkable in
        production.
      </p>

      <ul
        style={{
          listStyle: "none",
          margin: "var(--ta-space-8) 0 0",
          padding: 0,
          display: "grid",
          gap: "var(--ta-space-2)",
          maxWidth: "32rem",
        }}
      >
        {SUBJECTS.map((s) => {
          const available = !(s.status === "draft" && prod);
          return (
            <li key={s.id} style={{ borderTop: "1px solid var(--ta-border-subtle)", paddingBlock: "var(--ta-space-2)" }}>
              {available ? (
                <Link
                  href={`/subjects/${s.id}`}
                  style={{
                    color: "var(--ta-text-primary)",
                    textDecoration: "underline",
                    textUnderlineOffset: "0.25em",
                    fontSize: "var(--ta-text-md)",
                  }}
                >
                  {s.name}
                  {s.status === "draft" ? " (draft — development only)" : ""}
                </Link>
              ) : (
                <span style={{ color: "var(--ta-text-muted)", fontSize: "var(--ta-text-md)" }}>
                  {s.name} · in foundation — not yet available
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
