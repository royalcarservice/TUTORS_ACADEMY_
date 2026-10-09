"use client";

/* ════════════════════════════════════════════════════════════════════════
   LIVE CHAMBER — Phase 7 · Milestone 2 (DEC-026) · Step 6 (DEC-028)

   The client shell the admitted viewer stands inside once the room is
   open. Three parts, and nothing else:

   · THE STATUS BAR — disciplined, one line: the subject's own mark, the
     session's title, and the academic state word. While a session channel
     stands (Step 6), the word rides the channel — the tutor concludes, and
     the banner says so for everyone the room knows; the server-named word
     is the seed, so the first client render IS the server render (zero
     hydration drift). No timer, no counter, no presence telemetry — the
     bar names facts, never measures people.

   · THE PRESENCE LINE — who the channel knows, named calmly ("Tutor
     present" · "Student present"): facts the participants themselves
     announced, opt-in, never inferred. In local mode that is exactly one
     participant — no one is invented.

   · THE WORKSPACE — the room's tested responsive composition
     (room-layout): wide widths keep the chamber's quiet column beside the
     focused academic surface; narrow widths offer one plane at a time
     behind two real, aria-pressed buttons. The surface draws on the
     session's shared bus when one stands; the island reports its own
     audio facts to the presence channel. The participant's own media is
     opt-in and local until the transport is wired (DEC-024's seam).

   · CONCLUSION BY SIGNAL — the moment a concluded STAGE_STATE lands, the
     workspace closes and the chamber speaks the closing sentence: nothing
     of the session lingers on the device (Step 5's confidentiality,
     carried by the channel).

   If the facts say standby, this shell never mounts — the stage speaks
   instead. If no session is named, the shell stands exactly as it did
   before Step 6: composed of the server's facts alone.
   ════════════════════════════════════════════════════════════════════════ */

import { SubjectMark } from "@/components/brand/subject-mark";
import { Button } from "@/components/ui";
import { AcademicSurface } from "@/components/live/academic-surface";
import { RoomLayout } from "@/components/live/room-layout";
import { RoomParticipant } from "@/components/live/room-participant";
import { useClassroomSession } from "@/lib/classroom/use-classroom-session";
import type { MotifKind } from "@/lib/motif/types";
import type { Density } from "@/lib/subjects/subjects";

import type { StageStateId } from "@/lib/classroom/types";

