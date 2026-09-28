import type { Metadata } from "next";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { ROUTES } from "@/config/routes";
import { STUDENT_NAV_ITEMS } from "@/config/student-nav";
import { requireIdentity } from "@/lib/auth/session";

/* STUDENT SEGMENT (Phase 5 · Step 3)
 *
 * Chrome = the 2.6 nav shell in ROOM mode (solid, compact, working). No
 * second navigation bar, no sidebar of planned modules. The IA is three real
 * destinations — every item resolves today:
 *   Overview  /student            the shell
 *   Subjects  /subjects           the six environments (subject-scoped surface)
 *   Account   /student/account    profile + sign out
 * Phases 7–9 add destinations by appending to STUDENT_NAV_ITEMS (config/student-nav.ts)
 * once their route exists (extension contract) — never by adding a disabled/“coming soon” row.
 *
 * BOUNDARY: the proxy already redirected visitors; requireIdentity is defence
 * in depth and the role check from 5.1's matrix (a tutor lands on /tutor).  */

export const metadata: Metadata = {
  title: "Your subjects",
  description: "Where you were, and what to open next.",
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireIdentity("student", ROUTES.student);
  return (
    <>
      <NavShell
        mode="room"
        navLabel="Student"
        items={[...STUDENT_NAV_ITEMS]}
        account={<AccountEntry displayName={identity.displayName} />}
      />
      <main id="main" style={{ flex: 1 }}>
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>
          {children}
        </div>
      </main>
    </>
  );
}
