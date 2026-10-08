import { NextResponse } from "next/server";

import { settleInvoice } from "@/lib/payments/settle";

/* ════════════════════════════════════════════════════════════════════════
   PAYMENT WEBHOOK (Track 3, DEC-044)

   The provider's settlement notice. The signature is verified against
   STRIPE_WEBHOOK_SECRET before any event is trusted; an unverified or
   unconfigured endpoint answers with one calm sentence and changes
   nothing. Settlement itself is idempotent: settling an already-settled
   invoice is a no-op read.
   ════════════════════════════════════════════════════════════════════════ */

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return NextResponse.json({ received: false, note: "The payment provider is not configured for this deployment." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ received: false, note: "No signature accompanied the notice." }, { status: 400 });
  }

  const body = await request.text();
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);

  let event: import("stripe").Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret);
  } catch {
    return NextResponse.json({ received: false, note: "The notice could not be verified." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const invoiceId = typeof session.metadata?.invoice_id === "string" ? session.metadata.invoice_id : null;
    if (invoiceId) {
      await settleInvoice(invoiceId, typeof session.payment_intent === "string" ? session.payment_intent : null);
    }
  }

  return NextResponse.json({ received: true });
}
