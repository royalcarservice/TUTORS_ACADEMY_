"use client";

/* ════════════════════════════════════════════════════════════════════════
   THE CLASSROOM SESSION HOOK — Phase 7 · Step 6 (DEC-028)

   The one place a participant stands in the room's communication layer.
   Everything the brief's channels ask for, and nothing else:

   · PRESENCE — the local participant names themselves (role, own opted-in
     mic saying they speak, own camera open) and hears everyone the room
     knows. Presence is an explicit act: nothing here measures focus, tabs,
     keystrokes or gaze — ZERO TELEMETRY BY CONSTRUCTION.
   · AUDIO STATE — the island reports its own mute/speaking facts upward;
     the hook carries them as PRESENCE_UPDATE signals on the room channel.
   · THE CANVAS CHANNEL — the hook owns the room's SurfaceBus and hands it
     to the academic surface; in local mode the bus IS the channel (the
     adjudicated memory bus, DEC-025), and the CANVAS_STROKE wire form in
     ./types.ts is what a real transport will carry (the seam adapts the
     two; the packet's id makes replays no-ops either way).
   · STAGE — the session's lifecycle word rides STAGE_STATE; the tutor (and
     only the tutor) may speak it: active ↔ concluded. In local mode that
     is the whole lifecycle, exercisable without a transport; the moment a
     concluded signal lands the workspace closes — nothing of the session
     lingers (Step 5's confidentiality, carried by the channel).

   RESILIENCE, as briefed: unconfigured, offline, or dropped, the room
   works locally — the memory provider IS the fallback, not a degraded
   copy of it. No modal, no alert loop; a failed signal is a named defect
   the caller may log, never an exception the participant sees.

   THE LIVEKIT SEAM — DEC-023 stands: no livekit-client dependency, no
   speculative wiring. chooseTransport reads readiness the day a carrier is
   ruled and testable; until then "memory" is the honest mode, and this
   hook's shape is what the wired carrier will drive.

   HYDRATION — every initial value is derived synchronously from the facts
   the server page passes (subject, session, role, stage). The first client
   render IS the server render; effects subscribe after mount and cleanup
   unsubscribes completely — no zombie listeners behind an unmounted room.
   ════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createMemoryBus,
  type SurfaceBus,
} from "@/lib/livekit/surface-sync";
import { CHAMBER_STATE_WORD } from "@/lib/classroom/state-machine";

import { chooseTransport, type ClassroomTransport } from "./transport";
import {
  chamberOfStage,
  roomNameFor,
  type PresenceUpdate,
  type StageStateId,
  type StageStateMessage,
} from "./types";

export interface ClassroomSessionInput {
  subjectId: string;
  /** The session-of-record's id; null keeps the hook standing outside the room (no channel). */
  sessionId: string | null;
  role: "student" | "tutor";
  /** The server-named stage — the zero-mismatch seed for the banner. */
  initialStage: StageStateId;
  /** The transport's readiness fact (env NAMES only, never values). */
  configured: boolean;
}

export interface ClassroomSession {
  /** none = no session named; memory = the local working mode. */
  mode: "none" | ClassroomTransport["mode"];
  /** The session's lifecycle word on the wire. */
  stage: StageStateId;
  /** The word the banner speaks — machine vocabulary, derived. */
  stageWord: string;
  /** Everyone the channel knows — the local participant, and whoever the
   *  transport delivers. No one is invented: an empty room says nothing. */
  participants: readonly PresenceUpdate[];
  /** The room's canvas channel — hand it to the academic surface. */
  bus: SurfaceBus;
  /** True once a concluded signal has landed: the workspace must close. */
  concluded: boolean;
  /** TUTOR ONLY — the lifecycle word is the tutor's to speak. */
  setStage: (next: "active" | "concluded") => void;
  /** The island's own audio facts, carried as presence on the channel. */
  updateLocalPresence: (p: { isSpeaking: boolean; hasVideo: boolean }) => void;
}

