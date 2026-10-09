import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuardianGate } from "@/components/legal/guardian-gate";

/* DEV-ONLY REHEARSAL · /dev/guardian-rehearsal — 404s in production.

   The rehearsal space for the GUARDIAN GATE (Phase 10 · Step 1, DEC-037).
   Real student onboarding stays CLOSED today (test accounts only, P5-R1
   Part 7), so the gate is proven here — live, exactly as onboarding will
   mount it — and owed to the onboarding surface the day it opens.

   What stands here:
   · the gate itself — the DPDP sentence verbatim, ONE email field with its
     purpose stated, ONE act, zero dark patterns;
   · the REAL server action behind the act (src/lib/legal/data.ts): the
     sandbox has no credentials, so the outcome is the action's own honest
     sentence — unconfigured says unconfigured, a refused write says
     nothing-changed; every path speaks the closed calm vocabulary;
   · the record of what is owed: the onboarding wiring (a date-of-birth
     question exists nowhere yet) and the confirmation-link delivery
     channel.

   The rehearsal says what it is. Nothing written here persists.
*/

export const metadata: Metadata = {
  title: "Guardian Consent Rehearsal (dev)",
  robots: { index: false, follow: false },
};

export default function GuardianRehearsalPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main style={{ padding: "var(--ta-space-6)", display: "flex", flexDirection: "column", gap: "var(--ta-space-5)", maxWidth: "60rem", margin: "0 auto" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
        <p style={{ margin: 0, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" }}>
          Dev rehearsal · guardian consent
        </p>
        <h1 style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", color: "var(--ta-text-primary)" }}>
          The Guardian Gate — rehearsal
        </h1>
        <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
          This space proves the guardian consent gate exactly as onboarding will mount it: the real component, wired to the real server action. The sandbox holds no credentials and migration 0011 is unapplied, so the act ends in the action's own honest sentence — nothing here persists, and production never mounts this route.
        </p>
      </header>

      <GuardianGate />

      <section aria-label="What this rehearsal proves" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)", maxWidth: "var(--ta-measure)" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" }}>
          What stands, and what is owed
        </h2>
        <ul style={{ margin: 0, paddingInlineStart: "1.25rem", display: "flex", flexDirection: "column", gap: "var(--ta-space-1)", fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)" }}>
          <li>Built: the gate — one field, one act, the DPDP sentence verbatim, zero dark patterns — and the consent audit it writes to (migration 0011).</li>
          <li>Owed: the onboarding wiring — no date-of-birth question exists yet; the gate mounts when real onboarding opens.</li>
          <li>Owed: the confirmation-link delivery channel — the outcome sentence says so at the moment of consent.</li>
        </ul>
      </section>
    </main>
  );
}
