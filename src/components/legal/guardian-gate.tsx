"use client";

/* ════════════════════════════════════════════════════════════════════════
   THE GUARDIAN GATE — verifiable guardian consent for minor students
   (Phase 10 · Step 1, DEC-037 · resolves E-07 · DPDP Act 2023)

   Rendered during student onboarding when the student's date of birth
   indicates a minor. Real onboarding stays CLOSED today (test accounts
   only, P5-R1 Part 7), so the gate is built, proven at
   /dev/guardian-rehearsal, and owed to the onboarding surface the day it
   opens — declared, DEC-037.

   DIGNIFIED BY CONSTRUCTION — the brief's requirement, swept by test:
   · ONE input (the guardian's email) and ONE act; no pre-checked boxes,
     no bundled agreements, no countdown, no coercive alternative;
   · the legal sentence stands verbatim (LEGAL_COPY.guardianDpdpSentence);
   · the email's purpose is stated once, beside the field: verification
     only — never marketing, never shared with tutors;
   · every outcome speaks the closed calm vocabulary of consent.ts — the
     success sentence is honest about the delivery channel's state, and
     failure claims only what is known (nothing changed; repeating safe).

   The act records guardian_consent_v1 through the server action
   (src/lib/legal/data.ts): identity rides the cookie session, RLS is the
   only boundary, and the connecting address reaches the audit ONLY as a
   one-way SHA-256 hash, computed server-side.
   ════════════════════════════════════════════════════════════════════════ */

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { GUARDIAN_EMAIL_MAX, LEGAL_COPY } from "@/lib/legal/consent";
import { recordLegalConsent, type LegalConsentResult } from "@/lib/legal/data";

export function GuardianGate() {
  const [state, action, pending] = useActionState<LegalConsentResult, FormData>(
    recordLegalConsent,
    { error: null },
  );

  return (
    <section
      data-guardian-gate
      aria-label="Guardian consent"
      style={{
        border: "1px solid var(--ta-border-subtle)",
        background: "var(--ta-surface-base)",
        padding: "var(--ta-space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--ta-space-4)",
        maxWidth: "34rem",
      }}
    >
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
          Guardian consent
        </p>
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--ta-font-display)",
            fontSize: "var(--ta-text-lg)",
            lineHeight: 1.3,
            color: "var(--ta-text-primary)",
          }}
        >
          A guardian confirms this enrolment
        </h2>
        <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)" }}>
          {LEGAL_COPY.guardianDpdpSentence}
        </p>
      </header>

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
        <input type="hidden" name="consent_type" value="guardian_consent_v1" />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
          <Label htmlFor="guardian-email">Guardian's email address</Label>
          <Input
            id="guardian-email"
            name="guardian_email"
            type="email"
            autoComplete="email"
            required
            maxLength={GUARDIAN_EMAIL_MAX}
            placeholder="guardian@example.com"
            aria-describedby="guardian-email-purpose"
          />
          <FieldHint id="guardian-email-purpose">{LEGAL_COPY.guardianEmailPurpose}</FieldHint>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-3)", alignItems: "center" }}>
          <Button type="submit" size="md" loading={pending} disabled={pending}>
            {pending ? "Recording…" : "Send confirmation link"}
          </Button>
        </div>

        {state.error && (
          <p role="alert" data-form-outcome style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-primary)" }}>
            {state.error}
          </p>
        )}
        {state.notice && (
          <p role="status" data-form-outcome style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)" }}>
            {state.notice}
          </p>
        )}
      </form>
    </section>
  );
}
