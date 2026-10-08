import Link from "next/link";

import { SubjectMark } from "@/components/brand/subject-mark";
import { Stage } from "@/components/motif/stage";
import type { SessionRowState } from "@/lib/classroom/state-machine";
import type { LiveKitReadiness } from "@/lib/livekit/config";
import type { Density, MotionChar, Motif } from "@/lib/subjects/subjects";

/* ════════════════════════════════════════════════════════════════════════
   LIVE STAGE — Phase 7 · Step 2 (DEC-023)

   The disciplined backdrop for live sessions: the subject's own tokens
   (graphite/substrate darks, subject accent, motif substrate) instead of a
   generic vendor video grid. A SERVER component — no "use client", no
   timers, no polling, no presence detection, no webcam anything: ZERO
   SURVEILLANCE BY CONSTRUCTION (the Phase 7 · Step 2 rule). The only
   interactive surface this step ships is a plain link.

   TWO HONEST STATES, decided by the page from real facts:

   · STANDBY — LiveKit credentials are not configured (the truth today, and
     in every environment until a wiring step is ruled). The sentence is the
     brief's, verbatim for the student; the tutor hears the same sentence
     with the one pronoun made true. No spinner, no vendor modal, no error
     theatre — a staged room says it is staged.

   · SESSION STAGED — a classroom session exists (active, the earliest
     scheduled, or the most recent concluded still within its settling
     window — Milestone 2's pivot to cohort_sessions, DEC-026). Its facts
     render as facts: the session's title, its scheduled day, the
     attend-versus-resume sentence chosen by the record (DEC-022 —
     src/lib/progress/record.ts), and the RESERVED TILE GRID: an empty,
     named place on the substrate where tiles will sit. Nothing inside the
     grid is invented — no fake participants, no placeholder faces.

   The connection island ("use client") arrives with the wiring step that
   holds credentials (docs/proposed/livekit_recon.md); this file is the seam
   it mounts into. Until then, nothing here pretends to connect.
   ════════════════════════════════════════════════════════════════════════ */

export interface LiveStageSubject {
  id: string;
  name: string;
  /** "The Lattice — structure you can stand on." — the first segment is the environment name. */
  tagline: string;
  motif: Motif;
  accent: { ink: string; ivory: string };
}

/** The session fact the stage may speak about — one row, four fields, no
 *  more. Milestone 2 pivoted this surface to cohort_sessions (DEC-026); the
 *  shape is deliberately the state machine's facts, not a cohort's. */
export interface LiveSessionView {
  id: string;
  title: string;
  state: SessionRowState;
  scheduledAt: string;
}

