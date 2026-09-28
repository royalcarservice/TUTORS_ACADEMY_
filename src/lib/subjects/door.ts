/**
 * THE DOOR LOGIC (Phase 4 · Step 4, amendment) — ONE PLACE.
 * Moved here verbatim from `src/components/spine/scenes/enter.tsx` in 5.5 so
 * that server code (the enrolment predicate) can READ it; the scene re-exports
 * it unchanged. Behaviour is identical: a subject is enterable iff its config
 * status exists and is not "draft". Subject status is DESIGN CONFIGURATION,
 * not security (P5-R4); this file imports no config and knows no identity.
 */
export const isOpen = (e: { status?: string }) => !!e.status && e.status !== "draft";
