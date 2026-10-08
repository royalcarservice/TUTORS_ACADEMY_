import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SocraticRehearsalPreview } from "./preview";

/* DEV-ONLY SPECIMEN · /dev/socratic-rehearsal — 404s in production.

   The rehearsal space for the SOCRATIC LENS (Phase 9 · Step 2, DEC-034).
   The sandbox has no database and the socratic migrations are unapplied in
   the project DB — so this rehearsal proves the lens exactly as
   /dev/archive-rehearsal proves the viewer: with SPECIMEN data, in the
   reader's own browser, honestly labeled.

   What stands here:
   · the lens itself — the architectural region (mark, title, capabilities
     statement, exchange log, composer) on the subject's substrate;
   · the PURE engine behind the composer — the rehearsal composer resolves
     locally through src/lib/socratic/resolver (production resolves through
     the server action and the student's own INSERT);
   · one specimen exchange already on the log, including a citation of a
     specimen Session Notation, so the card's archive link is visible;
   · the closed vocabulary of calm failure is reachable by refusing the
     engine (empty or overlong inquiries) — no network involved.

   The rehearsal says what it is: SPECIMEN. Nothing written here persists.
*/

export const metadata: Metadata = {
  title: "Socratic Rehearsal (dev)",
  robots: { index: false, follow: false },
};

export default function SocraticRehearsalPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main style={{ padding: "var(--ta-space-6)", display: "flex", flexDirection: "column", gap: "var(--ta-space-5)", maxWidth: "60rem", margin: "0 auto" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
        <p style={{ margin: 0, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" }}>
          Dev rehearsal · specimen data
        </p>
        <h1 style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", color: "var(--ta-text-primary)" }}>
          The Socratic Lens — rehearsal
        </h1>
        <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
          This space proves the lens with specimen exchanges and specimen artifacts. The composer resolves through the production pure engine, locally; nothing written here persists, and production never mounts this route.
        </p>
      </header>
      <SocraticRehearsalPreview />
    </main>
  );
}
