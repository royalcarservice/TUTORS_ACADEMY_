import type { Metadata } from "next";

import { AdminSubnav } from "@/components/admin/admin-subnav";
import { PortalShell } from "@/components/layout/portal-shell";
import { PORTAL_META, ROUTES } from "@/config/routes";
import { requireIdentity } from "@/lib/auth/session";
import { isAuthConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: PORTAL_META.admin.label,
  description: PORTAL_META.admin.blurb,
};

/**
 * Admin portal segment — same shared shell, different identity.
 *
 * CONFIGURED DEPLOYMENTS: the role check is strict — only role 'admin'
 * passes; everyone else is redirected.
 * DEMONSTRATION (no database configured, Track 1): the console opens
 * against the fixture ledger so the operations layer is testable out
 * of the box, and a banner states exactly that. Nothing real is read,
 * written or persisted in that mode.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isAuthConfigured();
  if (configured) {
    /* 5.1 boundary: role check — a student who lands here is sent to /student. */
    await requireIdentity("admin", ROUTES.admin);
  }

  return (
    <PortalShell portal="admin">
      {!configured ? (
        <div
          role="note"
          className="mb-6 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3"
        >
          <p className="text-sm leading-relaxed text-warning-700">
            Demonstration mode. No database is configured for this deployment, so every record on this
            console is a fixture and no action reaches a database. In a configured deployment this
            console requires the admin role.
          </p>
        </div>
      ) : null}
      <AdminSubnav />
      {children}
    </PortalShell>
  );
}
