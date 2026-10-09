import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GuardianGate } from "@/components/legal/guardian-gate";
import { ROUTES } from "@/config/routes";
import { getIdentity } from "@/lib/auth/session";
import { isMinorAt, ONBOARDING_COPY } from "@/lib/auth/onboarding";
import { startGuardianVerification } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Guardian consent gate",
  description: "The guardian consent gate for student accounts under 18.",
};

/* THE GUARDIAN GATE, WIRED (Phase 10 · Step 2, DEC-038).
   The continuation surface for a pending_guardian student: sign in, and
   this page renders the Step 1 gate wired to the onboarding act —
   naming the guardian issues the verification link (the ledger's row,
   the one-way token hash, the 7-day expiry). Already-adult and
   already-verified accounts meet one calm sentence each; no identity
   meets the login door. */

export default async function RegisterGuardianPage() {
  const identity = await getIdentity();
  if (!identity) redirect(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.registerGuardian)}`);

  const supabase = await createClient();
  if (!supabase) {
    return (
      <Shell>
        <p className="text-sm leading-relaxed text-foreground-muted">
          This gate is not configured in this deployment. Nothing is asked, and nothing is sent.
        </p>
      </Shell>
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("date_of_birth, guardian_verified")
    .eq("id", identity.id)
    .maybeSingle();

  const dobIso: string | null = profile?.date_of_birth ?? null;
  const verified: boolean = profile?.guardian_verified ?? false;
  const now = new Date();
  const dob = dobIso ? new Date(`${dobIso}T00:00:00Z`) : null;
  const isMinor = dob ? isMinorAt(dob, now) : false;

  if (!dob) {
    return (
      <Shell>
        <p className="text-sm leading-relaxed text-foreground-muted">{ONBOARDING_COPY.guardianGateNotNeeded}</p>
        <ContinueLink />
      </Shell>
    );
  }
  if (!isMinor) {
    return (
      <Shell>
        <p className="text-sm leading-relaxed text-foreground-muted">{ONBOARDING_COPY.guardianGateNotNeeded}</p>
        <ContinueLink />
      </Shell>
    );
  }
  if (verified) {
    return (
      <Shell>
        <p className="text-sm leading-relaxed text-foreground-muted">{ONBOARDING_COPY.guardianGateDone}</p>
        <ContinueLink />
      </Shell>
    );
  }

  return (
    <Shell>
      <GuardianGate
        action={startGuardianVerification}
        submitLabel="Record guardian consent"
        pendingLabel="Recording…"
      />
      <p className="text-sm leading-relaxed text-foreground-muted">
        Your guardian will receive a confirmation link. Until they follow
        it, you can read the academy, but subject enrolment waits — the
        database enforces the pause, not just this page.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Guardian consent gate
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
          The DPDP Act 2023 asks a guardian to confirm consent before a
          student under 18 enrols in subject chambers.
        </p>
      </header>
      {children}
    </div>
  );
}

function ContinueLink() {
  return (
    <p className="text-sm">
      <Link href={ROUTES.student} className="font-semibold text-brand-600 hover:text-brand-900">
        Continue to your portal
      </Link>
    </p>
  );
}
