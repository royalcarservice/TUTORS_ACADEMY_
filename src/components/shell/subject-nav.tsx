"use client";

import Link from "next/link";

/* ENVIRONMENT SHELL — NAVIGATION POSITION (Phase 3 · Step 6)
 *
 * Shows where this environment sits among the six subjects. The page (app
 * dir) decides which entries are linkable (draft subjects are NOT links in
 * production); this component only renders what it is given — it never reads
 * a subject config (3.1 guard).
 */

export interface ShellNavEntry {
  id: string;
  name: string;
  href: string;
  available: boolean;
  draft: boolean;
}

export function SubjectNav({
  current,
  entries,
}: {
  current: string;
  entries: ShellNavEntry[];
}) {
  return (
    <nav aria-label="Subjects" data-shell-nav>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--ta-font-mono)",
          fontSize: "var(--ta-text-2xs)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ta-text-muted)",
        }}
      >
        Navigation position
      </p>
      <ul
        style={{
          listStyle: "none",
          margin: "var(--ta-space-2) 0 0",
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--ta-space-2)",
        }}
      >
        {entries.map((e) => (
          <li key={e.id}>
            {e.available ? (
              <Link
                href={e.href}
                aria-current={e.id === current ? "page" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: "var(--ta-target-min)",
                  padding: "var(--ta-space-1) var(--ta-space-3)",
                  borderRadius: "var(--ta-radius-2)",
                  border: "1px solid var(--ta-border-subtle)",
                  fontSize: "var(--ta-text-sm)",
                  fontWeight: e.id === current ? 600 : 400,
                  color: e.id === current ? "var(--ta-accent-1)" : "var(--ta-text-secondary)",
                  background: e.id === current ? "var(--ta-surface-raised)" : "transparent",
                  textDecoration: "none",
                }}
              >
                {e.name}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: "var(--ta-target-min)",
                  padding: "var(--ta-space-1) var(--ta-space-3)",
                  borderRadius: "var(--ta-radius-2)",
                  border: "1px dashed var(--ta-border-subtle)",
                  fontSize: "var(--ta-text-sm)",
                  color: "var(--ta-text-muted)",
                }}
              >
                {e.name}
                {e.draft ? " · in foundation" : ""}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
