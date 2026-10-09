"use client";

/* ════════════════════════════════════════════════════════════════════════
   PARTICIPANT TILE — Phase 7 · Step 3 (DEC-024)

   One participant's place in the chamber. Renders the participant's own
   stream when one exists (camera or shared surface), else the dignified
   monogram. Speaking is shown as a SUBTLE SUBJECT-ACCENT GLOW — the muted
   token border the brief requires, never neon: the accent resolves from the
   [data-subject] scope above, so Mathematics glows indigo and Physics ember
   without this file knowing either colour.

   The label is the academic display name ("Dr. Vance (Tutor)") — no IP
   address, no device badge, no connection bar. Nothing about the person's
   machine is rendered, because none of it is the session's business.

   PRIVACY: the <video> is muted + playsInline (a preview of one's own
   capture; echoing it back would be a bug, autoplaying sound would be a
   rudeness). Streams are handed in by the island that owns them; this
   component requests nothing, captures nothing, calls nothing.
   ════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";

export function ParticipantTile({
  label,
  stream,
  monogram,
  speaking,
  sharing,
}: {
  /** The academic display name, already formatted. */
  label: string;
  /** The participant's own stream (camera or shared surface), or none. */
  stream: MediaStream | null;
  /** Camera-off fallback; empty when the name was empty. */
  monogram: string;
  /** True while the participant's own microphone level says they are speaking. */
  speaking: boolean;
  /** True when the stream is a shared surface, not a camera. */
  sharing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* Bind the stream imperatively — srcObject is not a React attribute. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.srcObject !== stream) el.srcObject = stream;
  }, [stream]);

  const hasVideo = stream !== null && stream.getVideoTracks().length > 0;

  return (
    <figure
      data-participant-tile
      data-speaking={speaking ? "true" : "false"}
      aria-label={`${label}${hasVideo ? (sharing ? ", sharing their surface" : ", camera on") : ", camera off"}`}
      style={{
        margin: 0,
        position: "relative",
        aspectRatio: "16 / 9",
        borderRadius: "var(--ta-radius-2)",
        overflow: "clip",
        background: "var(--ta-surface-sunken)",
        /* THE DISCIPLINED BORDER — quiet by default; the subject's accent,
           muted, while speaking. The transition exists only for readers who
           accept motion (the reduced-motion contract, below the component). */
        border: "1px solid color-mix(in srgb, var(--ta-accent-1) 22%, transparent)",
        boxShadow: speaking ? "0 0 0 2px color-mix(in srgb, var(--ta-accent-1) 55%, transparent)" : "none",
      }}
      className="ta-live-tile"
    >
      {hasVideo ? (
        <video ref={videoRef} autoPlay playsInline muted aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div aria-hidden="true" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span
            style={{
              fontFamily: "var(--ta-font-display)",
              fontSize: "var(--ta-display-sm)",
              fontWeight: 500,
              color: "color-mix(in srgb, var(--ta-accent-1) 80%, var(--ta-text-primary))",
              letterSpacing: "0.04em",
            }}
          >
            {monogram || "·"}
          </span>
        </div>
      )}

      {/* The label — clean type over a quiet scrim. Nothing else about the device. */}
      <figcaption
        style={{
          position: "absolute",
          left: "var(--ta-space-2)",
          bottom: "var(--ta-space-2)",
          padding: "var(--ta-space-1) var(--ta-space-2)",
          borderRadius: "var(--ta-radius-1)",
          background: "color-mix(in srgb, var(--ta-ink-950) 72%, transparent)",
          color: "var(--ta-text-inverse)",
          fontSize: "var(--ta-text-xs)",
          fontFamily: "var(--ta-font-body)",
        }}
      >
        {label}
      </figcaption>

      {/* The tile's only motion rule (the glow's transition) lives in
          globals.css under the reduced-motion contract — once, for all. */}
    </figure>
  );
}
