"use client";

/* ════════════════════════════════════════════════════════════════════════
   LIVE CHAMBER — Phase 7 · Milestone 2 (DEC-026)

   The client shell the admitted viewer stands inside once the room is
   open. Three parts, and nothing else:

   · THE STATUS BAR — disciplined, one line: the subject's own mark, the
     session's title, and the academic state word the state machine named
     (Standby · In session · Settling · Concluded). No timer, no counter,
     no presence telemetry — the bar names facts, never measures people.

   · THE WORKSPACE — the room's tested responsive composition
     (room-layout): wide widths keep the chamber's quiet column beside the
     focused academic surface; narrow widths offer one plane at a time
     behind two real, aria-pressed buttons. The participant's own media is
     opt-in and local until the transport is wired (DEC-024's seam).

   · NOTHING ELSE — the dock of participant tiles lives inside the chamber
     pane (participant-dock), the controls are the four LiveControls, and
     the state machine's word is the only announcement the room makes.

   The shell owns NO connection state: it receives facts (session title,
   state word, identity) from the server page and composes them. If the
   facts say standby, this shell never mounts — the stage speaks instead.
   ════════════════════════════════════════════════════════════════════════ */

import { SubjectMark } from "@/components/brand/subject-mark";
import { AcademicSurface } from "@/components/live/academic-surface";
import { RoomLayout } from "@/components/live/room-layout";
import { RoomParticipant } from "@/components/live/room-participant";
import type { MotifKind } from "@/lib/motif/types";
import type { Density } from "@/lib/subjects/subjects";

export function LiveChamber({
  subject,
  density,
  sessionTitle,
  stateWord,
  viewer,
  displayName,
  conclude,
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
}) {
  return (
    <div data-live-chamber aria-label={`${subject.name} live chamber`}>
      {/* THE STATUS BAR — mark, title, state word. Facts, in order. */}
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
          {stateWord}
        </p>
      </header>

      {/* THE CONCLUSION ACTION — the tutor's, when the page supplies it
          (Step 5). It stands below the bar, right-aligned and apart from
          the media cluster: closing the chamber is a lifecycle act, not a
          device control. */}
      {conclude && (
        <div data-live-chamber-conclude style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--ta-space-3)" }}>
          {conclude}
        </div>
      )}

      {/* THE WORKSPACE — the tested responsive composition, unchanged. */}
      <div style={{ marginTop: "var(--ta-space-4)" }}>
        <RoomLayout
          chamber={<RoomParticipant subjectId={subject.id} displayName={displayName} role={viewer} />}
          surface={<AcademicSurface subjectId={subject.id} motif={subject.motif} density={density} />}
        />
      </div>
    </div>
  );
}
