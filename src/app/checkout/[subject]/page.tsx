import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/payments/checkout-form";
import { Container } from "@/components/ui/container";
import { requireIdentity } from "@/lib/auth/session";
import { isAuthConfigured } from "@/lib/supabase/env";
import { getSubject } from "@/lib/subjects/subjects";
import { formatTuition, TERM_TUITION_CENTS, TUITION_CURRENCY } from "@/lib/payments/tuition";

export const metadata: Metadata = {
  title: "Checkout · Tutors Academy",
  description: "The financial threshold for one term in one subject chamber.",
};

export default async function CheckoutPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const subjectConfig = getSubject(subject);
  if (!subjectConfig) notFound();

  const configured = isAuthConfigured();
  if (configured) {
    /* In a configured deployment the threshold belongs to a signed-in student. */
    await requireIdentity("student", `/checkout/${subject}`);
  }

  return (
    <Container width="narrow" className="py-12 sm:py-16">
      {!configured ? (
        <div role="note" className="mb-6 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3">
          <p className="text-sm leading-relaxed text-warning-700">
            Demonstration mode. No payment provider is configured, so the settlement below is simulated against the
            fixture ledger: nothing is charged, nothing persists, and the banner says exactly that.
          </p>
        </div>
      ) : null}

      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-foreground-subtle uppercase">Checkout · {subjectConfig.name}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500 }}>
            {subjectConfig.tagline}
          </h1>
        </div>
        <p className="shrink-0 text-2xl font-semibold text-foreground tabular-nums">
          {formatTuition(TERM_TUITION_CENTS, TUITION_CURRENCY)}
          <span className="block text-xs font-normal text-foreground-muted">per term</span>
        </p>
      </header>

      <CheckoutForm subjectId={subjectConfig.id} configured={configured} />
    </Container>
  );
}
