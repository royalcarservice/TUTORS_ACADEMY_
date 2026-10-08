import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AcademicSurface } from "@/components/live/academic-surface";
import { RoomLayout } from "@/components/live/room-layout";
import { RoomParticipant } from "@/components/live/room-participant";
import { SessionSettlement } from "@/components/live/session-settlement";
import { getEnvironmentSettings } from "@/lib/environment/settings";
import { getIdentity } from "@/lib/auth/session";
import { isolateAsync } from "@/lib/state/isolate";
import type { SubjectId } from "@/lib/student/contract";
import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";

/* DEV-ONLY SPECIMEN · /dev/live-stage — 404s in production.

   The rehearsal space for the chamber (Phase 7 · Steps 3–4, DEC-024/025):
   the participant island — tile, controls, state language — exercised
   against the reader's OWN devices, and the shared ACADEMIC SURFACE —
   canvas, palette, substrate — exercised in local working mode (the
   in-memory bus; no transport is wired yet, and the caption says so).
   Nothing here is reachable in production, and nothing captures on load.

   Subject is chosen with ?subject=<id> so the accent framing (the speaking
   glow, the disciplined border) AND the substrate motif (lattice for
   Mathematics, field for Physics, bonds for Chemistry…) can be checked
   against each of the six.                                            */

export const metadata: Metadata = { title: "Live stage rehearsal" };

/* The rehearsal room, composed exactly as the production room composes it
   (DEC-025): participant pane + academic surface, responsive. The density
   lever is read as the environment reads it — authored default here unless
   a shaping row exists. */
async function RehearsalRoom({ subjectId, motif, displayName, role }: { subjectId: string; motif: import("@/lib/subjects/subjects").Motif; displayName: string; role: "student" | "tutor" }) {
  const settings = await getEnvironmentSettings(subjectId as SubjectId);
  return (
    <RoomLayout
      chamber={<RoomParticipant subjectId={subjectId} displayName={displayName} role={role} rehearsal />}
      surface={<AcademicSurface subjectId={subjectId} motif={motif} density={settings.levers.density} />}
    />
  );
}

interface Params {
  searchParams: Promise<{ subject?: string }>;
}

export default async function DevLiveStagePage({ searchParams }: Params) {
  if (process.env.NODE_ENV === "production") notFound();

  const { subject: subjectParam } = await searchParams;
  const s = getSubject(subjectParam ?? "mathematics") ?? SUBJECTS[0];

  /* The label is the reader's own display name when one exists — dev pages
     do not invent identities; a rehearsal without a sign-in names itself. */
  const identityRead = await isolateAsync("dev:live-stage-identity", () => getIdentity());
  const identity = identityRead.ok ? identityRead.value : null;

  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)", color: "var(--ta-text-primary)" }}>
      <header style={{ marginBottom: "var(--ta-space-8)" }}>
        <p style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 }}>
          Dev specimen — not reachable in production
        </p>
        <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>
          Live stage rehearsal — {s.name}
        </h1>
        <p style={{ color: "var(--ta-text-secondary)", maxWidth: "48em", marginTop: "var(--ta-space-3)" }}>
          The participant interface exercises your own devices only. Nothing captured here leaves this device:
          the transport is not wired yet, and this rehearsal exists to prove the controls, the tile and the
          state language. Choose another subject with <code>?subject=physics</code> to see its accent frame the room.
        </p>
      </header>

      <div data-subject={s.id} style={{ background: "var(--ta-surface-sunken)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-8)" }}>
        <RehearsalRoom subjectId={s.id} motif={s.motif} displayName={identity?.displayName ?? "Rehearsal"} role={identity?.role === "tutor" ? "tutor" : "student"} />
      </div>

      {/* THE SETTLEMENT SURFACE, rehearsed (Phase 7 · Step 5, DEC-027): the
          three variants the production /live page decides between, rendered
          with specimen facts so the closing language can be read. Nothing
          here writes: the specimen session id names no row. */}
      <section aria-label="Settlement previews" style={{ marginTop: "var(--ta-space-12)" }} data-subject={s.id}>
        <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, margin: "0 0 var(--ta-space-2)" }}>
          Session settlement — the three variants
        </h2>
        <p style={{ color: "var(--ta-text-secondary)", maxWidth: "48em", margin: "0 0 var(--ta-space-6)" }}>
          The dignified post-session surface: the student&apos;s closing sentence (record written · record
          pending) and the tutor&apos;s academic record form. No stars, no survey, no evaluative
          drop-down — the record holds facts, never summaries.
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-6)" }}>
          <SessionSettlement subject={{ id: s.id, name: s.name }} sessionTitle="Morning session" sessionId="00000000-0000-0000-0000-000000000000" viewer="student" recorded />
          <SessionSettlement subject={{ id: s.id, name: s.name }} sessionTitle="Morning session" sessionId="00000000-0000-0000-0000-000000000000" viewer="student" recorded={false} />
          <SessionSettlement subject={{ id: s.id, name: s.name }} sessionTitle="Morning session" sessionId="00000000-0000-0000-0000-000000000000" viewer="tutor" recorded={false} />
          <SessionSettlement subject={{ id: s.id, name: s.name }} sessionTitle="Morning session" sessionId="00000000-0000-0000-0000-000000000000" viewer="tutor" recorded />
        </div>
      </section>

      <p style={{ marginTop: "var(--ta-space-6)" }}>
        <Link href={`/subjects/${s.id}/live`} style={{ color: "var(--ta-accent-1)" }}>
          The production surface ({`/subjects/${s.id}/live`})
        </Link>
      </p>
    </main>
  );
}
