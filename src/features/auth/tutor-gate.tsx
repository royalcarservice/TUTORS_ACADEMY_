/* ════════════════════════════════════════════════════════════════════════
   THE TUTOR INVITATION GATE (Phase 10 · Step 2, DEC-038)

   Tutor accounts are opened by invitation; self-service registration for
   tutors is not open. This gate says so with dignity — a refusal is a
   complete answer, and a gate that refuses is still a gate.

   WHY NOT COLLECT CREDENTIALS HERE: no review surface exists for them.
   Collecting teaching credentials the platform cannot look at would be a
   false feature (the house rule); the invitation and credential-review
   flow stands owed to the environment that hires tutors, and the copy
   says so. The server action refuses the tutor role too — defence in
   depth, so the refusal holds even for a hand-built form.
   ════════════════════════════════════════════════════════════════════════ */

import { ONBOARDING_COPY } from "@/lib/auth/onboarding";

export function TutorGate() {
  return (
    <section
      data-tutor-gate
      aria-label="Tutor invitation gate"
      style={{
        border: "1px solid var(--ta-border-subtle)",
        background: "var(--ta-surface-base)",
        padding: "var(--ta-space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--ta-space-3)",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--ta-font-display)",
          fontSize: "var(--ta-text-lg)",
          lineHeight: 1.3,
          color: "var(--ta-text-primary)",
        }}
      >
        Tutors join by invitation
      </h2>
      <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.7, color: "var(--ta-text-secondary)" }}>
        {ONBOARDING_COPY.tutorGateRefusal}
      </p>
      <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.7, color: "var(--ta-text-muted)" }}>
        {ONBOARDING_COPY.tutorGateOwed}
      </p>
    </section>
  );
}
