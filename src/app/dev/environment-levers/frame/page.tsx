import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { EnvironmentLeversSurface } from "@/components/tutor/environment-levers";
import { TUTOR_NAV_ITEMS } from "@/config/tutor-nav";
import { shellSubjectInfo } from "@/lib/student/subject-info";

import { SPECIMEN_TUTOR, SPECIMENS, VIEWER, specimenView, type SpecimenKey } from "../fixtures";

/* /dev/environment-levers/frame — one full shaping surface (nav + main) from a
 * fixture, for the specimen page's iframes. 404s in prod. The form posts to
 * the real handler, which 404s for a specimen (no session) — this frame is
 * for looking, the route is for shaping. */
export const dynamic = "force-dynamic";

export default async function EnvironmentLeversFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const key = (Object.keys(SPECIMENS).includes(q.s ?? "") ? q.s : "authored") as SpecimenKey;
  const theme = q.theme === "light" ? "light" : "dark";
  const view = specimenView(key);
  const info = shellSubjectInfo()[view.subjectId];
  if (!info) notFound();
  return (
    <div data-theme={theme} data-reduced-motion={q.rm ? "on" : undefined} style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", filter: q.gray ? "grayscale(1)" : undefined }}>
      <NavShell mode="room" navLabel="Tutor" items={[...TUTOR_NAV_ITEMS]} account={<AccountEntry displayName={SPECIMEN_TUTOR} href="/tutor/account" />} />
      <main id="main">
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>
          <EnvironmentLeversSurface view={view} subject={info} viewerId={VIEWER} failed={q.failed === "1"} />
        </div>
      </main>
    </div>
  );
}
