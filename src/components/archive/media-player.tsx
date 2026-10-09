"use client";

/* ════════════════════════════════════════════════════════════════════════
   THE MEDIA PLAYER — Phase 8 · Step 3 (DEC-031)

   The archive's restrained playback instrument: a native HTML5 element and
   NOTHING around it that a library would bring. Play / pause, one scrubber
   with the MM:SS clock, the three restrained speeds (1.0 · 1.25 · 1.5 — no
   chipmunk pitch beyond them), volume and mute. Every control is a real
   button or a real range input: keyboard-complete by construction.

   BANNED by test, absolutely: autoplay, up-next, related or recommended
   media, social embeds, share buttons, download counters. The player serves
   ONE artifact the viewer was handed by signed URL — nothing else to watch,
   nothing to be drawn toward.

   No timers of its own: the clock is the element's own `timeupdate` event;
   nothing ticks when nothing plays.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";

import { PLAYBACK_SPEEDS, formatTime, type PlaybackSpeed } from "@/lib/archive/replay";

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

const CONTROL: React.CSSProperties = {
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
};

export interface MediaPlayerProps {
  /** The signed URL the viewer was handed — the only source this player knows. */
  src: string;
  /** Chamber audio today; the element follows the artifact's own kind. */
  kind: "audio" | "video";
  /** Names the element for assistive reading. */
  title: string;
}

export function MediaPlayer({ src, kind, title }: MediaPlayerProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const el = () => ref.current;

  const toggle = useCallback(() => {
    const m = el();
    if (!m) return;
    if (m.paused) void m.play().catch(() => setPlaying(false));
    else m.pause();
  }, []);

  /* The clock is the element's own event — nothing ticks on a timer. */
  useEffect(() => {
    const m = el();
    if (!m) return;
    const onTime = () => setCurrent(m.currentTime);
    const onMeta = () => setDuration(Number.isFinite(m.duration) ? m.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    m.addEventListener("timeupdate", onTime);
    m.addEventListener("loadedmetadata", onMeta);
    m.addEventListener("durationchange", onMeta);
    m.addEventListener("play", onPlay);
    m.addEventListener("pause", onPause);
    return () => {
      m.removeEventListener("timeupdate", onTime);
      m.removeEventListener("loadedmetadata", onMeta);
      m.removeEventListener("durationchange", onMeta);
      m.removeEventListener("play", onPlay);
      m.removeEventListener("pause", onPause);
    };
  }, [src]);

  const seek = useCallback((value: number) => {
    const m = el();
    if (!m || !Number.isFinite(value)) return;
    m.currentTime = value;
    setCurrent(value);
  }, []);

  const chooseSpeed = useCallback((s: PlaybackSpeed) => {
    setSpeed(s);
    const m = el();
    if (m) m.playbackRate = s;
  }, []);

  const changeVolume = useCallback((v: number) => {
    const vv = Math.min(1, Math.max(0, v));
    setVolume(vv);
    const m = el();
    if (m) {
      m.volume = vv;
      m.muted = vv === 0;
    }
    setMuted(vv === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const m = el();
    if (!m) return;
    const next = !m.muted;
    m.muted = next;
    setMuted(next);
  }, []);

  const Media = kind === "video" ? "video" : "audio";

  return (
    <div data-media-player style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
      {/* No autoPlay, no controls, no preload beyond metadata: the element
          waits for the listener, plays nothing ahead, suggests nothing next. */}
      <Media
        ref={ref as never}
        src={src}
        preload="metadata"
        playsInline
        aria-label={title}
        style={kind === "video" ? { width: "100%", maxHeight: "24rem", background: "var(--ta-surface-sunken)", borderRadius: "var(--ta-radius-2)" } : { width: "100%" }}
      />

      {/* THE SCRUBBER — one range input, keyboard-complete by nature. */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-3)" }}>
        <p style={{ ...MONO, minWidth: "4.5rem", textAlign: "right" }} aria-hidden="true">{formatTime(current)}</p>
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0.001)}
          step={0.1}
          value={Math.min(current, Math.max(duration, 0.001))}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label={`Seek within ${title}`}
          style={{ flex: 1, accentColor: "var(--ta-accent-1)" }}
        />
        <p style={{ ...MONO, minWidth: "4.5rem" }} aria-hidden="true">{formatTime(duration)}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ta-space-3)" }}>
        {/* PLAY / PAUSE — one button, both words, no icon riddles. */}
        <button type="button" data-media-toggle onClick={toggle} aria-pressed={playing} style={CONTROL}>
          {playing ? "Pause" : "Play"}
        </button>

        {/* SPEED — the restrained three, declared with aria-pressed. */}
        <div role="group" aria-label="Playback speed" style={{ display: "inline-flex", gap: "var(--ta-space-1)" }}>
          {PLAYBACK_SPEEDS.map((s) => (
            <button key={s} type="button" data-media-speed={s} onClick={() => chooseSpeed(s)} aria-pressed={speed === s} style={{ ...CONTROL, minWidth: "auto", color: speed === s ? "var(--ta-accent-1)" : "var(--ta-text-secondary)" }}>
              {s.toFixed(2).replace(/0$/, "")}x
            </button>
          ))}
        </div>

        {/* VOLUME / MUTE — one slider, one toggle, nothing cartoonish. */}
        <button type="button" data-media-mute onClick={toggleMute} aria-pressed={muted} style={CONTROL}>
          {muted ? "Unmute" : "Mute"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          aria-label="Volume"
          style={{ width: "7rem", accentColor: "var(--ta-accent-1)" }}
        />
      </div>
    </div>
  );
}
