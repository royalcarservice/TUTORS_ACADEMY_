"use client";

/* ════════════════════════════════════════════════════════════════════════
   THE ARTIFACT OPENER — Phase 8 · Step 3 (DEC-031)

   The ONLY client bridge on the shelf: the card stays server-rendered HTML
   and tokens; this small island gives the reader the handle that lifts an
   artifact into the viewer. It owns exactly three things — the open state,
   the drawer's mount, and focus: when the drawer closes, focus returns to
   the very button that opened it, so the departure is as seamless as the
   arrival.

   The bytes are NEVER fetched at shelf time. They are signed and fetched
   only when the reader reaches (the openArtifact seam) — the signed-URL
   window opens at the moment of inspection and not before.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";

import { ArtifactViewer, type ViewerArtifact, type ViewerRehearsal, type ViewerSession, type ViewerSubject } from "./artifact-viewer";

/** The opener's word — one constant, so every card speaks alike. */
export const OPENER_COPY = {
  inspect: "Inspect",
  inspectLabel: (word: string) => `Inspect the ${word}`,
} as const;

export interface ArtifactOpenerProps {
  artifact: ViewerArtifact;
  session: ViewerSession;
  subject: ViewerSubject;
  /** Dev rehearsal only — see the viewer's ViewerRehearsal (DEC-031). */
  rehearsal?: ViewerRehearsal;
}

export function ArtifactOpener({ artifact, session, subject, rehearsal }: ArtifactOpenerProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  /* SEAMLESS DEPARTURE — focus goes back to the handle that opened the drawer. */
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      btnRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-artifact-inspect
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        aria-label={OPENER_COPY.inspectLabel(artifact.word)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: "var(--ta-target-primary)",
          padding: "var(--ta-space-2) 0",
          border: "none",
          background: "transparent",
          fontFamily: "var(--ta-font-mono)",
          fontSize: "var(--ta-text-2xs)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ta-text-primary)",
          textDecoration: "underline",
          textUnderlineOffset: "0.2em",
          cursor: "pointer",
        }}
      >
        {OPENER_COPY.inspect}
      </button>
      {open && <ArtifactViewer artifact={artifact} session={session} subject={subject} onClose={close} rehearsal={rehearsal} />}
    </>
  );
}
