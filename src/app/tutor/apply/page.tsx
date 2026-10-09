import { ApplyForm } from "@/features/auth/apply-form";
import { getTutorApplicationAccess, getTutorPaymentReadiness } from "@/lib/tutor/registration";

export const metadata = {
  title: "Become a Tutor | Tutors Academy",
  description: "Apply to teach at Tutors Academy. Submit your details for review.",
};

export default async function TutorApplyPage() {
  const access = await getTutorApplicationAccess();
  const readiness = getTutorPaymentReadiness();

  return (
    <main data-theme="light" className="min-h-[calc(100vh-4rem)] bg-[#FDFBF7] px-4 py-12 sm:px-6 sm:py-16">
      <ApplyForm
        storageConfigured={readiness.storageConfigured}
        initialApplication={access.application}
        applicationAccessNeedsRecovery={access.hasCookie && !access.application}
      />
    </main>
  );
}
