import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { AccountEntry } from "@/components/student/account-entry";
import { StudentShell } from "@/components/student/student-shell";
import { STUDENT_NAV_ITEMS } from "@/config/student-nav";
import { nextActionFor, resolverStateFor, judge, type Candidate } from "@/lib/next-action";
import { deriveShellState } from "@/lib/student/contract";
import { shellSubjectInfo } from "@/lib/student/subject-info";

import { FUTURE, FUTURE_INPUT, MATRIX, NOW, pretendLive } from "../fixtures";

/* /dev/next-action/frame — the production shell rendering ONE engine answer
 * from a fixture: ?m=<matrix id> (the real providers on fixture rows) or
 * ?f=<future fixture id> (a fixture candidate, only if the resolver accepts
 * it with every capability pretended live). 404s in production.            */

export const dynamic = "force-dynamic";

export default async function NextActionFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const theme = q.theme === "light" ? "light" : "dark";

  let candidate: Candidate | null = null;
  let input = MATRIX[0].input;
  if (q.f) {
    const f = FUTURE.find((x) => x.id === q.f);
    input = FUTURE_INPUT;
    if (f) {
      const v = judge(f.candidate, { ...resolverStateFor(input), ...pretendLive({}) }, NOW);
      if (v.accepted) candidate = f.candidate;
    }
  } else {
    const row = MATRIX.find((x) => x.id === (q.m ?? "none")) ?? MATRIX[0];
    input = row.input;
    candidate = nextActionFor(input).action;
  }
  if (!candidate) notFound();
  const state = deriveShellState([...input.enrolments], [...input.environmentStates]);
  return (
    <div data-theme={theme} data-reduced-motion={q.rm ? "on" : undefined} style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", filter: q.gray ? "grayscale(1)" : undefined }}>
      <NavShell mode="room" navLabel="Student" items={[...STUDENT_NAV_ITEMS]} account={<AccountEntry displayName="Specimen student" />} />
      <main id="main">
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>
          <StudentShell state={state} candidate={candidate} enrolments={[...input.enrolments]} environmentStates={[...input.environmentStates]} subjects={shellSubjectInfo()} slots={[]} now={NOW} />
        </div>
      </main>
    </div>
  );
}
