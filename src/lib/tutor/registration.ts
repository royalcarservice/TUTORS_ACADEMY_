import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { ROUTES } from "@/config/routes";
import { isAuthConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const TUTOR_REGISTRATION_AMOUNT_PAISE = 69_900;
export const TUTOR_REGISTRATION_CURRENCY = "INR" as const;
const APPLICATION_COOKIE = "ta_tutor_application";

export type TutorApplicationStatus = "pending_payment" | "pending_approval" | "approved" | "rejected";
export type TutorRegistrationPaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

export interface TutorApplicationRecord {
  id: string;
  name: string;
  email: string;
  background: string;
  subjects: string[];
  board: string;
  classes: string[];
  status: TutorApplicationStatus;
  submittedAt: string;
}

export interface TutorRegistrationPaymentRecord {
  id: string;
  status: TutorRegistrationPaymentStatus;
  mode: "test" | "live";
  providerPaymentId: string | null;
  checkoutSessionId: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface TutorApplicationActionResult {
  ok: boolean;
  note: string;
}

export interface TutorPaymentReadiness {
  storageConfigured: boolean;
  gatewayConfigured: boolean;
  returnUrlConfigured: boolean;
  refundPolicy: string | null;
  canPay: boolean;
  mode: "preview" | "test" | "live";
  modeLabel: string;
  message: string;
}

function getPaymentReturnOrigin(): string | null {
  const context = process.env.CONTEXT ?? "";
  const candidate = context === "production"
    ? process.env.URL ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL
    : context
      ? process.env.DEPLOY_PRIME_URL
      : process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL;
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getTutorPaymentReadiness(): TutorPaymentReadiness {
  const storageConfigured = isAuthConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const context = process.env.CONTEXT ?? "";
  const isNetlifyProduction = context === "production";
  const isPreview = !isNetlifyProduction;
  const hasWebhookSecret = webhookSecret.startsWith("whsec_") && webhookSecret.length > 24;
  const testKey = stripeSecret.startsWith("sk_test_") && stripeSecret.length > 24;
  const liveKey = stripeSecret.startsWith("sk_live_") && stripeSecret.length > 24;
  const testGateway = testKey && hasWebhookSecret;
  const liveGateway = liveKey && hasWebhookSecret && isNetlifyProduction
    && process.env.TUTOR_REGISTRATION_LIVE_PAYMENTS_ENABLED === "true";
  const gatewayConfigured = testGateway || liveGateway;
  const mode: TutorPaymentReadiness["mode"] = testGateway ? "test" : liveGateway ? "live" : "preview";
  const refundPolicy = process.env.TUTOR_REGISTRATION_REFUND_POLICY?.trim() || null;
  const returnUrlConfigured = Boolean(getPaymentReturnOrigin());
  const canPay = storageConfigured && gatewayConfigured && returnUrlConfigured && Boolean(refundPolicy);

  let message = "";
  if (!storageConfigured) {
    message = "Application storage is not configured. Your details cannot be saved here, so payment is unavailable.";
  } else if (isPreview && liveKey) {
    message = "This is a preview deployment. Live payment keys are blocked here; configure Stripe test credentials for preview testing.";
  } else if (!gatewayConfigured) {
    message = "The Stripe test gateway is not configured. No payment can be attempted in this preview.";
  } else if (!refundPolicy) {
    message = "An approved refund policy for this registration fee has not been supplied. Payment is disabled until it is published.";
  } else if (!returnUrlConfigured) {
    message = "A secure payment return URL is not configured for this deployment. No payment can be attempted.";
  }

  const modeLabel = mode === "live"
    ? "LIVE PAYMENT"
    : mode === "test"
      ? "TEST MODE · Stripe test account only; no real funds move."
      : "PREVIEW MODE · No payment can be completed here.";

  return { storageConfigured, gatewayConfigured, returnUrlConfigured, refundPolicy, canPay, mode, modeLabel, message };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createTutorApplicationAccessToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export async function setTutorApplicationAccessCookie(id: string, token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(APPLICATION_COOKIE, `${id}.${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: ROUTES.tutorApply,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getTutorApplicationAccess(): Promise<{
  hasCookie: boolean;
  tokenHash: string | null;
  application: TutorApplicationRecord | null;
}> {
  const cookieStore = await cookies();
  const value = cookieStore.get(APPLICATION_COOKIE)?.value;
  const hasCookie = Boolean(value);
  const service = createServiceClient();
  if (!service) return { hasCookie, tokenHash: null, application: null };

  let id: string | null = null;
  let tokenHash: string | null = null;
  if (value) {
    const [candidateId, token, ...rest] = value.split(".");
    if (!candidateId || !token || rest.length || !/^[0-9a-f-]{36}$/i.test(candidateId) || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      id = null;
    } else {
      id = candidateId;
      tokenHash = hashToken(token);
      const { data, error } = await service
        .from("tutor_applications")
        .select("id, applicant_name, email, academic_background, subject_ids, board, class_levels, status, submitted_at, application_token_hash")
        .eq("id", id)
        .eq("application_token_hash", tokenHash)
        .maybeSingle();
      if (!error && data) return { hasCookie: true, tokenHash, application: mapTutorApplication(data) };
    }
  }

  // The token cookie is the anonymous access path. An authenticated owner can
  // still recover their own saved application if they return on another device
  // or clear that cookie; the service query is strictly keyed by auth.uid().
  const supabase = await createClient();
  if (!supabase) return { hasCookie, tokenHash, application: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (id && id !== user.id)) return { hasCookie, tokenHash, application: null };
  const { data, error } = await service
    .from("tutor_applications")
    .select("id, applicant_name, email, academic_background, subject_ids, board, class_levels, status, submitted_at, application_token_hash")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return { hasCookie, tokenHash, application: null };
  return {
    hasCookie,
    tokenHash: data.application_token_hash as string,
    application: mapTutorApplication(data),
  };
}

function mapTutorApplication(data: Record<string, unknown>): TutorApplicationRecord {
  return {
    id: data.id as string,
    name: data.applicant_name as string,
    email: data.email as string,
    background: data.academic_background as string,
    subjects: (data.subject_ids as string[]) ?? [],
    board: data.board as string,
    classes: (data.class_levels as string[]) ?? [],
    status: data.status as TutorApplicationStatus,
    submittedAt: String(data.submitted_at ?? "").slice(0, 10),
  };
}

export async function getLatestTutorRegistrationPayment(applicationId: string): Promise<TutorRegistrationPaymentRecord | null> {
  const service = createServiceClient();
  if (!service) return null;
  const { data, error } = await service
    .from("tutor_registration_payments")
    .select("id, status, mode, provider_payment_id, checkout_session_id, created_at, paid_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id as string,
    status: data.status as TutorRegistrationPaymentStatus,
    mode: data.mode as "test" | "live",
    providerPaymentId: (data.provider_payment_id as string | null) ?? null,
    checkoutSessionId: (data.checkout_session_id as string | null) ?? null,
    createdAt: String(data.created_at ?? ""),
    paidAt: data.paid_at ? String(data.paid_at) : null,
  };
}

async function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || secret.length <= 24 || (!secret.startsWith("sk_test_") && !secret.startsWith("sk_live_"))) return null;
  const context = process.env.CONTEXT ?? "";
  if (context !== "production" && secret.startsWith("sk_live_")) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(secret);
}

async function markPaymentAttempt(
  paymentId: string,
  sessionId: string,
  status: "failed" | "expired",
): Promise<boolean> {
  const service = createServiceClient();
  if (!service) return false;
  const { data, error } = await service
    .from("tutor_registration_payments")
    .update({ status })
    .eq("id", paymentId)
    .eq("checkout_session_id", sessionId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) return false;
  if (data) return true;
  const { data: current, error: readError } = await service
    .from("tutor_registration_payments")
    .select("status")
    .eq("id", paymentId)
    .eq("checkout_session_id", sessionId)
    .maybeSingle();
  return !readError && current?.status === status;
}

export interface TutorPaymentVerification {
  status: "paid" | "pending" | "failed" | "expired" | "unavailable" | "invalid";
  applicationId?: string;
  paymentId?: string;
  reference?: string;
  paidAt?: string;
  mode?: "test" | "live";
}

/** Retrieve and verify Stripe's server-side Checkout record before settlement. */
export async function verifyTutorRegistrationCheckout(
  sessionId: string,
  expectedApplicationId?: string,
): Promise<TutorPaymentVerification> {
  const service = createServiceClient();
  const stripe = await getStripeClient();
  if (!service || !stripe) return { status: "unavailable" };

  let session: import("stripe").Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { status: "invalid" };
  }

  const metadata = session.metadata ?? {};
  const applicationId = metadata.application_id;
  const paymentId = metadata.payment_id;
  if (metadata.flow !== "tutor_registration" || !applicationId || !paymentId
      || (expectedApplicationId && expectedApplicationId !== applicationId)
      || session.client_reference_id !== applicationId
      || session.mode !== "payment"
      || session.amount_total !== TUTOR_REGISTRATION_AMOUNT_PAISE
      || session.currency?.toUpperCase() !== TUTOR_REGISTRATION_CURRENCY) {
    return { status: "invalid" };
  }

  const { data: payment, error } = await service
    .from("tutor_registration_payments")
    .select("id, application_id, mode, status, checkout_session_id, provider_payment_id, paid_at")
    .eq("id", paymentId)
    .eq("application_id", applicationId)
    .eq("checkout_session_id", session.id)
    .maybeSingle();
  if (error || !payment) return { status: "invalid" };
  if ((payment.mode === "live") !== session.livemode) return { status: "invalid" };

  if (payment.status === "paid") {
    return {
      status: "paid",
      applicationId,
      paymentId,
      reference: (payment.provider_payment_id as string | null) ?? session.id,
      paidAt: payment.paid_at ? String(payment.paid_at) : undefined,
      mode: payment.mode as "test" | "live",
    };
  }
  if (payment.status === "failed") return { status: "failed", applicationId, paymentId, mode: payment.mode as "test" | "live" };
  if (payment.status === "expired") return { status: "expired", applicationId, paymentId, mode: payment.mode as "test" | "live" };
  if (payment.status === "refunded") return { status: "invalid", applicationId, paymentId, mode: payment.mode as "test" | "live" };

  if (session.status === "expired") {
    const marked = await markPaymentAttempt(paymentId, session.id, "expired");
    return { status: marked ? "expired" : "pending", applicationId, paymentId, mode: payment.mode as "test" | "live" };
  }

  if (session.payment_status !== "paid") {
    return { status: "pending", applicationId, paymentId, mode: payment.mode as "test" | "live" };
  }

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;
  const { data: settled, error: settleError } = await service.rpc("settle_tutor_registration_payment", {
    p_payment_id: paymentId,
    p_session_id: session.id,
    p_payment_intent_id: paymentIntentId,
    p_amount_paise: TUTOR_REGISTRATION_AMOUNT_PAISE,
    p_currency: TUTOR_REGISTRATION_CURRENCY,
  });
  if (settleError || settled !== true) return { status: "pending", applicationId, paymentId, mode: payment.mode as "test" | "live" };

  return {
    status: "paid",
    applicationId,
    paymentId,
    reference: paymentIntentId ?? session.id,
    paidAt: new Date().toISOString(),
    mode: payment.mode as "test" | "live",
  };
}

/** Called only after the existing Stripe webhook signature has been verified. */
export async function handleTutorRegistrationStripeEvent(
  type: string,
  session: import("stripe").Stripe.Checkout.Session,
): Promise<void> {
  if (session.metadata?.flow !== "tutor_registration") return;
  const sessionId = session.id;
  const applicationId = session.metadata.application_id;
  if (!applicationId) return;

  if (type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded") {
    await verifyTutorRegistrationCheckout(sessionId, applicationId);
    return;
  }

  if (type !== "checkout.session.expired" && type !== "checkout.session.async_payment_failed") return;
  const service = createServiceClient();
  if (!service) return;
  const paymentId = session.metadata.payment_id;
  if (!paymentId) return;
  const marked = await markPaymentAttempt(paymentId, sessionId, type === "checkout.session.expired" ? "expired" : "failed");
  if (!marked) throw new Error("Tutor registration payment status could not be recorded");
}

export async function getTutorRegistrationReceiptUrl(paymentIntentId: string | null): Promise<string | null> {
  if (!paymentIntentId?.startsWith("pi_")) return null;
  const stripe = await getStripeClient();
  if (!stripe) return null;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
    const charge = typeof intent.latest_charge === "string" ? null : intent.latest_charge;
    const receiptUrl = charge && typeof charge !== "string" ? charge.receipt_url : null;
    if (!receiptUrl) return null;
    const parsed = new URL(receiptUrl);
    return parsed.protocol === "https:" && parsed.hostname === "pay.stripe.com" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function createTutorRegistrationCheckoutUrl(application: TutorApplicationRecord): Promise<
  { ok: true; url: string } | { ok: false; note: string }
> {
  const readiness = getTutorPaymentReadiness();
  if (!readiness.canPay) return { ok: false, note: readiness.message || "Payment is unavailable. No charge was attempted." };
  if (application.status !== "pending_payment") return { ok: false, note: "This application is no longer awaiting payment. No charge was attempted." };

  const service = createServiceClient();
  const stripe = await getStripeClient();
  if (!service || !stripe) return { ok: false, note: "The payment service is unavailable. No charge was attempted." };

  const { data: activeRows, error: activeError } = await service
    .from("tutor_registration_payments")
    .select("id, mode, checkout_session_id, created_at")
    .eq("application_id", application.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1);
  if (activeError) return { ok: false, note: "The payment attempt could not be checked. No new charge was created." };

  const active = activeRows?.[0];
  if (active?.checkout_session_id) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(active.checkout_session_id as string);
      if (existing.status === "open" && existing.payment_status !== "paid" && existing.url) {
        return { ok: true, url: existing.url };
      }
      if (existing.status === "complete" && existing.payment_status !== "paid") {
        return { ok: false, note: "Stripe is still processing this payment. Do not retry or start another payment; refresh this page for confirmation." };
      }
      if (existing.payment_status === "paid") {
        await verifyTutorRegistrationCheckout(existing.id, application.id);
        return { ok: false, note: "Payment confirmation is being recorded. Refresh this page before retrying; no duplicate checkout was opened." };
      }
      if (existing.status === "expired") {
        const marked = await markPaymentAttempt(active.id as string, existing.id, "expired");
        if (!marked) return { ok: false, note: "The expired payment attempt could not be closed safely. No new checkout was created; refresh or contact support." };
      }
    } catch {
      return { ok: false, note: "The existing payment attempt could not be verified. Refresh or contact support; no new checkout was opened." };
    }
  } else if (active) {
    const ageMs = Date.now() - new Date(String(active.created_at)).getTime();
    if (ageMs < 3 * 60 * 1000) {
      return { ok: false, note: "A payment session is being prepared. Refresh shortly before trying again." };
    }
    await service.from("tutor_registration_payments").update({ status: "failed" }).eq("id", active.id).eq("status", "pending");
  }

  const { data: payment, error: insertError } = await service
    .from("tutor_registration_payments")
    .insert({ application_id: application.id, provider: "stripe", mode: readiness.mode, amount_paise: TUTOR_REGISTRATION_AMOUNT_PAISE, currency: TUTOR_REGISTRATION_CURRENCY, status: "pending" })
    .select("id")
    .single();
  if (insertError || !payment) {
    // Another concurrent click may have won the partial unique index. The
    // next safe retry will reuse its open session instead of creating a charge.
    return { ok: false, note: "A payment attempt is already being prepared. Refresh shortly; no duplicate checkout was created." };
  }

  const origin = getPaymentReturnOrigin();
  if (!origin) {
    await service.from("tutor_registration_payments").update({ status: "failed" }).eq("id", payment.id);
    return { ok: false, note: "The secure payment return address is not configured. No charge was attempted." };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: application.email,
      client_reference_id: application.id,
      metadata: { flow: "tutor_registration", application_id: application.id, payment_id: payment.id as string },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: TUTOR_REGISTRATION_AMOUNT_PAISE,
          product_data: { name: "Tutors Academy — Tutor registration" },
        },
      }],
      allow_promotion_codes: false,
      automatic_tax: { enabled: false },
      success_url: `${origin}${ROUTES.tutorApplySuccess}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${ROUTES.tutorApplyPayment}?status=cancelled`,
    }, { idempotencyKey: `tutor-reg-${payment.id}` });

    if (!session.url) throw new Error("Stripe returned no hosted checkout URL");
    const { error: updateError } = await service
      .from("tutor_registration_payments")
      .update({ checkout_session_id: session.id })
      .eq("id", payment.id)
      .eq("status", "pending");
    if (updateError) throw new Error("Payment attempt could not be linked");
    return { ok: true, url: session.url };
  } catch {
    await service.from("tutor_registration_payments").update({ status: "failed" }).eq("id", payment.id).eq("status", "pending");
    return { ok: false, note: "Secure checkout could not be opened. Your application remains saved as Pending Payment; no completed payment was recorded." };
  }
}
