import type { Metadata } from "next";

import { ApplyForm } from "@/features/auth/apply-form";
import { isAuthConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Apply to teach · Tutors Academy",
  description:
    "Submit your academic background for administrator review. Nothing opens until an application is approved.",
};

/** Track 2 — the credential-review door. Public by design: an applicant
 *  has no account yet; the proxy carve-out (DEC-043) keeps it open. */
export default function TutorApplyPage() {
  return <ApplyForm configured={isAuthConfigured()} />;
}
