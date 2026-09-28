import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Tutors Academy to reach your portal.",
};

/**
 * Server component: owns the route metadata and renders the client form.
 * This split is the pattern every interactive surface follows so that SEO and
 * interactivity never fight each other.
 */
export default function LoginPage() {
  return <LoginForm />;
}
