import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getSubject } from "@/lib/subjects/subjects";

export const metadata: Metadata = {
  title: "Tuition confirmed · Tutors Academy",
  description: "The threshold is crossed; the chamber is open.",
};

/* The confirmation is one calm sentence and one door. No upsell, no
   confetti — the next act is the subject itself. */

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; placed?: string }>;
}) {
  const { subject, placed } = await searchParams;
  const subjectConfig = getSubject(subject ?? "");
  const name = subjectConfig?.name ?? "the subject";
  const href = subjectConfig ? `/subjects/${subjectConfig.id}` : "/subjects";

  return (
    <Container width="narrow" className="py-16 sm:py-24">
      <p className="text-xs font-semibold tracking-wide text-foreground-subtle uppercase">Tuition confirmed</p>
      <h1
        className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500 }}
      >
        {placed === "1"
          ? `Tuition confirmed. Your placement in ${name} is now active.`
          : `Tuition confirmed. Your enrolment in ${name} is active; the academy places you with a tutor.`}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-muted">
        The receipt is on its way to the billing contact. Withdrawal, whenever it comes, remains one quiet act —
        the refund follows pro-rata to the day of leaving.
      </p>
      <div className="mt-8">
        <Link href={href}>
          <Button size="lg">Enter {name} chamber</Button>
        </Link>
      </div>
    </Container>
  );
}
