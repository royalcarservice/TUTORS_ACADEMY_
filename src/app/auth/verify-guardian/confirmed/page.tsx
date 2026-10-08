import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/config/routes";
import { ONBOARDING_COPY } from "@/lib/auth/onboarding";

export const metadata: Metadata = {
  title: "Guardian consent — confirmation",
  robots: { index: false, follow: false },
};

/* THE CALM CONFIRMATION (Phase 10 · Step 2, DEC-038). The verification
   handler redirects here with one of five outcomes; each speaks one
   sentence from the pinned register, server-rendered, zero client
   JavaScript. The brief's confirmation sentence stands verbatim for the
   confirmed outcome (the subject placeholder is omitted — no enrolment
   exists at verification time; the chambers OPEN with the consent, and
   the copy says exactly that). */

const OUTCOMES: Record<string, { title: string; body: string }> = {
  confirmed: {
    title: "Consent confirmed",
    body: ONBOARDING_COPY.verifyConfirmed,
  },
  already: {
    title: "Already confirmed",
    body: ONBOARDING_COPY.verifyAlready,
  },
  expired: {
    title: "Link expired",
    body: ONBOARDING_COPY.verifyExpired,
  },
  unknown: {
    title: "Link not recognised",
    body: ONBOARDING_COPY.verifyUnknown,
  },
  unavailable: {
    title: "Verification unavailable",
    body: ONBOARDING_COPY.verifyUnavailable,
  },
};

export default async function GuardianConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ outcome?: string }>;
}) {
  const params = await searchParams;
  const outcome = OUTCOMES[params.outcome ?? ""] ?? OUTCOMES.unknown;

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--ta-space-6)",
      }}
    >
      <article
        style={{
          maxWidth: "34rem",
          border: "1px solid var(--ta-border-subtle)",
          background: "var(--ta-surface-base)",
          padding: "var(--ta-space-8)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--ta-space-4)",
        }}
      >
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
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--ta-font-display)",
            fontSize: "var(--ta-text-xl)",
            lineHeight: 1.3,
            color: "var(--ta-text-primary)",
          }}
        >
          {outcome.title}
        </h1>
        <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.7, color: "var(--ta-text-secondary)" }}>
          {outcome.body}
        </p>
        <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.7, color: "var(--ta-text-muted)" }}>
          If you have questions about this consent, the{" "}
          <Link href={ROUTES.legalGuardianConsent} style={{ color: "inherit" }}>
            Guardian Consent Framework
          </Link>{" "}
          describes it in full.
        </p>
      </article>
    </main>
  );
}
