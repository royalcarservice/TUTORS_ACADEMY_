import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui";
import { LiveStage } from "@/components/live/live-stage";
import { LiveChamber } from "@/components/live/live-chamber";
import { SessionSettlement } from "@/components/live/session-settlement";
import { ROUTES } from "@/config/routes";
import { MODULE_STATUS_LABEL, PLATFORM_MODULES } from "@/config/modules";
import { getIdentity } from "@/lib/auth/session";
import { getSessionAttendanceCount, getSessions } from "@/lib/classroom/data";
import { CHAMBER_STATE_WORD, chamberState, sessionOfRecord, showsSettlement } from "@/lib/classroom/state-machine";
import { stageStateOf } from "@/lib/classroom/types";
import { getEnvironmentSettings } from "@/lib/environment/settings";
import { liveKitReadiness, LIVEKIT_ENV_KEYS } from "@/lib/livekit/config";
import { liveCapabilities, scheduledPhrase } from "@/lib/next-action";
import { attendanceState } from "@/lib/progress/record";
import { getOwnProgressEvents } from "@/lib/progress/data";
import { isolateAsync } from "@/lib/state/isolate";
import { getEnrolledSubjectIds } from "@/lib/student/data";
import type { SubjectId } from "@/lib/student/contract";
import { getSubject } from "@/lib/subjects/subjects";
import { getTutorSubjectIds } from "@/lib/tutor/data";

/* /subjects/[subject]/live — THE LIVE CHAMBER SURFACE (Phase 7 · Milestone 2, DEC-026)
 *
 * Pivoted from the cohorts table to cohort_sessions (migration 0007): the
 * session-of-record this chamber stands inside is read by the classroom data
 * layer and named by the pure state machine (STANDBY → ACTIVE → SETTLING →
 * CONCLUDED). The cohorts grouping surface elsewhere is untouched.
 *
 * Server-rendered, complete with NO client JavaScript: identity, session
 * facts, the attend-versus-resume sentence and the standby state all arrive
 * in the HTML. The connection island mounts here only when a wiring step is
 * ruled (docs/proposed/livekit_recon.md) — nothing in this route pretends to
 * connect, and nothing measures presence: ZERO SURVEILLANCE BY CONSTRUCTION.
 *
 * WHO MAY STAND HERE — decided server-side, one fact at a time:
 *   · no identity            → the login door, back here after (the pattern
 *                              the portal guards use — a redirect, never a
 *                              blank page);
 *   · student, enrolled      → admitted (enrolment is the standing boundary,
 *                              migration 0006);
 *   · tutor, ACTIVE RELATIONSHIP in the subject → admitted (P6-R19's logic:
 *                              a tutor may stand in the room they shape);
 *                              which cohorts they read is still the RLS
 *                              question, answered by assignment;
 *   · anyone else            → the framework 404 (themed, real explanation).
 * Draft subjects keep the environment's guard (5.3): enrolled student or
 * related tutor admitted in production, everyone else 404s.
 *
 * FAILURE HONESTY (5.7): the session and progress reads are SUPPLEMENTAL —
 * each is isolated; a failed read renders the standby stage (the truthful
 * minimum) and logs; the page itself never fails for them. The identity and
 * enrolment reads are PRIMARY — a failed read fails the page, because
 * answering without them would be answering wrongly.
 */

interface Params {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ settle?: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subject } = await params;
  const s = getSubject(subject);
  if (!s) return {};
  return { title: `${s.name} — live` };
}

