import type { Metadata } from "next";

import { PortalShell } from "@/components/layout/portal-shell";
import { PORTAL_META, ROUTES } from "@/config/routes";
import { requireIdentity } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: PORTAL_META.admin.label,
  description: PORTAL_META.admin.blurb,
};

/** Admin portal segment — same shared shell, different identity. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* 5.1 boundary, implemented in 5.3: role check — a student who lands here is sent to /student. */
  await requireIdentity("admin", ROUTES.admin);
  return <PortalShell portal="admin">{children}</PortalShell>;
}
