import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { formatTuition, TERM_TUITION_CENTS, TUITION_CURRENCY, TUITION_INCLUDES, TUITION_REFUND_POLICY } from "@/lib/payments/tuition";
import { SUBJECTS } from "@/lib/subjects/subjects";

export const metadata: Metadata = {
  title: "Tuition · Tutors Academy",
  description: "One flat term tuition per subject chamber. What it includes, and the refund that follows a quiet withdrawal.",
};

/* The financial threshold, presented the way everything else here is
   presented: one price, no anchors, no countdown, nothing that hurries. */

export default function TuitionPage() {
  return (
    <Container width="narrow" className="py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-wide text-foreground-subtle uppercase">Tuition</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500 }}>
          One flat term tuition, the same for every chamber.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground-muted">
          {formatTuition(TERM_TUITION_CENTS, TUITION_CURRENCY)} per term, per subject. There are no tiers and no
          introductory prices: the threshold is identical for every chamber, and nothing inside a chamber ever
          asks for payment again.
        </p>
      </header>

      <section aria-labelledby="includes" className="mt-10">
        <h2 id="includes" className="text-sm font-semibold tracking-wide text-foreground-subtle uppercase">What tuition holds</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {TUITION_INCLUDES.map((line) => (
            <li key={line} className="max-w-2xl text-base leading-relaxed text-foreground-muted">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="refund" className="mt-10 max-w-2xl rounded-lg border border-border bg-surface px-5 py-4">
        <h2 id="refund" className="text-sm font-semibold tracking-wide text-foreground-subtle uppercase">Refund and withdrawal</h2>
        <p className="mt-2 text-base leading-relaxed text-foreground-muted">{TUITION_REFUND_POLICY}</p>
      </section>

      <section aria-labelledby="select" className="mt-12">
        <h2 id="select" className="text-sm font-semibold tracking-wide text-foreground-subtle uppercase">Select subject for enrolment</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <Card key={s.id}>
              <Card.Header>
                <Card.Title>{s.name}</Card.Title>
                <Card.Description>{s.tagline}</Card.Description>
              </Card.Header>
              <Card.Body className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-foreground tabular-nums">{formatTuition(TERM_TUITION_CENTS, TUITION_CURRENCY)}</p>
                <Link href={`/checkout/${s.id}`}>
                  <Button variant="secondary" size="sm">Select for enrolment</Button>
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  );
}
