import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArtifactOpener } from "@/components/archive/artifact-opener";
import { CanvasReplay } from "@/components/archive/canvas-replay";
import { MediaPlayer } from "@/components/archive/media-player";
import { MilestoneSynthesis } from "@/components/archive/milestone-synthesis";
import { getEnvironmentSettings } from "@/lib/environment/settings";
import type { SubjectId } from "@/lib/student/contract";
import type { ProgressEvent } from "@/lib/progress/events";
import { composeMilestoneRecord, type SessionFact } from "@/lib/progress/synthesis";
import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";
import type { StrokePacket } from "@/lib/livekit/surface-sync";

/* DEV-ONLY SPECIMEN · /dev/archive-rehearsal — 404s in production.

   The rehearsal space for the ARTIFACT VIEWER & VECTOR WHITEBOARD REPLAY
   ENGINE (Phase 8 · Step 3, DEC-031). The sandbox has no database and the
   artifact writer still owes real objects — so this rehearsal proves the
   engine exactly as /dev/live-stage proves the chamber: with SPECIMEN data,
   in the reader's own browser, honestly labeled.

   What stands here:
   · the replay engine against a specimen board record — the Board mode
     (pan, zoom, the whole record at once) and the chronological Playback
     (play, pause, scrub) on the subject's own substrate;
   · the restrained media player against a generated tone — play, pause,
     the MM:SS scrubber, the three speeds, volume and mute;
   · the full drawer round-trip — three openers (board, notation, audio),
     each lifting its artifact into the viewer: Escape closes, the backdrop
     closes, focus returns to the handle that opened it.

   Choose another subject with ?subject=physics to see its tokens frame the
   drawer and its motif carry the board. Nothing here reads or writes a
   database; nothing leaves this device.                              */

export const metadata: Metadata = { title: "Archive rehearsal" };

/* ── THE SPECIMEN BOARD — a small mathematics figure, drawn as the chamber
      would have synchronized it: the exact StrokePacket vocabulary of
      Phase 7, normalized coordinates, token colours, reference widths. ── */
function specimenStrokes(): StrokePacket[] {
  const axis = (x1: number, y1: number, x2: number, y2: number): { x: number; y: number }[] => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
    }
    return pts;
  };
  const curve: { x: number; y: number }[] = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const x = 0.18 + 0.68 * t;
    const y = 0.72 - 0.55 * Math.sin(Math.PI * t);
    curve.push({ x, y });
  }
  return [
    { id: "spec-axis-x", tool: "ink", points: axis(0.1, 0.72, 0.92, 0.72), color: "slate", width: 3.5 },
    { id: "spec-axis-y", tool: "ink", points: axis(0.18, 0.9, 0.18, 0.12), color: "slate", width: 3.5 },
    { id: "spec-curve", tool: "ink", points: curve, color: "accent", width: 3.5 },
    { id: "spec-chord", tool: "line", points: [{ x: 0.3, y: 0.64 }, { x: 0.74, y: 0.31 }], color: "ivory", width: 2 },
  ];
}

/* ── THE SPECIMEN TONE — 4 seconds of 220 Hz, generated deterministically
      as a WAV data URI: the player is proven audibly with no asset and no
      network. Dev rehearsal only; production media arrives by signed URL. ── */
function rehearsalToneUri(seconds = 4, hz = 220): string {
  const rate = 8000;
  const n = rate * seconds;
  const data = Buffer.alloc(44 + n * 2);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + n * 2, 4);
  data.write("WAVE", 8);
  data.write("fmt ", 12);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20); // PCM
  data.writeUInt16LE(1, 22); // mono
  data.writeUInt32LE(rate, 24);
  data.writeUInt32LE(rate * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const fade = Math.min(1, i / (rate * 0.05), (n - i) / (rate * 0.05)); // 50 ms edges
    const sample = Math.round(Math.sin((2 * Math.PI * hz * i) / rate) * 0.35 * fade * 32767);
    data.writeInt16LE(sample, 44 + i * 2);
  }
  return `data:audio/wav;base64,${data.toString("base64")}`;
}

/* ── THE SPECIMEN RECORD — two attended sessions with what they left
      behind, composed through the PRODUCTION pure function. The rehearsal
      declares live-classroom live so the registry gate can be seen working;
      production reads the registry itself (it is in-progress today, so the
      real surfaces stand honestly absent until the module is live). ────── */
