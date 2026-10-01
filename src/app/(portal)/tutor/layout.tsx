import type { Metadata } from "next";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { ROUTES } from "@/config/routes";
import { TUTOR_NAV_ITEMS } from "@/config/tutor-nav";
import { requireIdentity } from "@/lib/auth/session";

/* TUTOR SEGMENT (Phase 6 · Step 2)
 *
 * The SAME chrome as the student's (5.3): the 2.6 nav shell in ROOM mode, no
 * sidebar of planned modules, no second navigation language. Three real
 * destinations (config/tutor-nav.ts), every one 200 today.
 *
 * BOUNDARY: the proxy redirects visitors; requireIdentity is defence in depth
 * and the role check (a student who lands here is sent to /student). Reach
 * into data is the 6.1 RLS policies, read only through src/lib/tutor/data.  */

export const metadata: Metadata = {
  title: "Your students",
  description: "The students placed with you, by subject.",
};

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireIdentity("tutor", ROUTES.tutor);
  return (
    <>
      <NavShell
        mode="room"
        navLabel="Tutor"
        items={[...TUTOR_NAV_ITEMS]}
        account={<AccountEntry displayName={identity.displayName} href={`${ROUTES.tutor}/account`} />}
      />
      <main id="main" style={{ flex: 1 }}>
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>
          {children}
        </div>
      </main>
    </>
  );
}
