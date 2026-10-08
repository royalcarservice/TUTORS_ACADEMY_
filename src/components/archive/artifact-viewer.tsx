"use client";

/* ════════════════════════════════════════════════════════════════════════
   THE ARTIFACT VIEWER — Phase 8 · Step 3 (DEC-031)

   The scholarly review mode: one artifact stands alone in a dark graphite
   drawer above the shelf, framed by the subject's own tokens — high
   contrast type, no clutter, nothing beside the artifact that asks to be
   looked at. Opening it is seamless; so is leaving: the Escape key, the
   Close button and the backdrop all return the reader to the shelf, and
   focus goes back to the opener that let them in.

   THE CONTENT ADAPTS TO THE KIND:
   · Board Record      → the vector whiteboard replay engine;
   · Session Notation  → the tutor's notation, set wide and readable;
   · Chamber Audio     → the restrained media player.

   THE READER'S PRIVACY (the brief's scoping branch): bytes arrive only via
   signed URLs minted at the moment of opening (the openArtifact server
   action), scoped by RLS to the session's own participants. No watermark
   machinery, no tracking, no counter ticks while a reader stands here —
   zero engagement metrics by construction (DEC-029).
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";

import { SubjectMark } from "@/components/brand/subject-mark";
import type { Density, MotifKind } from "@/lib/motif/types";
import type { ArtifactType } from "@/lib/archive/artifact";

import { CanvasReplay } from "./canvas-replay";
import { MediaPlayer } from "./media-player";
import { openArtifact, type OpenedArtifact } from "@/app/subjects/[subject]/archive/actions";
import { parseBoardRecord } from "./board-record";

/** The viewer's own words — one calm sentence per state, no exclamation marks. */
export const VIEWER_COPY = {
  reading: "The archive is fetching this artifact.",
  unsigned: "This artifact stands in the archive; its bytes open in a credentialed environment.",
  unavailable: "This artifact could not be opened. The archive has not lost it.",
  boardUnreadable: "The board record could not be read back.",
  notationHeld: "The notation for this session is held in the archive.",
  close: "Close",
  closeLabel: "Close the artifact viewer",
} as const;

export interface ViewerArtifact {
  id: string;
  type: ArtifactType;
  /** The archive's own word for the kind. */
  word: string;
  /** The notation's text, when the kind is pedagogical_notes. */
  notation: string | null;
  /** The recorded media's own kind, when the kind is session_recording. */
  mediaKind: "audio" | "video";
}

export interface ViewerSession {
  title: string;
  /** The session's date exactly as the shelf states it. */
  dateLabel: string;
}

export interface ViewerSubject {
  id: string;
  name: string;
  motif: MotifKind;
  density: Density;
}

/** Rehearsal content (dev-only, DEC-031): where the production drawer would
 *  fetch through the signed-URL seam, the rehearsal hands the bytes over
 *  directly — the engine is proven without a database, honestly labeled. */
export interface ViewerRehearsal {
  strokes?: import("@/lib/livekit/surface-sync").StrokePacket[];
  mediaUrl?: string;
}

export interface ArtifactViewerProps {
  artifact: ViewerArtifact;
  session: ViewerSession;
  subject: ViewerSubject;
  onClose: () => void;
  /** Present only in the dev rehearsal; production never sets it. */
  rehearsal?: ViewerRehearsal;
}

type BoardState =
  | { phase: "reading" }
  | { phase: "unsigned" }
  | { phase: "unavailable" }
  | { phase: "unreadable" }
  | { phase: "ready"; strokes: import("@/lib/livekit/surface-sync").StrokePacket[] };

