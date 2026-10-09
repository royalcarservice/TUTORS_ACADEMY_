import { getLatestTutorRegistrationPayment, getTutorApplicationAccess, getTutorPaymentReadiness, getTutorRegistrationReceiptUrl } from "@/lib/tutor/registration";
import { TutorPaymentPanel } from "@/features/auth/tutor-payment-panel";

export const metadata = {
  title: "Complete Tutor Registration | Tutors Academy",
  description: "Review the ₹699 registration fee and complete your tutor application.",
};

export default async function TutorApplyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status }, access] = await Promise.all([searchParams, getTutorApplicationAccess()]);
  const application = access.application;
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
      returnStatus={status === "cancelled" ? status : null}
      receiptUrl={receiptUrl}
    />
  );
}