function specimenRecord(subjectId: SubjectId) {
  const events: ProgressEvent[] = [
    { id: "spec-event-1", subjectId, kind: "session-attended", at: "2026-09-24T10:00:00.000Z", refId: "spec-session-1" },
    { id: "spec-event-2", subjectId, kind: "session-attended", at: "2026-10-01T10:00:00.000Z", refId: "spec-session-2" },
  ];
  const sessions: SessionFact[] = [
    {
      sessionId: "spec-session-1",
      title: "The parabola — axes, curve and chord",
      artifacts: [
        { id: "spec-artifact-board-1", type: "canvas_snapshot", metadata: {}, createdAt: "2026-09-24T11:00:00.000Z" },
        { id: "spec-artifact-notes-1", type: "pedagogical_notes", metadata: { summary: "We took the curve apart and put it back together: the axis facts first, then the shape the function makes between them." }, createdAt: "2026-09-24T11:05:00.000Z" },
      ],
    },
    {
      sessionId: "spec-session-2",
      title: "The tangent question",
      artifacts: [
        { id: "spec-artifact-board-2", type: "canvas_snapshot", metadata: {}, createdAt: "2026-10-01T11:00:00.000Z" },
        { id: "spec-artifact-audio-2", type: "session_recording", metadata: {}, createdAt: "2026-10-01T11:10:00.000Z" },
      ],
    },
  ];
  /* ["live-classroom"] is declared for the rehearsal — see the note above. */
  return composeMilestoneRecord(events, subjectId, ["live-classroom"], sessions);
}

interface Params {
  searchParams: Promise<{ subject?: string }>;
}

