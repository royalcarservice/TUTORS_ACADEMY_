import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { STATE_COPY } from "@/components/state/copy";
import { HonestPage } from "@/components/state/honest-page";
import { AccountEntry } from "@/components/student/account-entry";
import { EnvironmentLeversSurface } from "@/components/tutor/environment-levers";
import { TUTOR_NAV_ITEMS } from "@/config/tutor-nav";
import { LoginForm } from "@/features/auth/login-form";
import { shellSubjectInfo } from "@/lib/student/subject-info";

import { SPECIMEN_TUTOR, VIEWER, specimenView } from "../../environment-levers/fixtures";
import { FRAME_CASES, type FrameCase } from "../states";

/* /dev/tutor-states/frame?case=… (Phase 6 · Step 5 · Part 8). 404s in prod.
 * Each case renders the REAL component with the REAL copy from a 6.4 fixture.
 * `account` is a static copy of the account surface's markup with fixture
 * values (the real page needs a session) — marked SIMULATED on the index. */
export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 };

export default async function TutorStatesFrame({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const c = q.case as FrameCase | undefined;
  if (!c || !(FRAME_CASES as readonly string[]).includes(c)) notFound();
  const theme = q.theme === "light" ? "light" : "dark";
  const info = shellSubjectInfo().physics;
  if (!info) notFound();

  const wrap = (node: React.ReactNode) => (
    <div data-theme={theme} data-reduced-motion={q.rm ? "on" : undefined} style={{ minHeight: "100vh", background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", filter: q.gray ? "grayscale(1)" : undefined }}>
      <NavShell mode="room" navLabel="Tutor" items={[...TUTOR_NAV_ITEMS]} account={<AccountEntry displayName={SPECIMEN_TUTOR} href="/tutor/account" />} />
      <main id="main">
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-6) var(--ta-space-16)" }}>{node}</div>
      </main>
    </div>
  );

  switch (c) {
    case "read-failed":
      return wrap(<HonestPage state="shaping-unread" bare {...STATE_COPY.shapingUnread} action={{ ...STATE_COPY.shapingUnread.action, href: "/tutor/physics/environment" }} />);
    case "write-failed":
      return wrap(<EnvironmentLeversSurface view={specimenView("mine")} subject={info} viewerId={VIEWER} failed />);
    case "as-authored":
      return wrap(<EnvironmentLeversSurface view={specimenView("authored")} subject={info} viewerId={VIEWER} failed={false} />);
    case "shaped-by-you":
      return wrap(<EnvironmentLeversSurface view={specimenView("mine")} subject={info} viewerId={VIEWER} failed={false} />);
    case "shaped-by-other":
      return wrap(<EnvironmentLeversSurface view={specimenView("other")} subject={info} viewerId={VIEWER} failed={false} />);
    case "login-ended":
      return <div data-theme={theme} style={{ padding: "var(--ta-space-6)", minHeight: "100vh", background: "var(--ta-surface-base)" }}><LoginForm configured next="/tutor/physics/environment" context={STATE_COPY.sessionEnded("the Physics environment")} /></div>;
    case "account": {
      const rows: Array<[string, string]> = [["Name", SPECIMEN_TUTOR], ["Email", "tutor@example.invalid"], ["Role", "tutor"]];
      return wrap(
        <div data-density="compact" data-simulated="account" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-6)" }}>
          <div>
            <p style={MONO}>Account</p>
            <h1 style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, color: "var(--ta-text-primary)" }}>{SPECIMEN_TUTOR}</h1>
          </div>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: "var(--ta-space-6)", rowGap: "var(--ta-space-3)", fontSize: "var(--ta-text-base)" }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt style={{ ...MONO, alignSelf: "baseline" }}>{k}</dt>
                <dd style={{ margin: 0, color: "var(--ta-text-primary)", overflowWrap: "anywhere" }}>{v}</dd>
              </div>
            ))}
          </dl>
          <form action="/auth/signout" method="post"><button type="submit" className="ta-btn" data-variant="secondary" data-size="md">Sign out</button></form>
        </div>,
      );
    }
  }
}
