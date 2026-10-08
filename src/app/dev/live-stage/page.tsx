import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RoomParticipant } from "@/components/live/room-participant";
import { getIdentity } from "@/lib/auth/session";
import { isolateAsync } from "@/lib/state/isolate";
import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";

/* DEV-ONLY SPECIMEN · /dev/live-stage — 404s in production.

   The rehearsal space for the chamber's participant interface (Phase 7 ·
   Step 3, DEC-024): the island, the tile, the controls and the state
   language, exercised against the reader's OWN devices — camera, microphone,
   shared surface — with everything staying on this device (no transport is
   wired yet; the caption says so). Nothing here is reachable in production,
   and nothing here captures on load: the first render is privacy.

   Subject is chosen with ?subject=<id> so the accent framing (the speaking
   glow, the disciplined border) can be checked against each of the six.   */

export const metadata: Metadata = { title: "Live stage rehearsal" };

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
        <RoomParticipant
          subjectId={s.id}
          displayName={identity?.displayName ?? "Rehearsal"}
          role={identity?.role === "tutor" ? "tutor" : "student"}
          rehearsal
        />
      </div>

      <p style={{ marginTop: "var(--ta-space-6)" }}>
        <Link href={`/subjects/${s.id}/live`} style={{ color: "var(--ta-accent-1)" }}>
          The production surface ({`/subjects/${s.id}/live`})
        </Link>
      </p>
    </main>
  );
}
