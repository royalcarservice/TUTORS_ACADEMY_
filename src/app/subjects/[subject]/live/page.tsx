import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LiveStage } from "@/components/live/live-stage";
import { AcademicSurface } from "@/components/live/academic-surface";
import { RoomLayout } from "@/components/live/room-layout";
import { RoomParticipant } from "@/components/live/room-participant";
import { ROUTES } from "@/config/routes";
import { MODULE_STATUS_LABEL, PLATFORM_MODULES } from "@/config/modules";
import { getIdentity } from "@/lib/auth/session";
import { getCohortSessions } from "@/lib/cohort/data";
import { sessionForSubject } from "@/lib/cohort/session";
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

/* /subjects/[subject]/live — THE COHORT SESSION SURFACE (Phase 7 · Step 2, DEC-023)
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
 * FAILURE HONESTY (5.7): the cohort and progress reads are SUPPLEMENTAL —
 * each is isolated; a failed read renders the standby stage (the truthful
 * minimum) and logs; the page itself never fails for them. The identity and
 * enrolment reads are PRIMARY — a failed read fails the page, because
 * answering without them would be answering wrongly.
 */

interface Params {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subject } = await params;
  const s = getSubject(subject);
  if (!s) return {};
  return { title: `${s.name} — live` };
}

export default async function LiveSessionPage({ params }: Params) {
  const { subject } = await params;
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

  /* THE COHORT FACTS — the first reader of migration 0006's policies.
     Isolated (5.7): a failed read renders the standby stage, not an error. */
  const sessionsRead = await isolateAsync("live:cohorts", () => getCohortSessions(s.id), { subject: s.id });
  const session = sessionsRead.ok ? sessionForSubject(sessionsRead.value, s.id) : null;

  /* DEC-022 — the verb is chosen by the RECORD. The student's own events are
     read (RLS: own rows only, migration 0004) and isolated; the tutor has no
     record of their own here, so the verb stays "attend". Silent record →
     "attend": the first session is always attended. */
  let verb: "attend" | "resume" = "attend";
  if (viewer === "student") {
    const eventsRead = await isolateAsync("live:progress", () => getOwnProgressEvents(s.id), { subject: s.id });
    if (eventsRead.ok) verb = attendanceState(eventsRead.value, s.id as SubjectId, liveCapabilities()).verb;
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

  /* The clock is read ONCE, here — the phrase is pure below. */
  const now = new Date().toISOString();

  /* THE ROOM IS OPEN only when three facts hold at once: the module is live
     in the registry, the credentials are staged, and a session is named.
     Until then the stage keeps its standby state (DEC-023): nothing about
     the participant interface renders ahead of the room it belongs to.
     When open, the room composition (7.3/7.4) takes the reserved grid —
     the participant's OWN media and the shared academic surface, opt-in and
     local-first, nothing invented (DEC-024, DEC-025). */
  const roomOpen = module?.status === "live" && readiness.configured && session !== null;

  return (
    <LiveStage
      subject={{ id: s.id, name: s.name, tagline: s.tagline, motif: s.motif, accent: s.accent1 }}
      density={settings.levers.density}
      motionChar={settings.levers.motionChar}
      readiness={readiness}
      moduleStatusLabel={moduleStatusLabel}
      session={session}
      verb={verb}
      scheduled={session ? scheduledPhrase(session.scheduledAt, now) : null}
      viewer={viewer}
      participant={roomOpen ? (
        <RoomLayout
          chamber={<RoomParticipant subjectId={s.id} displayName={identity.displayName} role={viewer} />}
          surface={<AcademicSurface subjectId={s.id} motif={s.motif} density={settings.levers.density} />}
        />
      ) : undefined}
    />
  );
}
