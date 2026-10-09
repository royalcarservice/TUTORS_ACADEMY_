/* ════════════════════════════════════════════════════════════════════════
   CLASSROOM SIGNALING — Phase 7 · Step 6 (DEC-028)

   The wire vocabulary of the live chamber: what one participant's client
   may say to another's, and nothing else. PURE — no I/O, no clock reads,
   no React. The transport (./transport.ts) carries these; the hook
   (./use-classroom-session.ts) speaks them.

   THREE KINDS, exactly the brief's:

   · PRESENCE_UPDATE — a participant names themselves: id, role, whether
     their OWN opted-in microphone says they are speaking, whether their
     camera is open. Presence is an explicit act — nothing here measures
     focus, tabs, keystrokes or gaze; ZERO TELEMETRY BY CONSTRUCTION.
   · CANVAS_STROKE — the shared surface's traffic. NOT a second stroke
     vocabulary: the payload IS the adjudicated SurfacePacket of
     src/lib/livekit/surface-sync.ts (DEC-025) — the brief's `strokeId`
     maps to the packet's `id`, as DEC-028 records. One protocol, one
     validator, everywhere.
   · STAGE_STATE — the session's lifecycle word: standby · active ·
     settling · concluded (the brief's vocabulary), mapped to the state
     machine's words (STANDBY · ACTIVE · SETTLING · CONCLUDED) by pure
     functions below — never a third vocabulary.

   SUBJECT ISOLATION — every signal is addressed to a room:
   `{subject}:{session}`. A receiver validates the address before it
   listens; a signal from another room is a defect, dropped, never
   delivered. Cross-room leakage is not a bug this protocol can express.

   THE BANDWIDTH BUDGET — an encoded signal over 16 KB is REJECTED with a
   named defect. Not chunked: strokes are per-gesture and small, and a
   chunking scheme would pre-solve a problem no transport has measured;
   the day a real bus needs chunking is a ruling, not a guess (DEC-028).
   ════════════════════════════════════════════════════════════════════════ */

import {
  validatePacket,
  type SurfacePacket,
} from "@/lib/livekit/surface-sync";

import type { ChamberState } from "./state-machine";

/* ── the three kinds ─────────────────────────────────────────────────────── */

export const SIGNAL_KINDS = ["PRESENCE_UPDATE", "CANVAS_STROKE", "STAGE_STATE"] as const;
export type SignalKind = (typeof SIGNAL_KINDS)[number];

export type PresenceRole = "student" | "tutor";

/** A participant naming themselves — an explicit act, never an inference. */
export interface PresenceUpdate {
  participantId: string;
  role: PresenceRole;
  /** The participant's OWN opted-in microphone says they are speaking. */
  isSpeaking: boolean;
  /** The participant's camera is open (their own act, Step 3's opt-in). */
  hasVideo: boolean;
}

/** The session's lifecycle word — the brief's vocabulary, lowercase. */
export type StageStateId = "standby" | "active" | "settling" | "concluded";

export const STAGE_STATES: readonly StageStateId[] = ["standby", "active", "settling", "concluded"];

export interface StageStateMessage {
  state: StageStateId;
  /** Optional: who the room currently hears. Never inferred — never guessed. */
  activeSpeakerId?: string;
}

/** The envelope every signal travels in. */
export interface ClassroomSignal {
  v: 1;
  kind: SignalKind;
  /** `{subject}:{session}` — the room this signal is addressed to. */
  room: string;
  /** ISO instant the sender spoke. */
  at: string;
  payload: PresenceUpdate | SurfacePacket | StageStateMessage;
}

/* ── the room address ────────────────────────────────────────────────────── */

/** The room's name: subject + session, inseparable. */
export function roomNameFor(subjectId: string, sessionId: string): string {
  return `${subjectId}:${sessionId}`;
}

/* ── the bandwidth budget ────────────────────────────────────────────────── */

/** 16 KB — the brief's ceiling on one encoded signal. */
export const SIGNAL_BYTE_BUDGET = 16 * 1024;

const encoder = new TextEncoder();

/** The wire form of a signal — compact JSON over the adjudicated packets. */
export function encodeSignal(signal: ClassroomSignal): string {
  return JSON.stringify(signal);
}

/** Byte length of the encoded signal — what the budget measures. */
export function encodedLength(signal: ClassroomSignal): number {
  return encoder.encode(encodeSignal(signal)).length;
}