export default async function LiveSessionPage({ params, searchParams }: Params) {
  const { subject } = await params;
  const { settle } = await searchParams;
  const s = getSubject(subject);

  /* UNKNOWN OR INVALID SUBJECT → the framework 404, same as the environment. */
  if (!s) notFound();

  const identity = await getIdentity();
  if (!identity) redirect(`${ROUTES.login}?next=${encodeURIComponent(`/subjects/${subject}/live`)}`);

  const prod = process.env.NODE_ENV === "production";
  const [enrolled, related] = await Promise.all([
    identity.role === "student" ? getEnrolledSubjectIds() : Promise.resolve(new Set<string>()),
    identity.role === "tutor" ? getTutorSubjectIds() : Promise.resolve(new Set<SubjectId>()),
  ]);
  const isEnrolled = enrolled.has(s.id);
  const isRelated = related.has(s.id as SubjectId);

  /* DRAFT GUARD AT THE ROUTE — the environment's rule, unchanged (5.3 / 6.5). */
  if (s.status === "draft" && prod && !isEnrolled && !isRelated) notFound();

  /* ACCESS — a student stands here by enrolment, a tutor by relationship. */
  const viewer: "student" | "tutor" | null =
    identity.role === "student" && isEnrolled ? "student" : identity.role === "tutor" && isRelated ? "tutor" : null;
  if (!viewer) notFound();

  /* The room's levers, read exactly as the environment reads them (6.4):
     absence = the authored default; failure = default + one log line. */
  const settings = await getEnvironmentSettings(s.id as SubjectId);

  /* The clock is read ONCE, here — the phrase and the state machine are
     pure below (Milestone 2's pivot, DEC-026). */
  const now = new Date().toISOString();

  /* THE SESSION FACTS — the first reader of migration 0007's policies:
     cohort_sessions is the session-of-record this chamber stands inside.
     Isolated (5.7): a failed read renders the standby stage, not an error. */
  const sessionsRead = await isolateAsync("live:classroom", () => getSessions(s.id), { subject: s.id });
  const session = sessionsRead.ok ? sessionOfRecord(sessionsRead.value, now) : null;
  const chamber = chamberState(session, now);

  /* DEC-022 — the verb is chosen by the RECORD. The student's own events are
     read (RLS: own rows only, migration 0004) and isolated; the tutor has no
     record of their own here, so the verb stays "attend". Silent record →
     "attend": the first session is always attended. The same read also names
     whether THIS session is already on the student's record — the settlement
     sentence's one fact (Step 5). */
  let verb: "attend" | "resume" = "attend";
  let studentRecorded = false;
  if (viewer === "student") {
    const eventsRead = await isolateAsync("live:progress", () => getOwnProgressEvents(s.id), { subject: s.id });
    if (eventsRead.ok) {
      verb = attendanceState(eventsRead.value, s.id as SubjectId, liveCapabilities()).verb;
      studentRecorded = session !== null && eventsRead.value.some((e) => e.kind === "session-attended" && e.refId === session.id);
    }
  }

  /* THE TUTOR'S SETTLEMENT FACT — do attendance rows already stand for this
     session? It decides the form versus the confirmation (Step 5). Isolated:
     a failed read renders the FORM (the honest path that can complete the
     settlement), never a false confirmation. */
  let tutorRecorded = false;
  if (viewer === "tutor" && session && session.state === "concluded") {
    const countRead = await isolateAsync("live:settlement", () => getSessionAttendanceCount(s.id, session.id), { subject: s.id });
    tutorRecorded = countRead.ok && countRead.value > 0;
  }

  /* LiveKit readiness — env NAMES only, values never rendered or logged. */
  const readiness = liveKitReadiness({
    [LIVEKIT_ENV_KEYS.url]: process.env[LIVEKIT_ENV_KEYS.url],
    [LIVEKIT_ENV_KEYS.apiKey]: process.env[LIVEKIT_ENV_KEYS.apiKey],
    [LIVEKIT_ENV_KEYS.apiSecret]: process.env[LIVEKIT_ENV_KEYS.apiSecret],
  });

  /* The registry's honest label for the module — read, never invented. */
  const module = PLATFORM_MODULES.find((m) => m.id === "live-classroom");
  const moduleStatusLabel = module ? MODULE_STATUS_LABEL[module.status] : "Planned";

  /* THE ROOM IS OPEN while the facts say the chamber is standing: the
     module is live in the registry, the credentials are staged, and the
     state machine names ACTIVE — the tutor has opened the session and it
     has not been concluded (Step 5 supersedes DEC-026's SETTLING admittance:
     a concluded session shows the SETTLEMENT surface, never the open room —
     nothing of the session lingers once it is over). Standby keeps the
     stage: nothing about the participant interface renders ahead of the room
     it belongs to (DEC-023). When open, the LiveChamber shell takes the
     reserved grid — the participant's OWN media and the shared academic
     surface, opt-in and local-first, nothing invented (DEC-024, DEC-025). */
  const moduleLive = module?.status === "live" && readiness.configured;
  const roomOpen = moduleLive && chamber === "ACTIVE";

  /* A settlement attempt the route refused comes back as ?settle=failed and
     renders ONE calm sentence — the honest-page posture, no banner, no red. */
  const settleFailed = settle === "failed";

  /* THE SETTLEMENT SURFACE (Step 5) speaks once the session is concluded —
     SETTLING (its window) and CONCLUDED alike: the student's calm closing
     sentence, the tutor's academic record form or confirmation. */
  const settling = moduleLive && session !== null && showsSettlement(chamber);

  return (
    <LiveStage
      subject={{ id: s.id, name: s.name, tagline: s.tagline, motif: s.motif, accent: s.accent1 }}
      density={settings.levers.density}
      motionChar={settings.levers.motionChar}
      readiness={readiness}
      moduleStatusLabel={moduleStatusLabel}
      session={session ? { id: session.id, title: session.title, state: session.state, scheduledAt: session.scheduledAt } : null}
      verb={verb}
      scheduled={session ? scheduledPhrase(session.scheduledAt, now) : null}
      viewer={viewer}
      participant={roomOpen && session ? (
        <LiveChamber
          subject={{ id: s.id, name: s.name, motif: s.motif }}
          density={settings.levers.density}
          sessionTitle={session.title}
          stateWord={CHAMBER_STATE_WORD[chamber]}
          /* THE SESSION CHANNEL (Step 6) — the shell stands in the room's
             communication layer: the server-named stage seeds the banner
             (zero hydration drift), readiness is a fact the seam reads. */
          sessionId={session.id}
          stage={stageStateOf(chamber)}
          configured={readiness.configured}
          viewer={viewer}
          displayName={identity.displayName}
          /* THE CONCLUSION ACTION — the tutor's alone (Step 5). A plain form
             POST to the settle route; the 303 back IS the settling GET. It
             stands apart from the four-control cluster, which keeps its
             discipline (DEC-024): lifecycle is not a media control. */
          conclude={viewer === "tutor" ? (
            <form action={`/subjects/${s.id}/live/settle`} method="post" data-conclude-session>
              <input type="hidden" name="sessionId" value={session.id} />
              <Button type="submit" variant="secondary">
                Conclude the session
              </Button>
            </form>
          ) : undefined}
        />
      ) : undefined}
      settlement={settling && session ? (
        <SessionSettlement
          subject={{ id: s.id, name: s.name }}
          sessionTitle={session.title}
          sessionId={session.id}
          viewer={viewer}
          recorded={viewer === "student" ? studentRecorded : tutorRecorded}
        />
      ) : undefined}
      notice={settleFailed ? "The session could not be settled. Its current state stands." : undefined}
    />
  );
}
