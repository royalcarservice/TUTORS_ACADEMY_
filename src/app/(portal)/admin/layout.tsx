import type { Metadata } from "next";

import { PortalShell } from "@/components/layout/portal-shell";
import { PORTAL_META } from "@/config/routes";

export const metadata: Metadata = {
  title: PORTAL_META.admin.label,
  description: PORTAL_META.admin.blurb,
};

/** Admin portal segment — same shared shell, different identity. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portal="admin">{children}</PortalShell>;
}
