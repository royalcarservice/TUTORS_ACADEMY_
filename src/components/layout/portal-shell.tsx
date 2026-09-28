"use client";

import { useState } from "react";

import { Container } from "@/components/ui/container";
import type { PortalId } from "@/config/routes";

import { PortalSidebar } from "./portal-sidebar";
import { PortalTopbar } from "./portal-topbar";

/**
 * PORTAL SHELL
 * --------------------------------------------------------------------------
 * The single application chrome shared by the student, tutor and admin
 * portals (and the live classroom later). Each portal supplies only its
 * identity — layout, responsive behaviour and navigation come from here.
 *
 * Responsive contract:
 *   >= lg : persistent sidebar, main content offset by --ta-sidebar-w
 *   <  lg : sidebar becomes an off-canvas drawer opened from the topbar
 */
export function PortalShell({
  portal,
  children,
}: {
  portal: PortalId;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-muted">
      <PortalSidebar
        portal={portal}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-[var(--ta-sidebar-w)]">
        <PortalTopbar portal={portal} onMenuClick={() => setNavOpen(true)} />

        <main id="main" className="flex-1">
          <Container width="wide" className="py-6 sm:py-8 lg:py-10">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
