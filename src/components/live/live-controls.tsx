"use client";

/* ════════════════════════════════════════════════════════════════════════
   LIVE CONTROLS — Phase 7 · Step 3 (DEC-024)

   The restrained control cluster of the chamber: microphone, camera, shared
   surface, departure. Four controls and no fifth — no raise-hand counter, no
   attention score, no reaction launcher (the pedagogical-calm rule). Every
   control is a REAL button (keyboard: Tab, Enter, Space) over the Phase 2
   Button primitive; toggles carry aria-pressed; vocabulary is calm and
   dignified in every label, tooltip and screen-reader string.

   The controls own NO state: the island (room-participant.tsx) holds the
   flags and hands down the truth plus the handlers. A disabled control is
   not rendered disabled — nothing here is unavailable; what changes is the
   sentence beside the cluster (STATE_LANGUAGE, action scope).
   ════════════════════════════════════════════════════════════════════════ */

import { Button } from "@/components/ui";

import type { MediaFlags } from "@/lib/live/media-state";

export interface LiveControlsProps {
  flags: MediaFlags;
  onMic: (on: boolean) => void;
  onCamera: (on: boolean) => void;
  onShare: (on: boolean) => void;
  onLeave: () => void;
  /** The id of the state sentence beside the cluster, when one is showing. */
  stateSentenceId?: string;
}

export function LiveControls({ flags, onMic, onCamera, onShare, onLeave, stateSentenceId }: LiveControlsProps) {
  return (
    <div
      data-live-controls
      role="group"
      aria-label="Session controls"
      style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-3)", alignItems: "center" }}
    >
      <Button
        variant="secondary"
        aria-pressed={flags.mic}
        aria-label={flags.mic ? "Microphone is on. Activate to mute." : "Microphone is muted. Activate to unmute."}
        aria-describedby={stateSentenceId}
        title={flags.mic ? "Quiet your microphone" : "Open your microphone"}
        onClick={() => onMic(!flags.mic)}
      >
        {flags.mic ? "Mute" : "Unmute"}
      </Button>

      <Button
        variant="secondary"
        aria-pressed={flags.camera}
        aria-label={flags.camera ? "Camera is on. Activate to close it." : "Camera is off. Activate to open it."}
        aria-describedby={stateSentenceId}
        title={flags.camera ? "Close your camera" : "Open your camera"}
        onClick={() => onCamera(!flags.camera)}
        /* A missing device is a state, not a lockout: the control stays
           activatable (a camera may be plugged in), and the sentence beside
           the cluster says what is true. Nothing here is ever "disabled". */
      >
        {flags.camera ? "Camera On" : "Camera Off"}
      </Button>

      <Button
        variant="secondary"
        aria-pressed={flags.share}
        aria-label={flags.share ? "Surface is shared. Activate to stop sharing." : "Activate to share your surface."}
        aria-describedby={stateSentenceId}
        title={flags.share ? "Stop sharing your surface" : "Share your surface"}
        onClick={() => onShare(!flags.share)}
      >
        {flags.share ? "Stop Sharing" : "Share Surface"}
      </Button>

      <Button
        variant="danger"
        aria-label="Leave the chamber and return to the environment"
        title="Leave the chamber"
        onClick={onLeave}
      >
        Leave Chamber
      </Button>
    </div>
  );
}
