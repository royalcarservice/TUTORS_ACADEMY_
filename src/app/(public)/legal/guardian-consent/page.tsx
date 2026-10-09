import type { Metadata } from "next";
import Link from "next/link";

import { LegalList, LegalP, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { LEGAL_COPY } from "@/lib/legal/consent";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Guardian Consent Framework",
  description:
    "How Tutors Academy obtains verifiable guardian consent for students under 18, as the Digital Personal Data Protection Act 2023 requires.",
};

/* GUARDIAN CONSENT FRAMEWORK — Phase 10 · Step 1 (DEC-037, resolves E-07).
   The public statement of the gate built in src/components/legal: what the
   DPDP Act requires, what the gate asks, what it records, and what it
   refuses to do. The legal sentence stands verbatim (the brief's
   requirement); the delivery channel's state is stated honestly. */

export default function GuardianConsentPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Guardian Consent Framework"
      version="Framework version guardian_consent_v1 · effective 8 October 2026"
    >
      <LegalSection title="1 · The requirement">
        <LegalP>{LEGAL_COPY.guardianDpdpSentence}</LegalP>
        <LegalP>
          The academy treats this as a gate, not a formality: no student under 18 can enrol in a
          subject chamber while the consent is absent. The gate stands between the account and
          the enrolment, and the enrolment checks for it.
        </LegalP>
      </LegalSection>

      <LegalSection title="2 · What the gate asks">
        <LegalList
          items={[
            "One thing: the guardian's email address — typed into a single field, with its purpose stated beside it.",
            "Nothing else. No identity documents, no payment details, no biometric verification, no bundled agreements, no pre-checked boxes.",
            "No coercive alternative: the gate does not offer a way around itself, and it does not count down, pressure, or guilt. A guardian who wishes to stop simply stops.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3 · What is recorded">
        <LegalP>
          When a guardian consents, the audit records one row: the student's account, the
          consent type (guardian_consent_v1), the guardian's email address, the instant of
          consent, and a one-way hash of the connecting address — the raw address is never
          stored. The row belongs to the student's account; only that account can read it, and
          no tutor or administrator can. The guardian's email is used only to verify this
          consent — never for marketing, never shown to the student's tutors.
        </LegalP>
        <LegalP>
          The confirmation step sends the guardian a link to verify the address. The delivery
          channel for that email is not wired in this deployment, and the academy says so at the
          moment of consent rather than claiming a sent email; the consent stands recorded, and
          the link will be delivered when the channel opens. This is stated plainly because an
          honest framework says what it does and does not do.
        </LegalP>
      </LegalSection>

      <LegalSection title="4 · Withdrawal">
        <LegalP>
          A guardian may withdraw consent at any time, and withdrawal ends the student's
          enrolment in the subject chambers. The mechanism for withdrawal opens with real
          onboarding; until then, a guardian of a test account withdraws by telling the tutor
          who issued it. The audit keeps the original consent row — it is the record that the
          consent was given, and the academy does not rewrite its records.
        </LegalP>
      </LegalSection>

      <LegalSection title="5 · Where this stands in the platform">
        <LegalP>
          The gate renders during student onboarding when the student's date of birth indicates
          a minor. Real onboarding is not open in this deployment (test accounts only), so the
          gate is built and proven in the development rehearsal, and it will stand in the
          onboarding path the day that path opens. The{" "}
          <Link href={ROUTES.legalPrivacy} style={{ color: "inherit" }}>
            privacy notice
          </Link>{" "}
          describes children's data in full; the{" "}
          <Link href={ROUTES.legalTerms} style={{ color: "inherit" }}>
            terms of academy practice
          </Link>{" "}
          govern everything the consent admits the student to.
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
