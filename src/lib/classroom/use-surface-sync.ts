/* ════════════════════════════════════════════════════════════════════════
   CLASSROOM SURFACE SYNC — Phase 7 · Milestone 4 (DEC-026)

   The brief places the shared-surface synchronisation hook at
   `src/lib/classroom/use-surface-sync.ts`; the working, tested protocol
   (stroke packets, validation, optimistic apply, memory-bus fallback) has
   stood since Phase 7 · Step 4 in `src/lib/livekit/surface-sync.ts`
   (DEC-025 recorded that placement). Transport-neutral by construction,
   it does not depend on LiveKit — the directory names where it was born,
   not what it needs.

   One implementation, two addresses: this file re-exports the protocol so
   classroom code can import from its canonical home without a second copy
   drifting into existence. The stroke shape is exactly the brief's:
   { id, tool, points, color, width } — with broadcast when a bus carries
   one, and a fully functional local fallback when it does not.
   ════════════════════════════════════════════════════════════════════════ */

export {
  useSurfaceSync,
  createMemoryBus,
  initialSurfaceState,
  validatePacket,
  applyPacket,
  hitTest,
  encodePacket,
  decodePacket,
  newPacketId,
} from "@/lib/livekit/surface-sync";

export type {
  SurfaceTool,
  StrokeColorId,
  SurfacePoint,
  StrokePacket,
  SurfacePacket,
  SurfaceState,
  SurfaceBus,
  SurfaceSync,
  PacketVerdict,
} from "@/lib/livekit/surface-sync";
