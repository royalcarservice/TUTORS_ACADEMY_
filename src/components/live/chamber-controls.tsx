/* ════════════════════════════════════════════════════════════════════════
   CHAMBER CONTROLS — Phase 7 · Milestone 3 (DEC-026)

   The brief names the chamber's control cluster "chamber-controls"; the
   working implementation has stood since Phase 7 · Step 3 as LiveControls —
   the same four controls, the same calm labels (Mute/Unmute, Camera On/Off,
   Share Surface, Leave Chamber), built on the Phase 2 Button primitives,
   with zero emojis and zero engagement counters. One implementation, two
   names: this file is the bridge, so nothing that speaks the brief's name
   and nothing that speaks the implementation's name can drift apart.
   ════════════════════════════════════════════════════════════════════════ */

export { LiveControls, LiveControls as ChamberControls } from "./live-controls";
export type { LiveControlsProps, LiveControlsProps as ChamberControlsProps } from "./live-controls";