/** The room is a fact the transport needs once and keeps. */
function useTransport(subjectId: string, sessionId: string | null, configured: boolean): ClassroomTransport | null {
  return useMemo(() => {
    if (!sessionId) return null;
    return chooseTransport(roomNameFor(subjectId, sessionId), { configured, missing: [] });
  }, [subjectId, sessionId, configured]);
}

export function useClassroomSession(input: ClassroomSessionInput): ClassroomSession {
  const { subjectId, sessionId, role, initialStage, configured } = input;
  const transport = useTransport(subjectId, sessionId, configured);

  /* The local participant is the one fact this client can vouch for. The id
     is the role itself — in local mode there is exactly one participant per
     client, and a real carrier will bring real identities (DEC-028). */
  const localPresence = useMemo<PresenceUpdate>(
    () => ({ participantId: role, role, isSpeaking: false, hasVideo: false }),
    [role],
  );

  const [stage, setStageState] = useState<StageStateId>(initialStage);
  const [participants, setParticipants] = useState<readonly PresenceUpdate[]>(() =>
    transport ? [localPresence] : [],
  );

  /* The room's canvas channel. Owned here, shared with the surface: strokes
     ride the bus in local mode; a wired carrier adapts the bus to
     CANVAS_STROKE signals at the seam (idempotent either way). */
  const busRef = useRef<SurfaceBus | null>(null);
  if (busRef.current === null) busRef.current = createMemoryBus();
  const bus = busRef.current;

  /* Keep the latest local presence in a ref so the channel callback stays
     stable across renders (no re-subscription churn). */
  const localRef = useRef(localPresence);
  localRef.current = localPresence;

  /* ── the channel: hear the room, and only the room ─────────────────────── */
  useEffect(() => {
    if (!transport) return;
    const unsubscribe = transport.subscribe((signal) => {
      if (signal.kind === "PRESENCE_UPDATE") {
        const presence = signal.payload as PresenceUpdate;
        setParticipants((prev) => {
          const rest = prev.filter((p) => p.participantId !== presence.participantId);
          return [...rest, presence];
        });
      } else if (signal.kind === "STAGE_STATE") {
        const msg = signal.payload as StageStateMessage;
        setStageState(msg.state);
      }
      /* CANVAS_STROKE rides the bus in local mode (DEC-028); a wired
         carrier delivers it here and applies it to the bus at the seam. */
    });
    return unsubscribe;   // departure is real: no zombie ears
  }, [transport]);

  /* ── speaking ───────────────────────────────────────────────────────────── */

  const setStage = useCallback(
    (next: "active" | "concluded") => {
      if (!transport || role !== "tutor") return;   // the lifecycle word is the tutor's
      const at = new Date().toISOString();
      transport.signal({
        v: 1,
        kind: "STAGE_STATE",
        room: transport.room,
        at,
        payload: { state: next },
      });
    },
    [transport, role],
  );

  const updateLocalPresence = useCallback(
    (p: { isSpeaking: boolean; hasVideo: boolean }) => {
      const current = localRef.current;
      if (current.isSpeaking === p.isSpeaking && current.hasVideo === p.hasVideo) return; // nothing changed: say nothing
      const next: PresenceUpdate = { ...current, isSpeaking: p.isSpeaking, hasVideo: p.hasVideo };
      localRef.current = next;
      setParticipants((prev) => {
        const rest = prev.filter((q) => q.participantId !== next.participantId);
        return [...rest, next];
      });
      if (!transport) return;
      transport.signal({ v: 1, kind: "PRESENCE_UPDATE", room: transport.room, at: new Date().toISOString(), payload: next });
    },
    [transport],
  );

  return {
    mode: transport ? transport.mode : "none",
    stage,
    stageWord: CHAMBER_STATE_WORD[chamberOfStage(stage)],
    participants,
    bus,
    concluded: stage === "concluded",
    setStage,
    updateLocalPresence,
  };
}
