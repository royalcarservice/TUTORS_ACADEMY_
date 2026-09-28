/* ════════════════════════════════════════════════════════════════════════
   THE SCENE CONTRACT (Phase 4 · Step 1)

   Mirrors the 3.1 architecture: config is DATA with bounded enums, validated
   loudly, consumed by components ONLY through props/context (the guard test
   in scripts/check-subject-imports.mjs covers spine configs too).

   The spine is the story's architecture. Reordering the story never requires
   editing a component: order lives here, rendering is generic.
   ════════════════════════════════════════════════════════════════════════ */

export const NARRATIVE_FNS = [
  "arrive",
  "premise",
  "differentiate",
  "choose",
  "enter",
  "people",
  "practice",
  "promise",
  "return",
] as const;
export type NarrativeFn = (typeof NARRATIVE_FNS)[number];

export const SCENE_STATUSES = ["skeleton", "authored", "locked"] as const;
export type SceneStatus = (typeof SCENE_STATUSES)[number];

/** ONLY FOUR SCROLL BEHAVIOURS EXIST. No scene may invent a fifth. */
export const SCROLL_BEHAVIOURS = [
  "static",
  "reveal-once",
  "sticky-stage",
  "sequence",
] as const;
export type ScrollBehaviour = (typeof SCROLL_BEHAVIOURS)[number];

export const SUBJECT_MODES = ["neutral", "preview", "responsive", "active"] as const;
export type SubjectMode = (typeof SUBJECT_MODES)[number];

export const ACCENT_USE = ["none", "subtle", "forward"] as const;
export type AccentUse = (typeof ACCENT_USE)[number];

export const AMBIENT_MODE = ["off", "permitted"] as const;
export type AmbientMode = (typeof AMBIENT_MODE)[number];

export interface SceneContract {
  /* Identity */
  id: string;            // slug, stable, never renamed after launch
  order: number;         // defines sequence
  name: string;          // internal display name
  narrativeFn: NarrativeFn;
  status: SceneStatus;

  /* Scroll behaviour */
  scrollBehaviour: ScrollBehaviour;
  /** Viewport-heights of scroll distance this scene may consume. Bounded. */
  scrollBudget: number;
  pins: boolean;         // declares whether the scene holds position

  /* Subject behaviour */
  subjectMode: SubjectMode;
  accentUse: AccentUse;
  ambient: AmbientMode;

  /* Degradation — MAY NOT BE BLANK. An undesigned degraded form is an
     unfinished scene. */
  reducedMotion: string;   // what this scene becomes with motion removed
  mobileBehaviour: string; // what this scene becomes at small widths
  noJsBehaviour: string;   // what this scene renders without client JS — never "nothing"

  /* Honesty — TRUE only if the scene describes something that EXISTS today. */
  liveCapability: boolean;

  /* Structure carried by the skeleton */
  /** Anchor id preserved from the retired foundation page, if any. */
  anchorId?: string;
  /** One quiet, voice-correct line the skeleton renders (prod-safe). */
  quietLine: string;
  /** Which Phase 4 step authors this scene (dev metadata only). */
  authoredIn: string;
}

/* ── PAGE-WIDE BUDGETS ──────────────────────────────────────────────────────
   The scroll budget is bounded as a whole: the sum of every scene's
   scrollBudget must not exceed PAGE_SCROLL_CEILING (viewport heights).
   Motion is bounded per scene: at most MAX_CONCURRENT_ANIM elements may
   animate at once. STICKY-STAGE is rationed to ONE scene per page — the
   claimant is declared in scenes.ts and asserted by validateSpine.        */
export const PAGE_SCROLL_CEILING = 12; // viewport heights
export const MAX_CONCURRENT_ANIM = 8;  // elements per scene
export const MAX_STICKY_SCENES = 1;
