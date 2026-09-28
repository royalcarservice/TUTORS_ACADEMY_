import type { Metadata } from "next";

import { NavShell } from "@/components/layout/nav-shell";
import { SubjectEntry } from "@/components/shell/subject-entry";

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

export default function SubjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavShell mode="stage" items={[{ label: "Subjects", href: "/subjects" }]} />
      <main id="main" style={{ flex: 1 }}>
        {children}
        <SubjectEntry />
      </main>
    </>
  );
}
