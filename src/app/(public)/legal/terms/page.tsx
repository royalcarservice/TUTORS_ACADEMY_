import type { Metadata } from "next";

import { LegalList, LegalP, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Academy Practice",
  description:
    "The terms of practice for Tutors Academy: the pedagogical relationship, ownership of student work, and the absence of commercial lock-in.",
};

/* TERMS OF ACADEMY PRACTICE — Phase 10 · Step 1 (DEC-037, resolves E-07).
   Written to be read: clear, honest, calm. Every sentence claims only what
   the product does today (Phase 9, migrations 0001–0011); what is owed is
   named as owed. Version terms_v1 — the consent audit (migration 0011)
   records acceptance of exactly this version; a revision is a new version
   and a new consent, never a silent change. */

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Academy Practice"
      version="Version terms_v1 · effective 8 October 2026"
    >
      <LegalSection title="1 · What this academy is">
        <LegalP>
          Tutors Academy is a tutoring platform built one subject environment at a time. Six
          subjects stand — Mathematics, Physics, Chemistry, Biology, English and History — each
          with its own room, and each room admits a tutor who has a place in it. The
          relationship this academy serves is pedagogical: a tutor and a student, inside a
          subject, working through it together.
        </LegalP>
        <LegalP>
          The academy's study lens offers Socratic reflection: a guiding question, a conceptual
          hint, or a reference to the student's own preserved work. It never supplies answers,
          never completes exercises, and never replaces the tutor. No outcome is promised — no
          score, no rank, no result of any examination. The academy offers a place to work, and
          the working remains the student's own.
        </LegalP>
      </LegalSection>

      <LegalSection title="2 · Accounts, as they stand today">
        <LegalP>
          This deployment issues test accounts only. Every account created here is marked a test
          account in the database, and real student onboarding is not open. The legal framework
          — these terms, the privacy notice, and the guardian consent gate — stands so that the
          door can open honestly when the academy's owner opens it; until then, nothing on this
          site pretends otherwise.
        </LegalP>
        <LegalP>
          Accepting these terms is recorded in the consent audit as version terms_v1: who
          accepted, when, and a one-way hash of the connecting address. The record belongs to the
          account it was made for, and only that account can read it.
        </LegalP>
      </LegalSection>

      <LegalSection title="3 · The student's work belongs to the student">
        <LegalP>
          Everything a student brings into a subject environment stays the student's own. This
          includes, without limitation: proofs and solutions written during a session, inquiries
          put to the study lens, progress milestones reached, and the board work, session
          notations and chamber audio preserved from live classes. The academy stores these
          records so the teaching relationship can hold them; it claims no ownership over them
          and no licence to exploit them commercially. A student's words stand as asked,
          unedited, and are shown to the people the relationship admits — the student, and the
          tutors placed with them in that subject. No one else.
        </LegalP>
      </LegalSection>

      <LegalSection title="4 · No commercial lock-in">
        <LegalP>
          The academy does not sell access in-product: there are no plans, no checkout, no
          invoices and no payments anywhere on this site. Enrolment in a subject is a choice the
          student makes, and withdrawal is one quiet act — the enrolment is marked withdrawn and
          the door closes without penalty. Records held by the academy fall away with the
          account: deleting an account deletes its rows across every table, by construction.
          Nothing here is designed to be difficult to leave.
        </LegalP>
      </LegalSection>

      <LegalSection title="5 · Conduct of the relationship">
        <LegalList
          items={[
            "A tutor teaches only inside the subjects of their placement, and sees only the students placed with them there. This is enforced in the database, not merely in policy.",
            "A student's inquiries are preparation material for the next dialogue — never material for scoring, rating or flagging.",
            "Neither party is subject to surveillance: no attendance timers, no attention measurement, no activity scoring exists anywhere in the platform.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6 · Change and versioning">
        <LegalP>
          These terms change by version. A material revision publishes as terms_v2 (and so on);
          the previous version stays readable, and continued use of the academy asks for a new,
          recorded consent to the new version. Silence is never consent, and a change never
          applies backwards.
        </LegalP>
        <LegalP>
          Questions about these terms belong with the privacy notice's contact section, which
          names how the academy is reached.
        </LegalP>
      </LegalSection>
    </LegalPage>
  );
}
