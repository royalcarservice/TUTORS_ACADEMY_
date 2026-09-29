import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { SubjectShell } from "@/components/shell/subject-shell";
import type { ShellNavEntry } from "@/components/shell/subject-nav";
import { EnvironmentRegions, resolveEnvironmentSlots } from "@/components/student/environment-regions";
import { STUDENT_NAV_ITEMS } from "@/config/student-nav";
import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";

import * as F from "../fixtures";

/* /dev/progress-language/frame — the real environment composition with the
 * arc region fed from FIXTURES (events=zero|one|many, live=today|pretend,
 * facts=entered|day-one|yesterday|never|visitor). Dev only; 404 in prod. */

export const dynamic = "force-dynamic";

export default async function ProgressFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const s = getSubject(q.subject === "physics" ? "physics" : "mathematics");
  if (!s) notFound();
  const theme = q.theme === "light" ? "light" : "dark";
  const events = q.events === "one" ? F.ONE : q.events === "many" ? F.MANY : q.events === "malformed" ? F.MALFORMED : F.ZERO;
  const liveModules = q.live === "pretend" ? [...F.LIVE_PRETEND] : [...F.LIVE_TODAY];
  const facts = q.facts === "day-one" ? F.FACTS_DAY_ONE : q.facts === "yesterday" ? F.FACTS_YESTERDAY : q.facts === "never" ? F.FACTS_NEVER_ENTERED : q.facts === "visitor" ? F.FACTS_VISITOR : s.id === "physics" ? F.FACTS_PHYSICS : F.FACTS_ENTERED;
  const slots = resolveEnvironmentSlots({ subjectId: s.id, subjectName: s.name, facts: { ...facts, subjectId: s.id as typeof facts.subjectId }, events, liveModules });
  const entries: ShellNavEntry[] = SUBJECTS.map((x) => ({ id: x.id, name: x.name, href: `/subjects/${x.id}`, available: x.status !== "draft" || x.id === s.id, draft: x.status === "draft" }));
  return (
    <div data-theme={theme} data-reduced-motion={q.rm ? "on" : undefined} style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", display: "flex", flexDirection: "column", filter: q.gray ? "grayscale(1)" : undefined }}>
      <NavShell mode="stage" items={facts.enrolled ? [STUDENT_NAV_ITEMS[0], { label: "Subjects", href: "/subjects" }] : [{ label: "Subjects", href: "/subjects" }]} />
      <main id="main" style={{ flex: 1 }}>
        <SubjectShell
          subject={{ id: s.id, name: s.name, tagline: s.tagline, motif: s.motif, density: s.density }}
          ambient={{ id: s.id, name: s.name, motif: s.motif, density: s.density, motionChar: s.motionChar, accent: s.accent1 }}
          draft={s.status === "draft"}
          entries={entries}
          regions={slots.length > 0 ? <EnvironmentRegions slots={slots} /> : undefined}
        />
      </main>
    </div>
  );
}
