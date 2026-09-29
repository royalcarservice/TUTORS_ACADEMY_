import { notFound } from "next/navigation";

import { NavShell } from "@/components/layout/nav-shell";
import { STATE_COPY } from "@/components/state/copy";
import { HonestPage } from "@/components/state/honest-page";
import { EnvironmentRegions, resolveEnvironmentSlots, ENVIRONMENT_SLOT_RESOLVERS } from "@/components/student/environment-regions";
import { Threshold } from "@/components/student/threshold";
import { LoginForm } from "@/features/auth/login-form";

import { FRAME_STATES, type FrameState } from "../states";

/* DEV-ONLY FRAME · /dev/student-states/frame?state=… (Phase 5 · Step 7 · Part 7).
 * 404s in production. Each state renders the REAL component with the REAL
 * copy; the two marked "simulation" below are static markup because their
 * trigger needs a live server action mid-flight. */

export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 };


export default async function StateFrame({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { state } = await searchParams;
  if (!state || !(FRAME_STATES as readonly string[]).includes(state)) notFound();

  const frame = (node: React.ReactNode) => (
    <>
      <NavShell mode="stage" items={[{ label: "Subjects", href: "/subjects" }]} />
      <main id="main" style={{ flex: 1 }}>{node}</main>
    </>
  );

  switch (state as FrameState) {
    case "not-found": return frame(<HonestPage state="not-found" {...STATE_COPY.notFound} />);
    case "page-failed": return frame(<HonestPage state="page-failed" {...STATE_COPY.pageFailed} action={{ ...STATE_COPY.pageFailed.action, href: "/subjects" }} />);
    case "student-failed": return frame(<HonestPage state="page-failed" {...STATE_COPY.studentFailed} />);
    case "environment-failed": return frame(<HonestPage state="page-failed" {...STATE_COPY.environmentFailed} action={{ ...STATE_COPY.environmentFailed.action, href: "/subjects/mathematics" }} />);
    case "entry-failed":
      return frame(
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-16)" }}>
          <p style={MONO}>Environment header · after a 303 ?entry=failed</p>
          <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>Mathematics</h1>
          <Threshold subjectId="mathematics" subjectName="Mathematics" failed />
        </div>,
      );
    case "login-ended": return <div style={{ padding: "var(--ta-space-6)" }}><LoginForm configured next="/subjects/mathematics" context={STATE_COPY.sessionEnded("Mathematics")} /></div>;
    case "login-continue": return <div style={{ padding: "var(--ta-space-6)" }}><LoginForm configured next="/subjects/mathematics" context={STATE_COPY.signInToContinue("Mathematics")} /></div>;
    case "login-refused":
    case "login-unavailable":
      /* SIMULATION: the result line is produced by the server action's return value; here the same primitive is rendered statically with the chosen sentence. */
      return (
        <div style={{ padding: "var(--ta-space-6)" }}>
          <p style={MONO}>Simulation — the 5.1 result line, static, with the chosen sentence</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h1>
          <button type="button" className="ta-btn" data-variant="primary" data-size="lg" style={{ minWidth: "12rem", marginTop: "var(--ta-space-6)" }} aria-describedby="login-outcome">Sign in</button>
          <p id="login-outcome" role="alert" data-form-outcome className="mt-3 text-sm leading-relaxed text-foreground">{state === "login-refused" ? STATE_COPY.signInRefused : STATE_COPY.signInUnavailable}</p>
        </div>
      );
    case "in-flight":
      /* SIMULATION: the disabled, relabelled button that useActionState's `pending` produces in the 5.1 forms while the action runs. */
      return (
        <div style={{ padding: "var(--ta-space-6)" }}>
          <p style={MONO}>Simulation — the 5.1 button while `pending` is true (no outcome claimed)</p>
          <button type="button" disabled className="ta-btn" data-variant="primary" data-size="lg" style={{ minWidth: "12rem", marginTop: "var(--ta-space-4)" }}>Signing in…</button>
        </div>
      );
    case "region-failing": {
      /* REAL: the environment's resolver map with the arc's resolver replaced by one that throws — through the real `resolveEnvironmentSlots` + `isolate`. */
      const ctx = { subjectId: "mathematics", subjectName: "Mathematics", facts: { subjectId: "mathematics" as const, hasAccount: true, enrolled: true, firstEnteredAt: null }, events: [], liveModules: [] };
      const broken = resolveEnvironmentSlots(ctx, { ...ENVIRONMENT_SLOT_RESOLVERS, progress: () => { throw new TypeError("forced region failure (dev)"); } });
      const healthy = resolveEnvironmentSlots(ctx);
      return frame(
        <div className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-16)" }}>
          <p style={MONO}>Real · regions with the arc resolver THROWING → rendered below this line: {broken.length === 0 ? "nothing" : "SOMETHING (defect)"}</p>
          <div data-broken-regions><EnvironmentRegions slots={broken} /></div>
          <p style={{ ...MONO, marginTop: "var(--ta-space-8)" }}>Real · the same regions, healthy, for contrast:</p>
          <div data-healthy-regions><EnvironmentRegions slots={healthy} /></div>
        </div>,
      );
    }
    case "global-error":
      return (
        <main id="main" style={{ maxWidth: "36rem", margin: "0 auto", padding: "4rem 1.25rem", fontFamily: "system-ui, sans-serif" }}>
          <p style={MONO}>Rendered as global-error.tsx renders it (system font, no theme)</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.15, margin: 0 }}>Tutors Academy could not be shown just now.</h1>
          <p style={{ marginTop: "1rem", lineHeight: 1.55 }}>Nothing was recorded. Opening the site again only reads — it is safe to do.</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a plain anchor on purpose: the router may be what failed */}
          <p style={{ marginTop: "1.5rem" }}><a href="/" style={{ color: "inherit", minHeight: "44px", display: "inline-flex", alignItems: "center", textDecoration: "underline" }}>Open Tutors Academy</a></p>
        </main>
      );
  }
}
