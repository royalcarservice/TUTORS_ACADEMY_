/**
 * SURFACE SYNC — Phase 7 · Step 4 (DEC-025).
 *
 * The collaborative academic surface speaks ONE serializable protocol,
 * defined here and carried by nothing yet. The brief places this file under
 * `src/lib/livekit/` because the session's data channel (LiveKit, per
 * docs/proposed/livekit_recon.md) is the intended carrier — but the protocol
 * itself is TRANSPORT-NEUTRAL by construction: a packet is plain JSON, the
 * bus is an interface, and the only bus that exists today is the in-memory
 * one. When the wiring step lands, it supplies a session bus; nothing in
 * this file changes.
 *
 * OPTIMISTIC, NEVER BLOCKING: an action applies locally FIRST, then the
 * packet is sent. The bus may echo it back — `applyPacket` is idempotent by
 * id, so the echo is a no-op, and a remote packet that already landed is a
 * no-op too. Drawing never waits on delivery.
 *
 * HONESTY RULES carried from the chamber:
 *   · packets carry COLOUR IDS ("ivory" | "slate" | "accent"), never hex —
 *     the subject resolves the token at draw time, so a packet drawn in
 *     Mathematics glows indigo and the same packet in Physics glows ember;
 *   · points are NORMALIZED (0..1) — the packet knows nothing about pixels,
 *     high-DPI displays or window sizes;
 *   · local mode (offline / unconfigured) is not a degraded mode — it is the
 *     same code path with an in-memory bus, and it is fully functional.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ── the packet (the brief's shape, exactly) ─────────────────────────────── */

export type SurfaceTool = "ink" | "line" | "erase";

export type StrokeColorId = "ivory" | "slate" | "accent";

/** Normalized: 0..1 of the surface box. Nothing about pixels travels. */
export interface SurfacePoint {
  x: number;
  y: number;
}

export interface StrokePacket {
  /** Unique per stroke; duplicate deliveries are no-ops. */
  id: string;
  tool: SurfaceTool;
  points: readonly SurfacePoint[];
  color: StrokeColorId;
  /** CSS pixels at reference scale — clamped, never negative, never huge. */
  width: number;
}

export type SurfacePacket =
  | { type: "stroke"; stroke: StrokePacket }
  /** `id` is this operation's own id (idempotence); `target` is the stroke removed. */
  | { type: "remove"; id: string; target: string }
  /** `id` is this operation's own id. */
  | { type: "clear"; id: string };

export interface SurfaceState {
  strokes: readonly StrokePacket[];
  /** Every packet id ever applied — idempotence survives replays across a clear. */
  seen: ReadonlySet<string>;
}

export function initialSurfaceState(): SurfaceState {
  return { strokes: [], seen: new Set() };
}

/* ── validation (a malformed packet is a named defect, never a throw) ────── */

const TOOLS: readonly SurfaceTool[] = ["ink", "line", "erase"];
const COLORS: readonly StrokeColorId[] = ["ivory", "slate", "accent"];

function isPoint(p: unknown): p is SurfacePoint {
  return (
    typeof p === "object" && p !== null &&
    typeof (p as SurfacePoint).x === "number" && Number.isFinite((p as SurfacePoint).x) &&
    typeof (p as SurfacePoint).y === "number" && Number.isFinite((p as SurfacePoint).y) &&
    (p as SurfacePoint).x >= -0.001 && (p as SurfacePoint).x <= 1.001 &&
    (p as SurfacePoint).y >= -0.001 && (p as SurfacePoint).y <= 1.001
  );
}

export type PacketVerdict = { ok: true; packet: SurfacePacket } | { ok: false; defect: string };

/** Decide whether an unknown value may enter the surface. Pure. */
export function validatePacket(value: unknown): PacketVerdict {
  if (typeof value !== "object" || value === null) return { ok: false, defect: "packet is not an object" };
  const p = value as Record<string, unknown>;
  if (p.type === "stroke") {
    const s = p.stroke as Record<string, unknown> | undefined;
    if (typeof s !== "object" || s === null) return { ok: false, defect: "stroke packet has no stroke" };
    if (typeof s.id !== "string" || s.id.length === 0) return { ok: false, defect: "stroke has no id" };
    if (typeof s.tool !== "string" || !TOOLS.includes(s.tool as SurfaceTool)) return { ok: false, defect: `stroke has no such tool: ${String(s.tool)}` };
    if (!Array.isArray(s.points) || s.points.length === 0) return { ok: false, defect: "stroke has no points" };
    for (const pt of s.points) if (!isPoint(pt)) return { ok: false, defect: "stroke has a malformed point" };
    if (typeof s.color !== "string" || !COLORS.includes(s.color as StrokeColorId)) return { ok: false, defect: `stroke has no such colour: ${String(s.color)}` };
    if (typeof s.width !== "number" || !Number.isFinite(s.width) || s.width <= 0 || s.width > 48) return { ok: false, defect: "stroke width is out of bounds" };
    return {
      ok: true,
      packet: { type: "stroke", stroke: { id: s.id, tool: s.tool as SurfaceTool, points: (s.points as SurfacePoint[]).map((q) => ({ x: Math.min(1, Math.max(0, q.x)), y: Math.min(1, Math.max(0, q.y)) })), color: s.color as StrokeColorId, width: s.width } },
    };
  }
  if (p.type === "remove") {
    if (typeof p.id !== "string" || p.id.length === 0) return { ok: false, defect: "remove packet has no id" };
    if (typeof p.target !== "string" || p.target.length === 0) return { ok: false, defect: "remove packet has no target" };
    return { ok: true, packet: { type: "remove", id: p.id, target: p.target } };
  }
  if (p.type === "clear") {
    if (typeof p.id !== "string" || p.id.length === 0) return { ok: false, defect: "clear packet has no id" };
    return { ok: true, packet: { type: "clear", id: p.id } };
  }
  return { ok: false, defect: `packet has no such type: ${String(p.type)}` };
}

