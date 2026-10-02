import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { resolveRecord, type RecordLoader } from "@/components/tutor/record";
import { RelationshipSurface } from "@/components/tutor/relationship-surface";
import { TUTOR_NAV_ITEMS } from "@/config/tutor-nav";
import { shellSubjectInfo } from "@/lib/student/subject-info";

import { SPECIMEN_TUTOR, SPECIMENS, specimenView, type SpecimenKey } from "../fixtures";

/* /dev/relationship-surface/frame — one full relationship surface (nav + main)
 * from a fixture, for the specimen page's iframes. 404s in prod.
 * ?record=fail swaps the record loader for one that throws: the ONLY place the
 * injectable loader is used (the route always gets the production loader). */
export const dynamic = "force-dynamic";

const failingLoader: RecordLoader = async () => { throw new Error("dev: forced record read failure"); };

export default async function RelationshipSurfaceFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const key = (Object.keys(SPECIMENS).includes(q.s ?? "") ? q.s : "two") as SpecimenKey;
  const theme = q.theme === "light" ? "light" : "dark";
  const view = specimenView(key);
  const info = shellSubjectInfo()[view.subjectId];
  if (!info) notFound();
  const record = await resolveRecord(view, q.record === "fail" ? failingLoader : undefined);
  return (
    <div data-theme={theme} data-reduced-motion={q.rm ? "on" : undefined} style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", filter: q.gray ? "grayscale(1)" : undefined }}>
      <NavShell mode="room" navLabel="Tutor" items={[...TUTOR_NAV_ITEMS]} account={<AccountEntry displayName={SPECIMEN_TUTOR} href="/tutor/account" />} />
      <main id="main">
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>
          <RelationshipSurface view={view} subject={info} record={record} />
        </div>
      </main>
    </div>
  );
}
