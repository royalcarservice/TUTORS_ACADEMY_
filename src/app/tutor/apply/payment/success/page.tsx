import { getLatestTutorRegistrationPayment, getTutorApplicationAccess, getTutorPaymentReadiness, getTutorRegistrationReceiptUrl, verifyTutorRegistrationCheckout } from "@/lib/tutor/registration";
import { TutorPaymentPanel } from "@/features/auth/tutor-payment-panel";

export const metadata = {
  title: "Tutor Registration Status | Tutors Academy",
  description: "Verified status of your tutor registration payment.",
};

export default async function TutorApplyPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const [{ session_id: sessionId }, access] = await Promise.all([searchParams, getTutorApplicationAccess()]);
  const application = access.application;
  const verification = sessionId && application
    ? await verifyTutorRegistrationCheckout(sessionId, application.id)
    : null;
  const payment = application ? await getLatestTutorRegistrationPayment(application.id) : null;
  const readiness = getTutorPaymentReadiness();
  const receiptUrl = payment?.status === "paid"
    ? await getTutorRegistrationReceiptUrl(payment.providerPaymentId)
    : null;

  return (
    <TutorPaymentPanel
      application={application}
      payment={payment}
      readiness={readiness}
      returnStatus={verification?.status ?? null}
      receiptUrl={receiptUrl}
    />
  );
}