export default async function DevArchiveRehearsalPage({ searchParams }: Params) {
  if (process.env.NODE_ENV === "production") notFound();

  const { subject: subjectParam } = await searchParams;
  const s = getSubject(subjectParam ?? "mathematics") ?? SUBJECTS[0];
  const settings = await getEnvironmentSettings(s.id as SubjectId);

  const strokes = specimenStrokes();
  const toneUri = rehearsalToneUri();
  const session = { title: "Rehearsal session — the record stands", dateLabel: "8 October 2026" };
  const subject = { id: s.id, name: s.name, motif: s.motif, density: settings.levers.density };

  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)", color: "var(--ta-text-primary)" }}>
      <header style={{ marginBottom: "var(--ta-space-8)" }}>
        <p style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 }}>
          Dev specimen — not reachable in production
        </p>
        <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>
          Archive rehearsal — {s.name}
        </h1>
        <p style={{ color: "var(--ta-text-secondary)", maxWidth: "48em", marginTop: "var(--ta-space-3)" }}>
          The artifact viewer and the vector whiteboard replay engine, exercised against specimen data:
          no database stands behind this page, and it says so. Choose another subject with
          <code> ?subject=physics</code> to see its tokens frame the drawer and its motif carry the board.
        </p>
      </header>

      {/* THE REPLAY ENGINE — board and playback modes on the subject's substrate. */}
      <section aria-label="Replay engine rehearsal" data-subject={s.id} style={{ marginBottom: "var(--ta-space-12)" }}>
        <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, margin: "0 0 var(--ta-space-2)" }}>
          The vector whiteboard replay engine
        </h2>
        <p style={{ color: "var(--ta-text-secondary)", maxWidth: "48em", margin: "0 0 var(--ta-space-6)" }}>
          A specimen board record in the chamber&apos;s own stroke vocabulary. Board mode stands the whole
          record at once — arrow keys pan, plus and minus zoom, zero resets. Playback mode returns the
          strokes in their recorded order along the scrubber.
        </p>
        <div style={{ background: "var(--ta-surface-sunken)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-8)" }}>
          <CanvasReplay subjectId={s.id} motif={s.motif} density={settings.levers.density} strokes={strokes} />
        </div>
      </section>

      {/* THE MEDIA PLAYER — proven audibly against a generated tone. */}
      <section aria-label="Media player rehearsal" data-subject={s.id} style={{ marginBottom: "var(--ta-space-12)" }}>
        <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, margin: "0 0 var(--ta-space-2)" }}>
          The chamber audio player
        </h2>
        <p style={{ color: "var(--ta-text-secondary)", maxWidth: "48em", margin: "0 0 var(--ta-space-6)" }}>
          One restrained instrument: play, pause, the MM:SS scrubber, the three speeds without pitch
          distortion, volume and mute. The tone beneath it is generated for this rehearsal — production
          audio arrives only by signed URL.
        </p>
        <div style={{ background: "var(--ta-surface-sunken)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-8)" }}>
          <MediaPlayer src={toneUri} kind="audio" title="Rehearsal tone" />
        </div>
      </section>

      {/* THE DRAWER ROUND-TRIP — three openers, each kind, full focus cycle. */}
      <section aria-label="Artifact drawer rehearsal" data-subject={s.id}>
        <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, margin: "0 0 var(--ta-space-2)" }}>
          The artifact drawer — the full round-trip
        </h2>
        <p style={{ color: "var(--ta-text-secondary)", maxWidth: "48em", margin: "0 0 var(--ta-space-6)" }}>
          Each handle lifts its artifact into the scholarly drawer. Escape closes it; the backdrop closes
          it; focus returns to the handle that opened it. Production fetches the bytes through the
          signed-URL seam at this moment — the rehearsal hands them over directly, and says so.
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-4)", gridTemplateColumns: "repeat(auto-fill, minmax(min(16rem, 100%), 1fr))" }}>
          <div style={{ border: "1px solid var(--ta-border-subtle)", borderLeft: "2px solid var(--ta-accent-1)", borderRadius: "var(--ta-radius-2)", background: "var(--ta-surface-base)", padding: "var(--ta-space-4)", display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
            <p style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 }}>Board Record</p>
            <ArtifactOpener
              artifact={{ id: "rehearsal-board", type: "canvas_snapshot", word: "Board Record", notation: null, mediaKind: "audio" }}
              session={session}
              subject={subject}
              rehearsal={{ strokes }}
            />
          </div>
          <div style={{ border: "1px solid var(--ta-border-subtle)", borderLeft: "2px solid var(--ta-accent-1)", borderRadius: "var(--ta-radius-2)", background: "var(--ta-surface-base)", padding: "var(--ta-space-4)", display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
            <p style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 }}>Session Notation</p>
            <ArtifactOpener
              artifact={{
                id: "rehearsal-notation",
                type: "pedagogical_notes",
                word: "Session Notation",
                notation:
                  "We took the curve apart and put it back together: the axis facts first, then the shape the function makes between them. The chord was the question; the curve was the answer. Next session we begin where the tangent would have stood.",
                mediaKind: "audio",
              }}
              session={session}
              subject={subject}
            />
          </div>
          <div style={{ border: "1px solid var(--ta-border-subtle)", borderLeft: "2px solid var(--ta-accent-1)", borderRadius: "var(--ta-radius-2)", background: "var(--ta-surface-base)", padding: "var(--ta-space-4)", display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
            <p style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 }}>Chamber Audio</p>
            <ArtifactOpener
              artifact={{ id: "rehearsal-audio", type: "session_recording", word: "Chamber Audio", notation: null, mediaKind: "audio" }}
              session={session}
              subject={subject}
              rehearsal={{ mediaUrl: toneUri }}
            />
          </div>
        </div>
      </section>

      {/* THE MILESTONE SYNTHESIS — the chronology composed from specimen
          facts through the production pure function, in both registers. */}
      <section aria-label="Milestone synthesis rehearsal" data-subject={s.id} style={{ marginTop: "var(--ta-space-12)" }}>
        <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, margin: "0 0 var(--ta-space-2)" }}>
          The milestone synthesis — the record substantiated
        </h2>
        <p style={{ color: "var(--ta-text-secondary)", maxWidth: "48em", margin: "0 0 var(--ta-space-6)" }}>
          Two specimen sessions, each with what it left behind, composed by the same pure function production
          uses. The student&apos;s register and the tutor&apos;s register stand side by side. The rehearsal declares
          the classroom module live so the registry gate can be seen; production reads the registry itself and
          stands honestly absent until the module is live.
        </p>
        <div style={{ display: "grid", gap: "var(--ta-space-6)" }}>
          <div style={{ background: "var(--ta-surface-sunken)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-8)" }}>
            <MilestoneSynthesis subjectId={s.id} subjectName={s.name} entries={specimenRecord(s.id as SubjectId)} viewer="student" />
          </div>
          <div style={{ background: "var(--ta-surface-sunken)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-8)" }}>
            <MilestoneSynthesis subjectId={s.id} subjectName={s.name} entries={specimenRecord(s.id as SubjectId)} viewer="tutor" />
          </div>
        </div>
      </section>

      <p style={{ marginTop: "var(--ta-space-12)" }}>
        <Link href={`/subjects/${s.id}/archive`} style={{ color: "var(--ta-accent-1)" }}>
          The production surface ({`/subjects/${s.id}/archive`})
        </Link>
      </p>
    </main>
  );
}
