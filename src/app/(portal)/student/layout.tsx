import type { Metadata } from "next";

import { PortalShell } from "@/components/layout/portal-shell";
import { PORTAL_META } from "@/config/routes";

export const metadata: Metadata = {
  title: PORTAL_META.student.label,
  description: PORTAL_META.student.blurb,
};

/**
 * Student portal segment.
 * Only the portal identity is supplied here — chrome, navigation and
 * responsive behaviour come from the shared <PortalShell>.
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portal="student">{children}</PortalShell>;
}
