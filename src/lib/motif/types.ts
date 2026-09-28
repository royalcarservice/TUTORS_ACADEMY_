/* ════════════════════════════════════════════════════════════════════════
   MOTIF GRAMMAR — DATA TYPES (Phase 3 · Step 3)

   THE LOCKED DECISION: motifs are a DETERMINISTIC GRAMMAR, not drawn artwork.
   Six subjects x six roles x two themes would be 36 hand-maintained artefacts.
   Instead: a small vocabulary of GEOMETRIC PRIMITIVES + per-motif RULES that
   emit DATA from a SEED.

   CONSEQUENCES ENCODED IN THESE TYPES
     1. DETERMINISTIC — same seed, byte-identical output (see hash.ts).
     2. SSR-SAFE — geometry is generated in a FIXED composition box, never
        from the viewport. Only SCALE responds to measurement (the SVG scales
        its viewBox; the numbers never change).
     3. RENDERER-AGNOSTIC — this file describes POINTS and PARAMETERS, not
        markup. `path.ts` happens to turn it into SVG `d` strings today; a
        future WebGL renderer consumes the same `points` arrays.
     4. ANIMATABLE BY DESIGN — every element carries `params`; Step 3.5 drives
        those numbers without regenerating a single element.
     5. BOUNDED — caps live in budgets.ts and are enforced in grammar.ts.

   MOTIF KINDS mirror the CLOSED SET from the 3.1 schema (`MOTIFS`). Declared
   locally so this module stays pure and cannot import subject config (the 3.1
   guard applies to components; this module keeps the same discipline). The
   /dev/motifs specimen asserts the two lists are identical — no seventh motif.
   ════════════════════════════════════════════════════════════════════════ */

export const MOTIF_KINDS = ["lattice", "field", "bonds", "living", "typographic", "strata"] as const;
export type MotifKind = (typeof MOTIF_KINDS)[number];

/**
 * Density levels mirror the CLOSED SET from the 3.1 schema (`DENSITIES`).
 * Declared locally for the same reason as `MOTIF_KINDS`: this module must stay
 * importable without pulling in subject config. /dev/motifs asserts parity.
 */
export const DENSITY_LEVELS = ["sparse", "balanced", "dense"] as const;
export type Density = (typeof DENSITY_LEVELS)[number];

/** Composition roles — a motif is never a background image, it is PLACED. */
export const MOTIF_ROLES = ["substrate", "edge", "divider", "focus", "transition"] as const;
export type MotifRole = (typeof MOTIF_ROLES)[number];

export interface Vec {
  x: number;
  y: number;
}

export interface Box {
  w: number;
  h: number;
}

/** Structural depth. Colour arrives from accent TOKENS per layer (see motif.tsx). */
export const MOTIF_LAYERS = ["quiet", "base", "mid", "emphasis"] as const;
export type MotifLayer = (typeof MOTIF_LAYERS)[number];

/**
 * Three weight classes, resolved by the renderer as multiples of `stroke`.
 * A motif has ONE emphasised moment; everything else is line or hairline.
 */
export type MotifWeight = "hairline" | "line" | "emphasis";

export type PrimitiveKind = "line" | "polyline" | "curve" | "node" | "band";

/**
 * One emitted primitive. `points` is renderer-agnostic geometry:
 *   line/polyline — vertices in order
 *   curve         — control polygon (Catmull-Rom -> cubic, tension in params)
 *   node          — single centre point; `params.r` is its radius
 *   band          — [origin, end] plus `params.thickness` / `params.subdivisions`
 */
export interface MotifElement {
  primitive: PrimitiveKind;
  points: Vec[];
  closed?: boolean;
  layer: MotifLayer;
  weight: MotifWeight;
  /**
   * ANIMATABLE PARAMETERS. Step 3.5 modulates these numbers; the grammar is
   * never re-run. Names are declared per motif in grammar.ts (`MOTION_HOOKS`).
   */
  params: Record<string, number>;
}

/** The full generated structure for one placed motif. Pure data. */
export interface MotifData {
  kind: MotifKind;
  subject: string;
  role: MotifRole;
  /** The seed string, exactly as hashed (subject id + purpose + index). */
  seed: string;
  /** FNV-1a of the emitted geometry — the determinism proof. */
  hash: string;
  box: Box;
  /** Hairline stroke width in box units. */
  stroke: number;
  elements: MotifElement[];
  /** Feature count BEFORE density scaling (structural, for the specimen). */
  features: number;
}

/** Measured cost of generating + rendering one surface. */
export interface MotifBudget {
  elements: number;
  domNodes: number;
  commands: number;
  ms: number;
}
