"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Alert, Button } from "@/components/ui";
import { HeroCanvas } from "@/components/home/hero-canvas";
import { ROUTES } from "@/config/routes";
import { SUBJECTS } from "@/lib/subjects/subjects";
import { startTutorRegistrationPaymentAction } from "@/lib/tutor/registration-actions";
import type {
  TutorApplicationActionResult,
  TutorApplicationRecord,
  TutorPaymentReadiness,
  TutorRegistrationPaymentRecord,
} from "@/lib/tutor/registration";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(date);
}

export function TutorPaymentPanel({
  application,
  payment,
  readiness,
  returnStatus,
  receiptUrl,
}: {
  application: TutorApplicationRecord | null;
  payment: TutorRegistrationPaymentRecord | null;
  readiness: TutorPaymentReadiness;
  returnStatus: string | null;
  receiptUrl: string | null;
}) {
  const [result, action, pending] = useActionState<TutorApplicationActionResult | null, FormData>(startTutorRegistrationPaymentAction, null);

  const isSubmitted = Boolean(application && application.status !== "pending_payment");
  const isPaid = payment?.status === "paid" && application?.status !== "pending_payment";
  const isPaymentPending = payment?.status === "pending";
  const modeLabel = isPaid
    ? (payment?.mode === "test" ? "VERIFIED TEST PAYMENT · NO REAL FUNDS" : "VERIFIED LIVE PAYMENT")
    : readiness.modeLabel;
  const subjects = application?.subjects
    .map((id) => SUBJECTS.find((subject) => subject.id === id)?.name ?? id)
    .join(", ") || "Not available";
  const classList = application?.classes.map((level) => `Class ${level}`).join(", ") || "Not available";

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#FDFBF7] px-4 py-10 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 opacity-25">
          <HeroCanvas />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(253,251,247,0.78),rgba(253,251,247,0.44)_52%,rgba(253,251,247,0.8))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.7),transparent_68%)]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href={ROUTES.tutorApply} className="text-sm font-semibold text-[#0A192F] underline decoration-[#C5A059] decoration-2 underline-offset-4 hover:text-[#7E6126]">
            ← Return to application
          </Link>
          <span className="rounded-full border border-[#C5A059]/50 bg-white/80 px-3 py-1 text-[0.68rem] font-bold tracking-[0.13em] text-[#76591F]">
            {modeLabel}
          </span>
        </div>

        <section className="rounded-[1.75rem] border border-[#C5A059]/45 bg-white/95 p-6 shadow-[0_28px_90px_-36px_rgba(10,25,47,0.32)] backdrop-blur-xl sm:p-10" aria-labelledby="payment-heading">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.27em] text-[#9A7830]">Tutors Academy · Registration</p>
            <h1 id="payment-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#0A192F] sm:text-[2.65rem]" style={{ fontFamily: "var(--ta-font-display)" }}>
              Complete Your Tutor Registration
            </h1>

            {application?.status === "pending_payment" ? (
              <p className="mt-4 text-base leading-relaxed text-slate-700">
                Your application details have been saved. Complete the ₹699 registration payment to finish submitting your application.
              </p>
            ) : application ? null : (
              <Alert variant="warning" title="No saved application was found" className="mt-5">
                <p>Your application details could not be verified in secure storage. Nothing on this page represents a saved application or a completed payment.</p>
              </Alert>
            )}

            {isPaid ? (
              <div className="mt-7 space-y-5">
                <Alert variant="success" title="Registration payment verified">
                  <p>Payment successful. Your tutor application has been submitted.</p>
                </Alert>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6" aria-label="Payment receipt">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0A192F]">
                    <CheckCircle2 className="size-5 text-emerald-700" aria-hidden="true" />
                    Registration payment receipt
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-slate-600">Description</dt><dd className="mt-0.5 font-medium text-slate-900">Tutor registration</dd></div>
                    <div><dt className="text-slate-600">Amount paid</dt><dd className="mt-0.5 font-semibold text-slate-900">₹699.00 INR</dd></div>
                    <div className="sm:col-span-2"><dt className="text-slate-600">Payment reference</dt><dd className="mt-0.5 break-all font-mono text-xs text-slate-900">{payment?.providerPaymentId ?? payment?.checkoutSessionId ?? payment?.id ?? "Verified payment"}</dd></div>
                    <div><dt className="text-slate-600">Paid on</dt><dd className="mt-0.5 font-medium text-slate-900">{formatDate(payment?.paidAt ?? null)}</dd></div>
                    <div><dt className="text-slate-600">Payment environment</dt><dd className="mt-0.5 font-medium text-slate-900">{payment?.mode === "test" ? "Stripe test mode · no real funds moved" : "Stripe live payment"}</dd></div>
                  </dl>
                  {receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-sm font-semibold text-[#76591F] underline decoration-[#C5A059] underline-offset-4">
                      Open Stripe receipt (opens in a new tab)
                    </a>
                  ) : (
                    <p className="mt-4 text-xs leading-relaxed text-slate-600">Keep this receipt and payment reference for your records.</p>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Your application is now awaiting review. Payment confirms submission only; it is not approval, an offer, or a guarantee of hiring.
                </p>
              </div>
            ) : isSubmitted ? (
              <Alert variant="info" title="Application submitted" className="mt-6">
                <p>This application is no longer awaiting a registration payment. Payment does not mean approval or hiring. If the status looks incorrect, please contact the academy before trying to pay again.</p>
              </Alert>
            ) : application ? (
              <>
                <div className="mt-7 overflow-hidden rounded-2xl border border-[#E7DFC9] bg-[#FDFBF7]">
                  <div className="flex items-center justify-between gap-4 border-b border-[#E7DFC9] px-5 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Order summary</p>
                      <p className="mt-1 font-semibold text-[#0A192F]">Tutor registration</p>
                    </div>
                    <p className="text-lg font-semibold tabular-nums text-[#0A192F]">₹699</p>
                  </div>
                  <div className="space-y-2 px-5 py-4 text-sm text-slate-700">
                    <div className="flex justify-between gap-4"><span>Subtotal</span><span>₹699</span></div>
                    <div className="flex justify-between gap-4"><span>Additional charges</span><span>₹0</span></div>
                    <div className="mt-3 flex justify-between gap-4 border-t border-[#E7DFC9] pt-3 text-base font-bold text-[#0A192F]"><span>Total payable</span><span>₹699</span></div>
                    <p className="pt-1 text-xs text-slate-600">No undisclosed additional charges.</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-5">
                  <h2 className="text-sm font-semibold text-[#0A192F]">Application summary</h2>
                  <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-slate-500">Applicant</dt><dd className="mt-0.5 font-medium text-slate-900">{application.name}</dd></div>
                    <div><dt className="text-slate-500">Board</dt><dd className="mt-0.5 font-medium text-slate-900">{application.board}</dd></div>
                    <div><dt className="text-slate-500">Subjects</dt><dd className="mt-0.5 font-medium text-slate-900">{subjects}</dd></div>
                    <div><dt className="text-slate-500">Classes</dt><dd className="mt-0.5 font-medium text-slate-900">{classList}</dd></div>
                  </dl>
                </div>

                {returnStatus === "cancelled" ? (
                  <Alert variant="warning" title="Checkout was not completed" className="mt-5">
                    <p>Payment has not been confirmed. You can safely resume the existing secure checkout; do not start a second payment in another tab.</p>
                  </Alert>
                ) : null}
                {returnStatus === "unavailable" ? (
                  <Alert variant="warning" title="Payment status is temporarily unavailable" className="mt-5">
                    <p>We could not contact the payment service to verify this return. Do not pay again yet. Refresh this page or contact the academy with your Stripe reference.</p>
                  </Alert>
                ) : null}
                {returnStatus === "invalid" ? (
                  <Alert variant="warning" title="Payment return could not be matched" className="mt-5">
                    <p>This return could not be matched to a verified payment for this saved application. No success is being shown. Check your application status before trying again.</p>
                  </Alert>
                ) : null}
                {returnStatus === "failed" && payment?.status !== "failed" ? (
                  <Alert variant="warning" title="Payment did not complete" className="mt-5">
                    <p>Stripe reports that this attempt did not complete. You may safely retry after checking your bank or card statement.</p>
                  </Alert>
                ) : null}
                {returnStatus === "expired" && payment?.status !== "expired" ? (
                  <Alert variant="warning" title="Payment session expired" className="mt-5">
                    <p>The secure checkout session expired before a payment was completed. You may start a new secure attempt.</p>
                  </Alert>
                ) : null}
                {payment?.status === "failed" || payment?.status === "expired" ? (
                  <Alert variant="warning" title={payment.status === "expired" ? "Payment session expired" : "Payment did not complete"} className="mt-5">
                    <p>No successful registration payment is recorded for this attempt. You may safely retry; an open checkout will be reused and a fresh one is created only after the previous session expires or fails.</p>
                  </Alert>
                ) : null}
                {isPaymentPending ? (
                  <Alert variant="info" title="Payment confirmation pending" className="mt-5">
                    <p>We have not yet received confirmation from Stripe. Refresh this page in a moment; the payment button will reuse the same open checkout rather than creating another charge.</p>
                  </Alert>
                ) : null}

                <div className="mt-5 rounded-2xl border border-[#D9D2C2] bg-[#FAF8F2] p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#8A6820]" aria-hidden="true" />
                    <div>
                      <h2 className="text-sm font-semibold text-[#0A192F]">Refund policy for the registration fee</h2>
                      {readiness.refundPolicy ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{readiness.refundPolicy}</p>
                      ) : (
                        <p className="mt-2 text-sm leading-relaxed text-rose-800">An approved tutor-registration refund policy has not been supplied. Payment is disabled until the actual policy is approved and displayed here.</p>
                      )}
                    </div>
                  </div>
                </div>

                {readiness.mode !== "live" ? (
                  <Alert variant="info" title={readiness.mode === "test" ? "Test mode · no real payment" : "Preview mode · no payment"} className="mt-5">
                    <p>{readiness.mode === "test" ? "Checkout, if enabled, uses Stripe test credentials only. No real funds move and this is not a live registration payment." : "This preview cannot take payment. Successful payment is not simulated."}</p>
                  </Alert>
                ) : null}
                {!readiness.canPay ? (
                  <Alert variant="warning" title="Payment unavailable" className="mt-5">
                    <p>{readiness.message || "Payment is not configured for this deployment. Your saved application is still available for editing."}</p>
                  </Alert>
                ) : null}
                {result ? (
                  <p role="alert" className="mt-4 text-sm leading-relaxed text-rose-800">{result.note}</p>
                ) : null}

                <form action={action} className="mt-6">
                  <Button type="submit" size="lg" loading={pending} disabled={!readiness.canPay || pending} className="w-full justify-center sm:w-auto">
                    Pay ₹699 &amp; Complete Registration
                  </Button>
                </form>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                  Card details are entered only on Stripe’s secure hosted checkout.
                </p>
              </>
            ) : (
              <div className="mt-6">
                <Alert variant="warning" title="Application storage is not configured">
                  <p>{readiness.message || "Return to the application page and contact the academy. No payment can be attempted without a verified saved application."}</p>
                </Alert>
                <Link href={ROUTES.tutorApply} className="mt-5 inline-flex text-sm font-semibold text-[#76591F] underline underline-offset-4">Return to the application form</Link>
              </div>
            )}
          </div>
        </section>

        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-slate-600">
          Tutors Academy reviews every application separately. A successful registration payment submits the application for review; it does not constitute approval or hiring.
        </p>
      </div>
    </main>
  );
}
