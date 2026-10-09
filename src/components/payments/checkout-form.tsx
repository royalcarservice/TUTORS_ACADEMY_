"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { checkoutAction, type CheckoutActionResult } from "@/lib/payments/actions";

/* Billing contact for the receipt. In live mode the provider's hosted
   page collects the payment itself; in demonstration mode the settle is
   simulated and the same confirmation page follows. */

const inputSkin =
  "w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground " +
  "min-h-[max(2.75rem,var(--ta-control-h))] focus:outline-none focus:ring-2 focus:ring-brand-300";

export function CheckoutForm({ subjectId, configured }: { subjectId: string; configured: boolean }) {
  const [result, formAction] = useActionState<CheckoutActionResult | null, FormData>(checkoutAction, null);

  return (
    <Card className="mt-8" variant="raised">
      <Card.Header>
        <Card.Title>Billing details</Card.Title>
        <Card.Description>
          The name the receipt carries, and the address it is sent to. For a student under 18, the billing
          contact is the guardian who holds the consent.
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="subjectId" value={subjectId} />
          <Field id="billing-name" label="Student or guardian name">
            <input name="billingName" required autoComplete="name" className={inputSkin} placeholder="The name the receipt carries" />
          </Field>
          <Field id="billing-email" label="Billing email">
            <input name="billingEmail" type="email" required autoComplete="email" className={inputSkin} placeholder="receipts arrive here" />
          </Field>
          <div className="sm:col-span-2 flex flex-col gap-3">
            <Button type="submit" className="self-start">
              {configured ? "Continue to secure payment" : "Simulate tuition settlement"}
            </Button>
            {result ? (
              <p aria-live="polite" className="text-sm leading-relaxed text-foreground-muted">{result.note}</p>
            ) : (
              <p className="text-xs leading-relaxed text-foreground-subtle">
                One payment per term per subject. No plans, no renewal that runs without asking.
              </p>
            )}
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
