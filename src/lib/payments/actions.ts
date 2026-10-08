"use server";

import { redirect } from "next/navigation";

import { getIdentity } from "@/lib/auth/session";
import { SUBJECTS } from "@/lib/subjects/subjects";
import { isAuthConfigured } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/service";

import { demoSettle } from "./settle";
import { TERM_TUITION_CENTS, TUITION_CURRENCY } from "./tuition";

/* ════════════════════════════════════════════════════════════════════════
   CHECKOUT ACTIONS (Track 3, DEC-044)

   DEMONSTRATION: the simulate button drives demoSettle() and lands on the
   confirmation page — the post-payment transition, testable offline.
   LIVE: a pending invoice is recorded, a Stripe hosted Checkout session is
   created and the browser is handed to the provider's own secure page (a
   top-level navigation — the CSP never meets a third-party script). The
   webhook settles; the confirmation follows.
   ════════════════════════════════════════════════════════════════════════ */

export interface CheckoutActionResult {
  ok: boolean;
  note: string;
}

export async function checkoutAction(_prev: CheckoutActionResult | null, formData: FormData): Promise<CheckoutActionResult> {
  const subjectId = String(formData.get("subjectId") ?? "");
  const billingEmail = String(formData.get("billingEmail") ?? "").trim();
  if (!SUBJECTS.some((s) => s.id === subjectId)) {
    return { ok: false, note: "That chamber does not exist. Nothing was charged." };
  }
  if (!billingEmail || !billingEmail.includes("@")) {
    return { ok: false, note: "A billing contact is required for the receipt. Nothing was charged." };
  }

  if (!isAuthConfigured()) {
    const result = await demoSettle(subjectId);
    redirect(`/checkout/success?subject=${encodeURIComponent(subjectId)}&placed=${result.placementMade ? "1" : "0"}`);
  }

  const identity = await getIdentity();
  if (!identity || identity.role !== "student") {
    return { ok: false, note: "Checkout requires a signed-in student identity. Nothing was charged." };
  }
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, note: "The payment provider is not configured for this deployment. Nothing was charged." };
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { ok: false, note: "The payment provider is not configured for this deployment. Nothing was charged." };

  const { data: invoice, error: invoiceErr } = await supabase
    .from("tuition_invoices")
    .insert({ student_id: identity.id, subject_id: subjectId, amount_cents: TERM_TUITION_CENTS, currency: TUITION_CURRENCY, status: "pending", provider: "stripe" })
    .select()
    .single();
  if (invoiceErr || !invoice) return { ok: false, note: "The invoice could not be opened. Nothing was charged." };

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeKey);
  const subjectName = SUBJECTS.find((s) => s.id === subjectId)?.name ?? subjectId;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: billingEmail,
    client_reference_id: identity.id,
    metadata: { invoice_id: invoice.id, subject_id: subjectId },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: TUITION_CURRENCY.toLowerCase(),
          unit_amount: TERM_TUITION_CENTS,
          product_data: { name: `Tutors Academy — ${subjectName} term tuition` },
        },
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout/success?subject=${subjectId}&placed=0`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/checkout/${subjectId}`,
  });
  redirect(session.url ?? `/checkout/${subjectId}`);
}
