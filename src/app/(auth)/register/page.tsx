import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a Tutors Academy account as a student or a tutor.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