/* ── the reducer (pure, idempotent, deterministic) ───────────────────────── */

/** One packet, one state. Duplicate ids are no-ops; the order is arrival order. */
export function applyPacket(state: SurfaceState, packet: SurfacePacket): SurfaceState {
  if (packet.type === "stroke") {
    if (state.seen.has(packet.stroke.id)) return state;           // idempotence: the echo lands nothing twice
    const seen = new Set(state.seen); seen.add(packet.stroke.id);
    return { strokes: [...state.strokes, packet.stroke], seen };
  }
  if (packet.type === "remove") {
    if (state.seen.has(packet.id)) return state;                   // the OPERATION's id is the replay guard
    const seen = new Set(state.seen); seen.add(packet.id);
    return { strokes: state.strokes.filter((s) => s.id !== packet.target), seen };
  }
  // clear
  if (state.seen.has(packet.id)) return state;
  const seen = new Set(state.seen); seen.add(packet.id);
  return { strokes: [], seen };
}

/* ── the eraser's question (pure geometry) ───────────────────────────────── */

function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** The ids of every stroke the eraser touches at `point` (normalized radius). */
export function hitTest(state: SurfaceState, point: SurfacePoint, radius: number): string[] {
  const hit: string[] = [];
  for (const s of state.strokes) {
    if (s.points.length === 1) {
      const p = s.points[0];
      if (Math.hypot(point.x - p.x, point.y - p.y) <= radius) hit.push(s.id);
      continue;
    }
    for (let i = 0; i < s.points.length - 1; i++) {
      const a = s.points[i], b = s.points[i + 1];
      if (segmentDistance(point.x, point.y, a.x, a.y, b.x, b.y) <= radius) {
        hit.push(s.id);
        break;
      }
    }
  }
  return hit;
}

/* ── serialization (what crosses a wire is exactly this, nothing more) ───── */

export function encodePacket(packet: SurfacePacket): string {
  return JSON.stringify(packet);
}

export function decodePacket(json: string): PacketVerdict {
  try {
    return validatePacket(JSON.parse(json));
  } catch {
    return { ok: false, defect: "packet is not valid JSON" };
  }
}

/** Packet ids come from the caller's entropy — the protocol never reads a clock. */
export function newPacketId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `pkt-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

/* ── the bus (an interface; today, one implementation) ───────────────────── */

export interface SurfaceBus {
  /** Deliver a packet to every subscriber — the sender included. */
  send: (packet: SurfacePacket) => void;
  /** Returns the unsubscribe. */
  subscribe: (receive: (packet: SurfacePacket) => void) => () => void;
}

/**
 * THE IN-MEMORY BUS — the brief's "in-memory mock broadcast", named plainly.
 * Delivery is synchronous and total: everyone subscribed hears every packet,
 * sender first among equals. This is the whole transport while no session
 * exists; the wiring step supplies a session bus with the same shape.
 */
export function createMemoryBus(): SurfaceBus {
  const subs = new Set<(packet: SurfacePacket) => void>();
  return {
    send(packet) {
      for (const fn of subs) fn(packet);
    },
    subscribe(receive) {
      subs.add(receive);
      return () => { subs.delete(receive); };
    },
  };
}

/* ── the hook ────────────────────────────────────────────────────────────── */

export interface SurfaceSync {
  state: SurfaceState;
  /** Optimistic: applies locally, THEN sends. Never throws, never blocks. */
  act: (packet: SurfacePacket) => void;
}

/**
 * The surface's one connection to its bus. With no bus argument it uses a
 * private in-memory one — LOCAL WORKING MODE, fully functional, the honest
 * state of the product until a session transport is wired (DEC-023/025).
 */
export function useSurfaceSync(bus?: SurfaceBus): SurfaceSync {
  const ownBus = useRef<SurfaceBus | null>(null);
  if (!bus && ownBus.current === null) ownBus.current = createMemoryBus();
  const activeBus = bus ?? ownBus.current!;
  const [state, setState] = useState<SurfaceState>(initialSurfaceState);

  useEffect(() => {
    const off = activeBus.subscribe((packet) => {
      const verdict = validatePacket(packet);
      if (!verdict.ok) {
        console.warn(JSON.stringify({ scope: "surface:sync", defect: verdict.defect }));
        return;
      }
      setState((s) => applyPacket(s, verdict.packet));
    });
    return off;
  }, [activeBus]);

  const act = useCallback((packet: SurfacePacket) => {
    const verdict = validatePacket(packet);
    if (!verdict.ok) {
      console.warn(JSON.stringify({ scope: "surface:sync", defect: verdict.defect }));
      return;
    }
    setState((s) => applyPacket(s, verdict.packet));   // optimistic — drawing never waits
    activeBus.send(verdict.packet);
  }, [activeBus]);

  return { state, act };
}
