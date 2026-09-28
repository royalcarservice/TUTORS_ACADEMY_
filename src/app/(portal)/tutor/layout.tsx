import type { Metadata } from "next";

import { PortalShell } from "@/components/layout/portal-shell";
import { PORTAL_META, ROUTES } from "@/config/routes";
import { requireIdentity } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: PORTAL_META.tutor.label,
  description: PORTAL_META.tutor.blurb,
};

/** Tutor portal segment — same shared shell, different identity. */
export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* 5.1 boundary, implemented in 5.3: role check — a student who lands here is sent to /student. */
  await requireIdentity("tutor", ROUTES.tutor);
  return <PortalShell portal="tutor">{children}</PortalShell>;
}
