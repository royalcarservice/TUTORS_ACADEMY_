/* ════════════════════════════════════════════════════════════════════════
   THE LEGAL PAGE SHELL — one restrained shape for all three notices
   (Phase 10 · Step 1, DEC-037 · resolves E-07)

   Dignified legal presentation, the brief's requirement: the platform's
   root layout and public chrome carry the page; the shell gives it a serif
   heading, a version line, and a reading measure. Sections speak through
   LegalSection and LegalP so all three documents share one typographic
   discipline — no per-page drift, no decorative variation.

   Server-only: a legal notice is text, and text needs no client JavaScript.
   ════════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  version,
  children,
}: {
  eyebrow: string;
  title: string;
  version: string;
  children: ReactNode;
}) {
  return (
    <div className="ta-container ta-container--content" style={{ padding: "var(--ta-space-8) 0 var(--ta-space-10)" }}>
      <article data-legal-page style={{ maxWidth: "var(--ta-measure)", display: "flex", flexDirection: "column", gap: "var(--ta-space-6)" }}>
        <header style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
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
            {eyebrow}
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--ta-font-display)",
              fontSize: "var(--ta-text-2xl)",
              lineHeight: 1.2,
              color: "var(--ta-text-primary)",
            }}
          >
            {title}
          </h1>
          <p style={{ margin: 0, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)" }}>
            {version}
          </p>
        </header>
        {children}
      </article>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--ta-font-display)",
          fontSize: "var(--ta-text-lg)",
          lineHeight: 1.3,
          color: "var(--ta-text-primary)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.7, color: "var(--ta-text-secondary)" }}>
      {children}
    </p>
  );
}

export function LegalList({ items }: { items: readonly ReactNode[] }) {
  return (
    <ul style={{ margin: 0, paddingInlineStart: "1.25rem", display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: "var(--ta-text-sm)", lineHeight: 1.7, color: "var(--ta-text-secondary)" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}
