import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { SubjectShell } from "@/components/shell/subject-shell";
import type { ShellNavEntry } from "@/components/shell/subject-nav";
import { EnvironmentRegions, liveModuleIds, resolveEnvironmentSlots } from "@/components/student/environment-regions";
import { Threshold } from "@/components/student/threshold";
import { STUDENT_NAV_ITEMS } from "@/config/student-nav";
import { ENVIRONMENT_SLOTS } from "@/config/student-slots";
import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";

/* /dev/environment-workspace/frame — the REAL environment composition
 * (subjects layout chrome + SubjectShell) with the identity DECISION replaced
 * by a query parameter, so the specimen page can show every identity state
 * side by side without five sessions. Nothing here can write: the threshold
 * is the production form, but this frame is dev-only and posts to the real
 * endpoint, which refuses a session-less POST. 404s in production.
 *
 *   who = visitor | student-nonenrolled | student-enrolled
 *   subject = mathematics (ready) | physics (draft)
 *   regions = none (today's truth) | specimen (all slots forced, labelled)  */

export const dynamic = "force-dynamic";

type Who = "visitor" | "student-nonenrolled" | "student-enrolled";
const WHOS: Who[] = ["visitor", "student-nonenrolled", "student-enrolled"];

const SPECIMEN_RESOLVERS = Object.fromEntries(
  ENVIRONMENT_SLOTS.map((s) => [s.id, () => (
    <div className="ta-card" data-specimen style={{ padding: "var(--ta-space-3) var(--ta-space-4)" }}>
      <p style={{ margin: 0, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" }}>Specimen · {s.phase}</p>
      <p style={{ margin: "var(--ta-space-1) 0 0", fontSize: "var(--ta-text-sm)" }}>{s.name} — needs {s.needs}.</p>
    </div>
  )]),
);

export default async function EnvironmentFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const who: Who = WHOS.includes(q.who as Who) ? (q.who as Who) : "visitor";
  const s = getSubject(q.subject === "physics" ? "physics" : "mathematics");
  if (!s) notFound();
  const theme = q.theme === "light" ? "light" : "dark";
  const isStudent = who !== "visitor";
  const isEnrolled = who === "student-enrolled";
  /* The production page's decision, replayed on the query (mayEnrol = door open = not draft). */
  const showThreshold = isStudent && !isEnrolled && s.status !== "draft";
  /* `regions=specimen` bypasses the REGISTRY gate on purpose — to show the slot layout that
     does not exist yet. It is labelled on every card and impossible in production. */
  const slots = isEnrolled
    ? q.regions === "specimen"
      ? ENVIRONMENT_SLOTS.map((d) => ({ id: d.id, region: d.region, element: SPECIMEN_RESOLVERS[d.id]() }))
      : resolveEnvironmentSlots({ subjectId: s.id, subjectName: s.name, facts: { subjectId: s.id as import("@/lib/student/contract").SubjectId, hasAccount: true, enrolled: true, firstEnteredAt: "2026-09-20T09:00:00Z" }, events: [], liveModules: liveModuleIds() })
    : [];
  const entries: ShellNavEntry[] = SUBJECTS.map((x) => ({ id: x.id, name: x.name, href: `/subjects/${x.id}`, available: x.status !== "draft" || (isEnrolled && x.id === s.id), draft: x.status === "draft" }));
  const items = isStudent ? [STUDENT_NAV_ITEMS[0], { label: "Subjects", href: "/subjects" }] : [{ label: "Subjects", href: "/subjects" }];
  return (
    <div data-theme={theme} style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", display: "flex", flexDirection: "column" }}>
      <NavShell mode="stage" items={items} />
      <main id="main" style={{ flex: 1 }}>
        <SubjectShell
          subject={{ id: s.id, name: s.name, tagline: s.tagline, motif: s.motif, density: s.density }}
          ambient={{ id: s.id, name: s.name, motif: s.motif, density: s.density, motionChar: s.motionChar, accent: s.accent1 }}
          draft={s.status === "draft"}
          entries={entries}
          threshold={showThreshold ? <Threshold subjectId={s.id} subjectName={s.name} /> : undefined}
          regions={slots.length > 0 ? <EnvironmentRegions slots={slots} /> : undefined}
        />
      </main>
    </div>
  );
}
