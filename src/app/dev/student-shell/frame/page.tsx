import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { StudentShell } from "@/components/student/student-shell";
import { STUDENT_NAV_ITEMS } from "@/config/student-nav";

import { fixtureProps, SPECIMEN_NAME, type SlotExtreme } from "../fixtures";

/* /dev/student-shell/frame — one full shell (nav + main) from fixtures, so
 * the specimen page can show it in iframes at exact viewports. 404s in prod. */

export const dynamic = "force-dynamic";

export default async function StudentShellFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const state = (["A", "B", "C"].includes(q.state ?? "") ? q.state : "B") as "A" | "B" | "C";
  const theme = q.theme === "light" ? "light" : "dark";
  const slots = (["none", "some", "all"].includes(q.slots ?? "") ? q.slots : "none") as SlotExtreme;
  const props = fixtureProps(state, slots);
  return (
    <div
      data-theme={theme}
      data-reduced-motion={q.rm ? "on" : undefined}
      style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", filter: q.gray ? "grayscale(1)" : undefined }}
    >
      <NavShell mode="room" navLabel="Student" items={[...STUDENT_NAV_ITEMS]} account={<AccountEntry displayName={SPECIMEN_NAME} />} />
      <main id="main">
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>
          <StudentShell {...props} />
        </div>
      </main>
    </div>
  );
}