/* ── validation ──────────────────────────────────────────────────────────── */

export type SignalVerdict =
  | { ok: true; signal: ClassroomSignal }
  | { ok: false; defect: string };

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validatePresence(value: unknown): PresenceUpdate | null {
  if (!isRecord(value)) return null;
  if (typeof value.participantId !== "string" || value.participantId.length === 0) return null;
  if (value.role !== "student" && value.role !== "tutor") return null;
  if (typeof value.isSpeaking !== "boolean") return null;
  if (typeof value.hasVideo !== "boolean") return null;
  return { participantId: value.participantId, role: value.role, isSpeaking: value.isSpeaking, hasVideo: value.hasVideo };
}

function validateStage(value: unknown): StageStateMessage | null {
  if (!isRecord(value)) return null;
  if (typeof value.state !== "string" || !STAGE_STATES.includes(value.state as StageStateId)) return null;
  const msg: StageStateMessage = { state: value.state as StageStateId };
  if (value.activeSpeakerId !== undefined) {
    if (typeof value.activeSpeakerId !== "string" || value.activeSpeakerId.length === 0) return null;
    msg.activeSpeakerId = value.activeSpeakerId;
  }
  return msg;
}

/**
 * Validates an incoming signal FOR ONE ROOM: the envelope, the address, the
 * instant, and the payload its kind names. Anything malformed — or addressed
 * elsewhere — is a named defect and nothing more.
 */
export function validateSignal(value: unknown, expectedRoom: string): SignalVerdict {
  if (!isRecord(value)) return { ok: false, defect: "signal-not-an-object" };
  if (value.v !== 1) return { ok: false, defect: "signal-version" };
  if (typeof value.kind !== "string" || !SIGNAL_KINDS.includes(value.kind as SignalKind)) {
    return { ok: false, defect: "signal-kind" };
  }
  if (typeof value.room !== "string") return { ok: false, defect: "signal-room" };
  if (value.room !== expectedRoom) return { ok: false, defect: "wrong-room" };   // isolation, enforced at the door
  if (typeof value.at !== "string" || !ISO.test(value.at) || !Number.isFinite(Date.parse(value.at))) {
    return { ok: false, defect: "signal-at" };
  }
  const kind = value.kind as SignalKind;

  if (kind === "PRESENCE_UPDATE") {
    const presence = validatePresence(value.payload);
    if (!presence) return { ok: false, defect: "presence-payload" };
    const signal: ClassroomSignal = { v: 1, kind, room: value.room, at: value.at, payload: presence };
    return budgetOr(signal);
  }

  if (kind === "CANVAS_STROKE") {
    /* The adjudicated packet validator — never a second opinion. */
    const verdict = validatePacket(value.payload);
    if (!verdict.ok) return { ok: false, defect: verdict.defect };
    const signal: ClassroomSignal = { v: 1, kind, room: value.room, at: value.at, payload: verdict.packet };
    return budgetOr(signal);
  }

  const stage = validateStage(value.payload);
  if (!stage) return { ok: false, defect: "stage-payload" };
  const signal: ClassroomSignal = { v: 1, kind, room: value.room, at: value.at, payload: stage };
  return budgetOr(signal);
}

function budgetOr(signal: ClassroomSignal): SignalVerdict {
  if (encodedLength(signal) > SIGNAL_BYTE_BUDGET) return { ok: false, defect: "payload-too-large" };
  return { ok: true, signal };
}

/* ── the vocabulary bridge — stage words ↔ chamber words ─────────────────── */

const STAGE_TO_CHAMBER: Readonly<Record<StageStateId, ChamberState>> = {
  standby: "STANDBY",
  active: "ACTIVE",
  settling: "SETTLING",
  concluded: "CONCLUDED",
};

const CHAMBER_TO_STAGE: Readonly<Record<ChamberState, StageStateId>> = {
  STANDBY: "standby",
  ACTIVE: "active",
  SETTLING: "settling",
  CONCLUDED: "concluded",
};

/** The machine's word, in the wire's vocabulary. */
export function stageStateOf(chamber: ChamberState): StageStateId {
  return CHAMBER_TO_STAGE[chamber];
}

/** The wire's vocabulary, in the machine's words. */
export function chamberOfStage(state: StageStateId): ChamberState {
  return STAGE_TO_CHAMBER[state];
}
