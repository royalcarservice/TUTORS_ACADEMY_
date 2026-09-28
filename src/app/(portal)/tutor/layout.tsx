import type { Metadata } from "next";

import { PortalShell } from "@/components/layout/portal-shell";
import { PORTAL_META } from "@/config/routes";

export const metadata: Metadata = {
  title: PORTAL_META.tutor.label,
  description: PORTAL_META.tutor.blurb,
};

/** Tutor portal segment — same shared shell, different identity. */
export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portal="tutor">{children}</PortalShell>;
}