export function ArtifactViewer({ artifact, session, subject, onClose, rehearsal }: ArtifactViewerProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [board, setBoard] = useState<BoardState>(() =>
    rehearsal?.strokes ? { phase: "ready", strokes: [...rehearsal.strokes] } : { phase: "reading" },
  );
  const [media, setMedia] = useState<{ url: string } | { phase: "reading" } | { phase: "unsigned" } | { phase: "unavailable" }>(() =>
    rehearsal?.mediaUrl ? { url: rehearsal.mediaUrl } : { phase: "reading" },
  );

  /* THE READER'S EXIT — Escape from anywhere inside the drawer. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* FOCUS — enters the drawer when it opens (the Close button, the guaranteed
     control); nothing else on the page stays reachable while it stands. */
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  /* THE BYTES — fetched ONLY when the reader opens the drawer, through the
     signed-URL seam. A fetch runs once per mount; a closed drawer mounts nothing. */
  useEffect(() => {
    if (rehearsal) return; // rehearsal content stands as given; nothing fetches
    let cancelled = false;
    if (artifact.type === "canvas_snapshot") {
      void (async () => {
        const opened: OpenedArtifact = await openArtifact(artifact.id);
        if (cancelled) return;
        if (!opened.ok) return setBoard({ phase: "unavailable" });
        if (opened.access?.mode !== "signed") return setBoard({ phase: "unsigned" });
        try {
          const res = await fetch(opened.access.url);
          if (!res.ok) throw new Error("status");
          const json: unknown = await res.json();
          const strokes = parseBoardRecord(json);
          if (cancelled) return;
          setBoard(strokes ? { phase: "ready", strokes } : { phase: "unreadable" });
        } catch {
          if (!cancelled) setBoard({ phase: "unreadable" });
        }
      })();
    }
    if (artifact.type === "session_recording") {
      void (async () => {
        const opened: OpenedArtifact = await openArtifact(artifact.id);
        if (cancelled) return;
        if (!opened.ok) return setMedia({ phase: "unavailable" });
        if (opened.access?.mode !== "signed") return setMedia({ phase: "unsigned" });
        setMedia({ url: opened.access.url });
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [artifact.id, artifact.type, rehearsal]);

  const calm = useCallback((sentence: string) => (
    <p style={{ margin: 0, fontSize: "var(--ta-text-md)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>{sentence}</p>
  ), []);

  return (
    /* THE DRAWER — above the shelf, beneath nothing. The backdrop blurs the
       environment, never hides it: the reader always knows where they stand. */
    <div
      data-artifact-viewer
      role="dialog"
      aria-modal="true"
      aria-label={`${artifact.word} — ${session.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--ta-space-4)",
        background: "color-mix(in srgb, var(--ta-surface-sunken) 78%, transparent)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: "min(60rem, 100%)",
          maxHeight: "100%",
          overflow: "auto",
          border: "1px solid var(--ta-border-subtle)",
          borderLeft: "2px solid var(--ta-accent-1)",
          borderRadius: "var(--ta-radius-2)",
          background: "var(--ta-surface-base)",
          padding: "var(--ta-space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--ta-space-4)",
        }}
      >
        {/* THE HEADER — the session's date, the subject's mark, the title;
            the Close button stands where every reader expects it. */}
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "var(--ta-space-3)", rowGap: "var(--ta-space-2)" }}>
          <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden>
            <SubjectMark subject={subject.id} size={24} />
          </span>
          <p style={{ margin: 0, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" }}>
            {session.dateLabel} · {artifact.word}
          </p>
          <h2 style={{ margin: 0, width: "100%", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, lineHeight: 1.2, color: "var(--ta-text-primary)", textWrap: "balance" }}>
            {session.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            data-artifact-close
            onClick={onClose}
            aria-label={VIEWER_COPY.closeLabel}
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "var(--ta-target-primary)",
              minWidth: "var(--ta-target-primary)",
              padding: "var(--ta-space-2) var(--ta-space-3)",
              border: "1px solid var(--ta-border-subtle)",
              borderRadius: "var(--ta-radius-2)",
              background: "var(--ta-surface-base)",
              color: "var(--ta-text-primary)",
              fontSize: "var(--ta-text-sm)",
              cursor: "pointer",
            }}
          >
            {VIEWER_COPY.close}
          </button>
        </header>

        {/* THE CONTENT — adapts to the kind; every state is one calm sentence. */}
        {artifact.type === "canvas_snapshot" &&
          (board.phase === "ready" ? (
            <CanvasReplay subjectId={subject.id} motif={subject.motif} density={subject.density} strokes={board.strokes} />
          ) : board.phase === "reading" ? (
            calm(VIEWER_COPY.reading)
          ) : board.phase === "unsigned" ? (
            calm(VIEWER_COPY.unsigned)
          ) : board.phase === "unreadable" ? (
            calm(VIEWER_COPY.boardUnreadable)
          ) : (
            calm(VIEWER_COPY.unavailable)
          ))}

        {artifact.type === "pedagogical_notes" &&
          (artifact.notation ? (
            <p style={{ margin: 0, fontSize: "var(--ta-text-md)", lineHeight: 1.7, color: "var(--ta-text-primary)", maxWidth: "var(--ta-measure)", whiteSpace: "pre-wrap" }}>
              {artifact.notation}
            </p>
          ) : (
            calm(VIEWER_COPY.notationHeld)
          ))}

        {artifact.type === "session_recording" &&
          ("url" in media ? (
            <MediaPlayer src={media.url} kind={artifact.mediaKind} title={`${artifact.word} — ${session.title}`} />
          ) : media.phase === "reading" ? (
            calm(VIEWER_COPY.reading)
          ) : media.phase === "unsigned" ? (
            calm(VIEWER_COPY.unsigned)
          ) : (
            calm(VIEWER_COPY.unavailable)
          ))}
      </div>
    </div>
  );
}