export function LiveChamber({
  subject,
  density,
  sessionTitle,
  stateWord,
  viewer,
  displayName,
  conclude,
  sessionId,
  stage,
  configured = false,
  rehearsal = false,
}: {
  /** The subject the chamber belongs to — id, name and authored motif. */
  subject: { id: string; name: string; motif: MotifKind };
  /** The room's effective density lever (authored or shaped, 6.4). */
  density: Density;
  /** The session-of-record's title (cohort_sessions.title). */
  sessionTitle: string;
  /** The state machine's word for this instant — CHAMBER_STATE_WORD. */
  stateWord: string;
  /** Who stands here — decided server-side by enrolment or relationship. */
  viewer: "student" | "tutor";
  /** The participant's own displayed name, for their own tile. */
  displayName: string;
  /**
   * THE CONCLUSION ACTION (Step 5) — the tutor's settle form, passed by the
   * page only while the session stands ACTIVE. It renders apart from the
   * four-control cluster: lifecycle is not a media control. Absent for the
   * student and once the session has concluded.
   */
  conclude?: React.ReactNode;
  /**
   * THE SESSION CHANNEL (Step 6) — named, the shell stands in the room's
   * communication layer: presence, audio state, the shared canvas bus and
   * the lifecycle word all ride it (locally until the carrier is wired —
   * DEC-023/DEC-028). Absent, the shell composes server facts alone,
   * exactly as before Step 6.
   */
  sessionId?: string;
  /** The server-named stage — the banner's zero-mismatch seed. */
  stage?: StageStateId;
  /** LiveKit readiness fact (env NAMES only) — the seam reads it. */
  configured?: boolean;
  /** The rehearsal surface names itself and may exercise the lifecycle. */
  rehearsal?: boolean;
}) {
  /* THE SESSION — always called (the rules of hooks); idle while no session
     is named. Every initial value derives synchronously from the server's
     facts, so hydration cannot drift. */
  const session = useClassroomSession({
    subjectId: subject.id,
    sessionId: sessionId ?? null,
    role: viewer,
    initialStage: stage ?? "active",
    configured,
  });
  const live = sessionId !== undefined;

  return (
    <div data-live-chamber aria-label={`${subject.name} live chamber`}>
      {/* THE STATUS BAR — mark, title, state word. Facts, in order. The
          word rides the session channel when one stands. */}
      <header
        data-live-chamber-bar
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--ta-space-3)",
          padding: "var(--ta-space-3) 0",
          borderBottom: "1px solid var(--ta-border-subtle)",
        }}
      >
        <span style={{ color: "var(--ta-accent-1)", display: "inline-flex", flexShrink: 0 }}>
          <SubjectMark subject={subject.id} size={24} />
        </span>
        <p style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-lg)", fontWeight: 500, color: "var(--ta-text-primary)" }}>
          {sessionTitle}
        </p>
        <p
          aria-live="polite"
          style={{
            margin: "0 0 0 auto",
            fontFamily: "var(--ta-font-mono)",
            fontSize: "var(--ta-text-2xs)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ta-text-muted)",
          }}
        >
          {live ? session.stageWord : stateWord}
        </p>
      </header>

      {/* THE PRESENCE LINE + THE REHEARSAL LIFECYCLE — only while a session
          channel stands. Presence names who the channel knows — announced
          facts, never inferred; the rehearsal toggle is the tutor's local
          stage control (Step 6's mock lifecycle), clearly named. */}
      {live && (
        <div
          data-live-chamber-presence
          style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-2)" }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--ta-font-mono)",
              fontSize: "var(--ta-text-2xs)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ta-text-muted)",
            }}
          >
            {session.participants.map((p) => (p.role === "tutor" ? "Tutor present" : "Student present")).join(" · ") || "The room is empty"}
          </p>
          {rehearsal && viewer === "tutor" && (
            <span style={{ marginLeft: "auto" }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => session.setStage(session.concluded ? "active" : "concluded")}
              >
                {session.concluded ? "Rehearsal — reopen the session" : "Rehearsal — conclude the session"}
              </Button>
            </span>
          )}
        </div>
      )}

      {/* THE CONCLUSION ACTION — the tutor's, when the page supplies it
          (Step 5). It stands below the bar, right-aligned and apart from
          the media cluster: closing the chamber is a lifecycle act, not a
          device control. */}
      {conclude && (
        <div data-live-chamber-conclude style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--ta-space-3)" }}>
          {conclude}
        </div>
      )}

      {/* THE WORKSPACE — the tested responsive composition. A concluded
          signal closes it: the chamber speaks the closing sentence instead,
          and the room's media and canvas state unmount — nothing of the
          session lingers (Step 5's confidentiality, carried by the channel). */}
      {live && session.concluded ? (
        <p
          data-live-chamber-concluded
          style={{ margin: "var(--ta-space-8) 0 0", fontSize: "var(--ta-text-lg)", color: "var(--ta-text-primary)", maxWidth: "36em" }}
        >
          The session in {subject.name} has concluded.
        </p>
      ) : (
        <div style={{ marginTop: "var(--ta-space-4)" }}>
          <RoomLayout
            chamber={
              <RoomParticipant
                subjectId={subject.id}
                displayName={displayName}
                role={viewer}
                onPresence={live ? session.updateLocalPresence : undefined}
              />
            }
            surface={
              <AcademicSurface
                subjectId={subject.id}
                motif={subject.motif}
                density={density}
                bus={live ? session.bus : undefined}
              />
            }
          />
        </div>
      )}
    </div>
  );
}
