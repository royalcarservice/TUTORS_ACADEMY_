"use client";

/* ROOT-LAYOUT ERROR BOUNDARY (Phase 5 · Step 7 · Part 2). Reached ONLY when
 * the root layout itself fails — no fonts, no globals.css, no theme can be
 * assumed, so this is deliberately the plainest honest page: one h1, one
 * sentence, one link. System font, inherits nothing, claims nothing. */
export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#1a1a1a", background: "#fff" }}>
        <main id="main" style={{ maxWidth: "36rem", margin: "0 auto", padding: "4rem 1.25rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.15, margin: 0 }}>Tutors Academy could not be shown just now.</h1>
          <p style={{ marginTop: "1rem", lineHeight: 1.55 }}>Nothing was recorded. Opening the site again only reads — it is safe to do.</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a plain anchor on purpose: the router may be what failed */}
          <p style={{ marginTop: "1.5rem" }}><a href="/" style={{ color: "inherit", minHeight: "44px", display: "inline-flex", alignItems: "center", textDecoration: "underline" }}>Open Tutors Academy</a></p>
        </main>
      </body>
    </html>
  );
}
