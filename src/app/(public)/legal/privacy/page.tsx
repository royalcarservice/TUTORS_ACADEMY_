import type { Metadata } from "next";
import Link from "next/link";

import { LegalList, LegalP, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Privacy & Data Protection Notice",
  description:
    "What Tutors Academy collects, what it never collects, and how the Digital Personal Data Protection Act 2023 is honoured.",
};

/* PRIVACY & DATA PROTECTION NOTICE — Phase 10 · Step 1 (DEC-037, resolves
   E-07). Enumerates exactly what the schema collects (migrations
   0001–0011) and what it structurally cannot collect. The never-collected
   list names surveillance vocabulary ON PURPOSE — this notice is where the
   refusals stand in public (the gate sweeps' refusal-context precedent).
   Zero tracking, zero third-party beacons: swept by the privacy audits. */

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy & Data Protection Notice"
      version="Version privacy_v2 · effective 8 October 2026"
    >
      <LegalSection title="1 · The short version">
        <LegalP>
          The academy stores what teaching needs and nothing else: who you are in the platform,
          which subjects you have chosen, the milestones you reach, the records of your live
          classes, and — if you use the study lens — the inquiries you put to it. Everything is
          held inside the subject it belongs to, behind database-level boundaries that no tutor
          and no other student can cross. The academy runs no advertising, no analytics and no
          tracking of any kind, and never will. Acceptance of this notice is recorded as
          version privacy_v1 in the consent audit.
        </LegalP>
      </LegalSection>

      <LegalSection title="2 · What is collected">
        <LegalList
          items={[
            "Your account: a name you give, an email address, a role (student or tutor), and whether the account is a test account — this deployment issues test accounts only.",
            "Your enrolments: which subjects you chose, and when.",
            "Your progress: the milestones you reach in each subject, recorded so the arc of your work can be shown back to you.",
            "Live-class records, when the classroom stands: the board work, the session notation and the chamber audio of sessions you take part in — preserved as evidence of the teaching, bound strictly to the one session and subject they belong to.",
            "Study-lens exchanges, if you use them: your inquiry exactly as asked, the guidance given (a question, a hint, or a reference), and your tutor's preparation marks — their note to return to an inquiry, nothing more.",
            "Consents: which version of these documents you accepted, when, your guardian's email address if you are a minor, and a one-way hash of the connecting address at the instant of consent.",
          ]}
        />
        <LegalP>
          Payment, when tuition is settled (version privacy_v2, Track 3): the provider — Stripe,
          in deployments where it is configured — receives the billing contact and the payment
          itself on its own hosted page. The academy keeps only the invoice: the subject, the
          amount, the settlement state and the provider's truncated reference. No card number
          ever touches the academy, and no payment record is ever shown to a tutor.
        </LegalP>
      </LegalSection>

      <LegalSection title="3 · What is never collected">
        <LegalP>The following have no place in this platform — not in the database, not in the code:</LegalP>
        <LegalList
          items={[
            "Facial recognition or any biometric data — no camera analysis of any kind.",
            "Keystroke logs, typing patterns or input telemetry.",
            "Attention metrics, idle or dwell timers, time-on-task figures, engagement scores.",
            "Location data, device fingerprinting, or cross-site identifiers.",
            "Third-party advertising data, marketing pixels, tracking beacons, or third-party cookies.",
            "Any psychological diagnosis, sentiment grading, or difficulty rating of a student.",
          ]}
        />
        <LegalP>
          These refusals are structural: the columns that would hold such data do not exist, and
          the platform's audits sweep for their vocabulary on every gate. There is no cookie
          banner on this site because there is nothing to consent to — no tracker runs here.
        </LegalP>
      </LegalSection>

      <LegalSection title="4 · How the data is protected">
        <LegalP>
          The boundary is the database, not the application's goodwill. Row-level security is
          enabled and forced on every table: a student reads their own rows; a tutor reads only
          the students placed with them, in the subjects of the placement; anonymous visitors
          read nothing. Subject isolation is checked in the database itself — a record cannot
          even name a subject that does not exist. Consent rows are visible only to the account
          they belong to; tutors and administrators have no access to anyone's consent audit.
        </LegalP>
        <LegalP>
          The connecting address at the instant of a consent is hashed one way (SHA-256) before
          it is stored. The raw address is never written, never returned, and never logged; if
          no address is visible to the application, the audit records that absence honestly.
        </LegalP>
      </LegalSection>

      <LegalSection title="5 · Children's data — the DPDP Act 2023">
        <LegalP>
          Under the Digital Personal Data Protection Act 2023, processing a child's personal
          data requires verifiable consent of the parent or lawful guardian. The academy honours
          this with a guardian consent gate: a student under 18 cannot enrol in a subject
          chamber until a guardian's email address has been recorded and the consent stands in
          the audit (version guardian_consent_v1). The gate asks for one thing — the guardian's
          email — states its purpose plainly, and uses no pre-checked boxes or forced
          agreements. The framework is described in full on the{" "}
          <Link href={ROUTES.legalGuardianConsent} style={{ color: "inherit" }}>
            guardian consent page
          </Link>
          .
        </LegalP>
      </LegalSection>

      <LegalSection title="6 · Retention and leaving">
        <LegalP>
          Records live with the account. Withdrawing from a subject closes that door without
          penalty; deleting an account deletes its rows across every table, by construction —
          the schema's foreign keys cascade, so nothing outlives the account it belongs to.
        </LegalP>
      </LegalSection>

      <LegalSection title="7 · Your rights under the Act">
        <LegalP>
          The Act gives you the right to access a summary of your personal data, to correct it,
          to erase it, to nominate who may access it if you are incapacitated, and to grieve any
          misuse. Access and correction are exercised through the account itself where the
          platform holds the surface for them; erasure is account deletion. Where a surface is
          not built yet, the academy says so rather than implying it: the rights stand, and the
          mechanism catches up with them as the platform is completed.
        </LegalP>
      </LegalSection>

      <LegalSection title="8 · Contact and grievance">
        <LegalP>
          This deployment issues test accounts only and holds no real students' data, so no
          standing contact channel is published yet. The day real onboarding opens, the academy
          will publish its grievance contact here — the person, and how to reach them — as the
          Act requires. Until then, questions about this notice are handled through the tutor
          who issued the test account.
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
