"use client";

/* ════════════════════════════════════════════════════════════════════════
   ROOM PARTICIPANT — Phase 7 · Step 3 (DEC-024)

   THE CLIENT ISLAND of the live chamber — and the only interactive media
   surface the product has. It owns the participant's OWN media lifecycle:

     · PRIVACY IS THE INITIAL STATE. Nothing is requested on load: the first
       render holds zero streams. Capture begins only inside a click handler
       the participant chose (Mute/Unmute, Camera Off/On, Share Surface).
     · WHAT IS CAPTURED IS LOCAL. Until the transport is wired (DEC-023's
       seam), nothing leaves the device — the rehearsal surface says so in
       its own caption, and this file contains no send path to contradict it.
     · ZERO SURVEILLANCE. No timer, no dwell count, no persistence, no
       attendance signal. The speaking level is a transient boolean on the
       participant's own opted-in microphone: computed in the tab, shown as
       a glow, forgotten on the next frame (media-state.ts, DEC-024).
     · STATE LANGUAGE. A browser denial renders the brief's calm sentence in
       running type beside the controls (aria-live, no banner, no red, no
       exclamation). The product is never the accuser. A device that does
       not exist gets its own true sentence; retrying stays possible (a
       camera may be plugged in), so the control is never disabled for it.
     · LEAVE CHAMBER stops every track, closes the audio context and returns
       to the environment — departure is an action with a real ending.

   Accessibility: every control is a real button (Tab / Enter / Space),
   toggles announce aria-pressed, the state sentence is aria-describedby by
   the controls, and the glow's only motion obeys the reduced-motion
   contract (globals.css).
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { LiveControls } from "@/components/live/live-controls";
import { ParticipantDock } from "@/components/live/participant-dock";
import { ParticipantTile } from "@/components/live/participant-tile";
import {
  blockForError,
  constraintsFor,
  initialMediaFlags,
  MEDIA_STATE_SENTENCE,
  monogramFor,
  nextMediaFlags,
  participantLabel,
  speakingNext,
  type MediaBlock,
  type MediaFlags,
} from "@/lib/live/media-state";

function stopStream(stream: MediaStream | null) {
  if (!stream) return;
  for (const track of stream.getTracks()) track.stop();
}

export function RoomParticipant({
  subjectId,
  displayName,
  role,
  rehearsal = false,
}: {
  subjectId: string;
  displayName: string;
  role: "student" | "tutor";
  /** The rehearsal surface names itself; the production room does not need to. */
  rehearsal?: boolean;
}) {
  const router = useRouter();
  const [flags, setFlags] = useState<MediaFlags>(initialMediaFlags);
  const [block, setBlock] = useState<MediaBlock>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [shareStream, setShareStream] = useState<MediaStream | null>(null);
  const [speaking, setSpeaking] = useState(false);

  /* Refs mirror the streams so departure and unmount can always reach them. */
  const localRef = useRef<MediaStream | null>(null);
  const shareRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const speakingRef = useRef(false);

  const label = participantLabel(displayName, role);
  const monogram = monogramFor(displayName);

  const commitLocal = useCallback((stream: MediaStream | null) => {
    stopStream(localRef.current);
    localRef.current = stream;
    setLocalStream(stream);
  }, []);
  const commitShare = useCallback((stream: MediaStream | null) => {
    stopStream(shareRef.current);
    shareRef.current = stream;
    setShareStream(stream);
  }, []);

  /* ── the speaking glow: one boolean, hysteresis, rAF only while the mic
        is open. The level itself is never rendered, stored or sent. ────── */
  const stopLevelWatch = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    if (speakingRef.current) {
      speakingRef.current = false;
      setSpeaking(false);
    }
  }, []);

  const startLevelWatch = useCallback((stream: MediaStream) => {
    stopLevelWatch();
    if (stream.getAudioTracks().length === 0) return;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return; // the glow is an enhancement; its absence changes nothing
      const ctx = new Ctor();
      audioCtxRef.current = ctx;
      void ctx.resume().catch(() => undefined);
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      const loop = () => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
          const v = (samples[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / samples.length);
        const next = speakingNext(rms, speakingRef.current);
        if (next !== speakingRef.current) {
          speakingRef.current = next;
          setSpeaking(next);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      /* no glow — the session is unchanged */
    }
  }, [stopLevelWatch]);

  /* ── CAMERA / MICROPHONE — one stream for both, re-requested on change.
        A failed request rolls back ONLY the control that was just turned,
        states the block calmly, and leaves retrying open. ───────────────── */
  const requestLocal = useCallback(async (next: MediaFlags, attempted: "mic" | "camera") => {
    const constraints = constraintsFor(next);
    if (!constraints) {
      stopLevelWatch();
      commitLocal(null);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setBlock({ kind: "unavailable" });
      setFlags((f) => nextMediaFlags(f, { type: attempted, on: false }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setBlock(null);
      commitLocal(stream);
      if (constraints.audio) startLevelWatch(stream);
      else stopLevelWatch();
    } catch (err) {
      const b = blockForError(err instanceof DOMException ? err.name : "denied");
      console.warn(JSON.stringify({ scope: "live:media", errorClass: b.kind === "denied" ? "MediaDenied" : "MediaUnavailable" }));
      setBlock(b);
      setFlags((f) => nextMediaFlags(f, { type: attempted, on: false }));
      stopLevelWatch();
      commitLocal(null);
    }
  }, [commitLocal, startLevelWatch, stopLevelWatch]);

  const onMic = useCallback((on: boolean) => {
    const next = nextMediaFlags(flags, { type: "mic", on });
    setFlags(next);
    void requestLocal(next, "mic");
  }, [flags, requestLocal]);

  const onCamera = useCallback((on: boolean) => {
    const next = nextMediaFlags(flags, { type: "camera", on });
    setFlags(next);
    void requestLocal(next, "camera");
  }, [flags, requestLocal]);

  /* ── SHARED SURFACE — its own stream; the browser's own stop ends it ──── */
  const onShare = useCallback(async (on: boolean) => {
    if (!on) {
      commitShare(null);
      setFlags((f) => nextMediaFlags(f, { type: "share", on: false }));
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setBlock({ kind: "unavailable" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setBlock(null);
      commitShare(stream);
      setFlags((f) => nextMediaFlags(f, { type: "share", on: true }));
      const track = stream.getVideoTracks()[0];
      if (track) track.onended = () => {
        commitShare(null);
        setFlags((f) => nextMediaFlags(f, { type: "share", on: false }));
      };
    } catch (err) {
      const b = blockForError(err instanceof DOMException ? err.name : "denied");
      console.warn(JSON.stringify({ scope: "live:share", errorClass: b.kind === "denied" ? "ShareDenied" : "ShareUnavailable" }));
      setBlock(b);
    }
  }, [commitShare]);

  /* ── LEAVE CHAMBER — every track stops; the environment is the way back ── */
  const onLeave = useCallback(() => {
    stopLevelWatch();
    commitLocal(null);
    commitShare(null);
    setFlags(initialMediaFlags());
    router.push(`/subjects/${subjectId}`);
  }, [commitLocal, commitShare, router, stopLevelWatch, subjectId]);

  /* Unmount is a departure too: nothing keeps running after the surface goes. */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => undefined);
      stopStream(localRef.current);
      localRef.current = null;
      stopStream(shareRef.current);
      shareRef.current = null;
    };
  }, []);

  const visibleStream = shareStream ?? (flags.camera ? localStream : null);

  return (
    <section data-room-participant aria-label="Your place in the chamber" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-4)" }}>
      {rehearsal && (
        <p style={{ margin: 0, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" }}>
          Rehearsal — what you capture stays on this device
        </p>
      )}

      {/* One tile: the participant's own, standing in the dock (Milestone 3).
          Remote participants are facts the transport will bring; until then
          the dock does not invent them. */}
      <ParticipantDock>
        <ParticipantTile label={label} stream={visibleStream} monogram={monogram} speaking={speaking && flags.mic} sharing={shareStream !== null} />
      </ParticipantDock>

      <LiveControls flags={flags} onMic={onMic} onCamera={onCamera} onShare={onShare} onLeave={onLeave} stateSentenceId={block ? "live-media-state" : undefined} />

      {/* STATE LANGUAGE, action scope: one sentence in the running type,
          announced politely, no banner, no red, no exclamation. */}
      <p id="live-media-state" aria-live="polite" style={{ margin: 0, fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "42em", minHeight: "1em" }}>
        {block?.kind === "denied" ? MEDIA_STATE_SENTENCE.denied : block?.kind === "unavailable" ? MEDIA_STATE_SENTENCE.unavailable : ""}
      </p>
    </section>
  );
}