const MONO_LABEL: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export function LiveStage({
  subject,
  density,
  motionChar,
  readiness,
  moduleStatusLabel,
  session,
  verb,
  scheduled,
  viewer,
  participant,
}: {
  subject: LiveStageSubject;
  density: Density;
  motionChar: MotionChar;
  readiness: LiveKitReadiness;
  /** The registry's honest label for live-classroom — "In progress", never "coming soon". */
  moduleStatusLabel: string;
  /** The one session this surface may speak about (cohort_sessions → LiveSessionView), or none. */
  session: LiveSessionView | null;
  /** DEC-022's verb, chosen by the record: "attend" while the record is silent. */
  verb: "attend" | "resume";
  /** scheduledPhrase(session.scheduledAt, now) — "today" · "on 12 Sep 2026" · null. */
  scheduled: string | null;
  viewer: "student" | "tutor";
  /**
   * THE ROOM, OPEN — the participant island (7.3), passed by the page ONLY
   * when the room is truly open (module live, credentials staged, a session
   * named). While absent, the reserved grid and the standby state stand:
   * the stage says exactly what is missing and nothing else.
   */
  participant?: React.ReactNode;
}) {
  const environmentName = subject.tagline.split(" — ")[0].trim();
  const sentence = verb === "resume" ? `Resume the ${subject.name} session` : `Attend the ${subject.name} session`;
  const standbySentence =
    viewer === "tutor"
      ? "The chamber is staged. Live connection will initiate once you open the session."
      : "The chamber is staged. Live connection will initiate once your tutor opens the session.";

  return (
    <div data-subject={subject.id} data-spatial="stage" data-live-stage data-density={density} data-motion-char={motionChar} data-live-configured={readiness.configured ? "true" : "false"}>
      <Stage subject={subject.id} motif={subject.motif} density={density} purpose="substrate" style={{ background: "var(--ta-surface-sunken)", minHeight: "70vh" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "var(--ta-space-16) var(--ta-gutter) var(--ta-space-section)" }}>
          {/* identity — mark, single h1, environment name */}
          <header data-live-identity>
            <span style={{ color: subject.accent.ink, display: "inline-flex" }}>
              <SubjectMark subject={subject.id} size={48} />
            </span>
            <h1
              id="subject-heading"
              tabIndex={-1}
              style={{
                margin: "var(--ta-space-3) 0 0",
                fontFamily: "var(--ta-font-display)",
                fontSize: "var(--ta-display-md)",
                fontWeight: 500,
                color: "var(--ta-text-primary)",
              }}
            >
              {session ? sentence : `${subject.name} — live`}
            </h1>
            <p style={{ margin: "var(--ta-space-2) 0 0", color: "var(--ta-text-secondary)" }}>{environmentName}</p>
          </header>

          <div style={{ marginTop: "var(--ta-space-8)" }}>
            {session && (
              <section
                data-live-session
                data-session-state={session.state}
                aria-label="Session"
                style={{
                  border: "1px solid color-mix(in srgb, var(--ta-accent-1) 45%, transparent)",
                  borderRadius: "var(--ta-radius-2)",
                  background: "var(--ta-surface-raised)",
                  padding: "var(--ta-space-6)",
                }}
              >
                <p style={MONO_LABEL}>
                  {session.state === "active" ? "Session open" : session.state === "concluded" ? "Session concluded" : "Next session"}
                </p>
                <p style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500 }}>
                  {session.title}
                </p>
                {session.state === "scheduled" && scheduled && (
                  <p style={{ margin: "var(--ta-space-1) 0 0", color: "var(--ta-text-secondary)" }}>Scheduled {scheduled}.</p>
                )}

                {participant ? (
                  /* THE ROOM, OPEN (7.3) — the participant island takes the
                     place the reserved grid held. Decided by the page. */
                  <div style={{ marginTop: "var(--ta-space-6)" }}>{participant}</div>
                ) : (
                  <>
                    {/* THE RESERVED TILE GRID — the place tiles will sit, on this
                        subject's substrate, never a vendor grid. Empty by honesty:
                        participants are facts, and no participant fact exists yet. */}
                    <div
                      data-live-grid
                      aria-hidden="true"
                      style={{
                        marginTop: "var(--ta-space-6)",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
                        gap: "var(--ta-space-3)",
                      }}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{
                            aspectRatio: "16 / 9",
                            borderRadius: "var(--ta-radius-2)",
                            border: "1px dashed color-mix(in srgb, var(--ta-accent-1) 30%, transparent)",
                            background: "var(--ta-surface-sunken)",
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ ...MONO_LABEL, marginTop: "var(--ta-space-3)" }}>The room is staged for {session.title}.</p>
                  </>
                )}
              </section>
            )}

            {/* The status block stands only while the room is NOT open: once
                the participant island is mounted, the room speaks for itself. */}
            {!participant && (!readiness.configured ? (
              <section data-live-standby aria-label="Room status" style={{ marginTop: session ? "var(--ta-space-6)" : 0 }}>
                <p style={MONO_LABEL}>Live classroom — {moduleStatusLabel}</p>
                <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-lg)", maxWidth: "36em", color: "var(--ta-text-primary)" }}>
                  {standbySentence}
                </p>
                {!readiness.configured && readiness.missing.length > 0 && (
                  <p style={{ margin: "var(--ta-space-2) 0 0", color: "var(--ta-text-secondary)", fontSize: "var(--ta-text-sm)" }}>
                    {readiness.missing.length} of three credential {readiness.missing.length === 1 ? "setting is" : "settings are"} unset.
                  </p>
                )}
              </section>
            ) : (
              <section data-live-connection aria-label="Connection" style={{ marginTop: session ? "var(--ta-space-6)" : 0 }}>
                <p style={{ margin: 0, color: "var(--ta-text-secondary)" }}>
                  Credentials are staged. The connection itself is wired by the live-classroom module.
                </p>
              </section>
            ))}

            {/* the way back — the brief's no-session sentence for the student,
                the same truth worded for the tutor. A plain link: no JS. */}
            <p style={{ marginTop: "var(--ta-space-8)" }}>
              <Link href={`/subjects/${subject.id}`} style={{ color: "var(--ta-accent-1)", textDecorationColor: "color-mix(in srgb, var(--ta-accent-1) 50%, transparent)" }}>
                {viewer === "student" ? `Resume work in ${subject.name}` : `Return to ${environmentName}`}
              </Link>
            </p>
          </div>
        </div>
      </Stage>
    </div>
  );
}
