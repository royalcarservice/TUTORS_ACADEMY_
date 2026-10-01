import type { Metadata } from "next";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { SubjectEntry } from "@/components/shell/subject-entry";
import { STUDENT_NAV_ITEMS } from "@/config/student-nav";
import { getIdentity } from "@/lib/auth/session";
import { isolateAsync } from "@/lib/state/isolate";

/* ENVIRONMENT SHELL — SUBJECTS LAYOUT (Phase 3 · Step 6)
 *
 * The shell chrome for every /subjects route: the nav shell in STAGE mode
 * (2.6), one <main> landmark, and the layout-level SubjectEntry controller.
 * SubjectEntry lives HERE (not in each page) so it PERSISTS across
 * client-side navigation between subject routes — which is what lets it
 * distinguish a direct load (first paint, no announce, no focus theft) from a
 * navigation (announce once, focus the heading).
 */

export const metadata: Metadata = {
  title: {
    default: "Subjects",
    template: "%s · Subjects",
  },
};

export default async function SubjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* 5.5 · Part 6: a signed-in STUDENT inside an environment gets a way back to
     their space — the existing student nav's first item, nothing invented.
     Decided server-side; a visitor's chrome is byte-identical to 3.6. */
  /* P5-R9: this nav item is SUPPLEMENTAL — an identity read failure renders
     the visitor's chrome (silence) and logs; it never fails /subjects itself. */
  const identityRead = await isolateAsync("region:subjects-nav", () => getIdentity());
  const identity = identityRead.ok ? identityRead.value : null;
  const items = identity?.role === "student"
    ? [STUDENT_NAV_ITEMS[0], { label: "Subjects", href: "/subjects" }]
    : [{ label: "Subjects", href: "/subjects" }];
  return (
    <>
      {/* 5.8 gate fix: the identity already read above also fills the nav's account entry (name + real sign-out),
          so a signed-in student is never offered "Sign in" inside their own environment. Visitor chrome unchanged. */}
      <NavShell mode="stage" items={items} account={identity?.role === "student" ? <AccountEntry displayName={identity.displayName} /> : undefined} />
      <main id="main" style={{ flex: 1 }}>
        {children}
        <SubjectEntry />
      </main>
    </>
  );
}
