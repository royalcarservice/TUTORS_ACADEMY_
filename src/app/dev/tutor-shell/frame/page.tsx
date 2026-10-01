import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { TutorShell } from "@/components/tutor/tutor-shell";
import { TUTOR_NAV_ITEMS } from "@/config/tutor-nav";
import { shellSubjectInfo } from "@/lib/student/subject-info";

import { fixtureContext, SPECIMEN_TUTOR } from "../fixtures";

/* /dev/tutor-shell/frame — one full tutor shell (nav + main) from fixtures,
 * so the specimen page can show it in iframes at exact viewports. 404s in prod. */

export const dynamic = "force-dynamic";

export default async function TutorShellFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const state = (["A", "B", "C"].includes(q.state ?? "") ? q.state : "B") as "A" | "B" | "C";
  const theme = q.theme === "light" ? "light" : "dark";
  const n = ([1, 2, 4].includes(Number(q.n)) ? Number(q.n) : 2) as 1 | 2 | 4;
  const ctx = fixtureContext(state, n);
  return (
    <div
      data-theme={theme}
      data-reduced-motion={q.rm ? "on" : undefined}
      style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", filter: q.gray ? "grayscale(1)" : undefined }}
    >
      <NavShell mode="room" navLabel="Tutor" items={[...TUTOR_NAV_ITEMS]} account={<AccountEntry displayName={SPECIMEN_TUTOR} href="/tutor/account" />} />
      <main id="main">
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>
          <TutorShell state={ctx.state} groups={ctx.groups} subjects={shellSubjectInfo()} slots={[]} />
        </div>
      </main>
    </div>
  );
}
