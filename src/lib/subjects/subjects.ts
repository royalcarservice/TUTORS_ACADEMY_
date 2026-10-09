/* ════════════════════════════════════════════════════════════════════════
   SUBJECT IDENTITY SCHEMA (Phase 3 · Step 1)

   GOVERNING RULES
     1. ONE BRAND, MANY ENVIRONMENTS — the brand frame is identical everywhere;
        subjects change environment, never brand.
     2. SUBJECTS ARE CONFIG, NOT COMPONENTS — adding a subject never edits a
        component; components consume tokens + context only.
     3. THE ENVIRONMENT MUST NEVER COST USABILITY — every capability is
        bounded, budgeted and degradable.

   ANTI-COLLISION (enforced by the validator)
     · Accents stay distinguishable from BRASS (brand) and SIGNAL TEAL (live).
     · All six appear together on the switcher → MUTUAL DISTINCTNESS matters
       more than individual beauty; the validator checks all six vs EACH OTHER.
     · Accents colour ELEMENTS and ATMOSPHERE — never large flat fills behind
        body text, and never a replacement for brand brass.

   IMMUTABILITY
     `id` keys user progress, recordings, classes and tutoring data later.
     NEVER rename an id after launch. A new enum value is a SCHEMA CHANGE —
     report it, do not silently extend a closed set.
   ════════════════════════════════════════════════════════════════════════ */

export const ATMOSPHERES = ["graphite-field", "deep-space", "glass", "organic", "paper", "cartographic"] as const;
export const MOTIFS = ["lattice", "field", "bonds", "living", "typographic", "strata"] as const;
export const MOTION_CHARS = ["precise", "energetic", "reactive", "growing", "editorial", "sequential"] as const;
export const DENSITIES = ["sparse", "balanced", "dense"] as const;
export const STATUSES = ["draft", "ready", "locked"] as const;

export type Atmosphere = (typeof ATMOSPHERES)[number];
export type Motif = (typeof MOTIFS)[number];
export type MotionChar = (typeof MOTION_CHARS)[number];
export type Density = (typeof DENSITIES)[number];
export type SubjectStatus = (typeof STATUSES)[number];

/** A colour declared for BOTH surfaces, or a single value proven against both. */
export interface SubjectColor { ink: string; ivory: string }

export interface SubjectAmbient {
  enabled: boolean;
  budget: number;            // max concurrent ambient elements (motion budget)
  pauseOffscreen: boolean;
  stopsOnBlur: boolean;
  fallback: "static" | "none"; // what remains when ambient is sacrificed
}

export interface SubjectConfig {
  id: string;                 // IMMUTABLE slug
  name: string;
  tagline: string;
  status: SubjectStatus;
  environment: string;        // one short paragraph of intent (words, not art)
  accent1: SubjectColor;      // primary identity
  accent2: SubjectColor;      // motif companion
  accent3: SubjectColor;      // structural quiet
  atmosphere: Atmosphere;
  motif: Motif;
  motionChar: MotionChar;
  density: Density;
  motionCharter: {
    enterChoreo: string;      // must name an existing 2.3 preset chain
    exitChoreo: string;
    morphTarget: string;      // the continuity anchor across the switch
    ambient: SubjectAmbient;
  };
  roomMood: string;           // how the environment calms inside a Room
  degradation: { reduced: string; static: string }; // ladder full→reduced→static
}

/* ── deterministic derivation (documented) ───────────────────────────────
   accent2/3 for draft subjects are derived from accent1 toward the surface
   neutral so they stay inside the subject's own triad:
     accent2 = mix(accent1, neutral, 0.18)   companion, still ≥3:1 graphic
     accent3 = mix(accent1, neutral, 0.55)   structural quiet (hairlines)
   The derivation is re-checked by the validator (Part 3).                 */
const hex2rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (r: number[]) => "#" + r.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
export function mix(a: string, b: string, t: number) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex(A.map((v, i) => v + (B[i] - v) * t));
}
const INK = "#0b0e12", IVORY = "#faf9f5";
export function deriveTriad(accent1: SubjectColor): { accent2: SubjectColor; accent3: SubjectColor } {
  return {
    accent2: { ink: mix(accent1.ink, INK, 0.18), ivory: mix(accent1.ivory, IVORY, 0.18) },
    accent3: { ink: mix(accent1.ink, INK, 0.55), ivory: mix(accent1.ivory, IVORY, 0.55) },
  };
}

const t = (accent1: SubjectColor) => deriveTriad(accent1);

/* ── THE SIX SUBJECTS ─────────────────────────────────────────────────── */

const mathTriad = {
  accent1: { ink: "#8fa0ff", ivory: "#4353c9" },
  accent2: { ink: "#a5b0ff", ivory: "#5a6be0" },
  accent3: { ink: "#4a527c", ivory: "#9aa1c6" },
};

export const SUBJECTS: SubjectConfig[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    tagline: "The Lattice — structure you can stand on.",
    status: "ready",
    environment:
      "Mathematics is a graphite field of quiet, exact structure: a fine indigo lattice sits beneath generous negative space, lines meeting at confident nodes. Nothing glows, nothing hurries. The environment rewards precision — alignment, whitespace and a single indigo accent doing the pointing — so a proof reads as calm architecture, not decoration.",
    ...mathTriad,
    atmosphere: "graphite-field",
    motif: "lattice",
    motionChar: "precise",
    density: "sparse",
    motionCharter: {
      enterChoreo: "reveal→stagger (2.3)",
      exitChoreo: "exit (2.3, faster)",
      morphTarget: "subject mark / lattice node",
      ambient: { enabled: true, budget: 4, pauseOffscreen: true, stopsOnBlur: true, fallback: "static" },
    },
    roomMood: "exact, quiet, negative space — ambient off, indigo retained, lattice reduced to hairlines.",
    degradation: { reduced: "ambient off, lattice static, motion to opacity", static: "flat graphite + indigo hairline only" },
  },
  {
    id: "physics",
    name: "Physics",
    tagline: "The Field — forces you can feel.",
    status: "draft",
    environment:
      "Physics is a deep-space field: ember energy lines curve through near-black, tracing force rather than form. Outside a Room it is energetic and expansive; inside, the field calms to a low, steady glow.",
    accent1: { ink: "#ff9068", ivory: "#c2410c" }, ...t({ ink: "#ff9068", ivory: "#c2410c" }),
    atmosphere: "deep-space", motif: "field", motionChar: "energetic", density: "balanced",
    motionCharter: { enterChoreo: "orient→enter (2.3)", exitChoreo: "exit (2.3)", morphTarget: "field line origin", ambient: { enabled: true, budget: 6, pauseOffscreen: true, stopsOnBlur: true, fallback: "static" } },
    roomMood: "calm field, low energy — lines dim to a steady contour.",
    degradation: { reduced: "field static, motion to opacity", static: "flat deep-space + single ember contour" },
  },
  {
    id: "chemistry",
    name: "Chemistry",
    tagline: "The Vessel — reactions, contained.",
    status: "draft",
    environment:
      "Chemistry is glass: clear panels, manganese-violet bonds linking nodes like a held breath before reaction. Still and transparent on the Stage; unreacting and precise inside a Room.",
    accent1: { ink: "#c795ff", ivory: "#8a3ffc" }, ...t({ ink: "#c795ff", ivory: "#8a3ffc" }),
    atmosphere: "glass", motif: "bonds", motionChar: "reactive", density: "balanced",
    motionCharter: { enterChoreo: "enter→confirm (2.3)", exitChoreo: "exit (2.3)", morphTarget: "bond node", ambient: { enabled: true, budget: 5, pauseOffscreen: true, stopsOnBlur: true, fallback: "static" } },
    roomMood: "still, clear, unreacting — bonds held, no shimmer.",
    degradation: { reduced: "bonds static, no shimmer", static: "flat glass + violet bond outline" },
  },
  {
    id: "biology",
    name: "Biology",
    tagline: "The Organism — life, layered.",
    status: "draft",
    environment:
      "Biology is organic and dense: living-green membranes and branching forms overlap like tissue, breathing slowly in the background. In a Room it slows to a faint, backgrounded pulse.",
    accent1: { ink: "#7ce7a5", ivory: "#15803d" }, ...t({ ink: "#7ce7a5", ivory: "#15803d" }),
    atmosphere: "organic", motif: "living", motionChar: "growing", density: "dense",
    motionCharter: { enterChoreo: "reveal→stagger (2.3)", exitChoreo: "exit (2.3)", morphTarget: "branch origin", ambient: { enabled: true, budget: 6, pauseOffscreen: true, stopsOnBlur: true, fallback: "static" } },
    roomMood: "slow breathing, backgrounded — growth paused at the edges.",
    degradation: { reduced: "breathing off, forms static", static: "flat organic + green membrane line" },
  },
  {
    id: "english",
    name: "English",
    tagline: "The Page — reading first.",
    status: "draft",
    environment:
      "English is paper: a warm, quiet page where a rose accent marks the margin, never the text. Typographic motif — dropped caps, rules and folios — keep the eye on the reading measure.",
    accent1: { ink: "#ff8fa3", ivory: "#be123c" }, ...t({ ink: "#ff8fa3", ivory: "#be123c" }),
    atmosphere: "paper", motif: "typographic", motionChar: "editorial", density: "sparse",
    motionCharter: { enterChoreo: "reveal (2.3)", exitChoreo: "exit (2.3)", morphTarget: "folio / margin mark", ambient: { enabled: false, budget: 0, pauseOffscreen: true, stopsOnBlur: true, fallback: "none" } },
    roomMood: "paper-quiet, reading-first — margin accent only.",
    degradation: { reduced: "no motion, page static", static: "flat paper + rose margin rule" },
  },
  {
    id: "history",
    name: "History",
    tagline: "The Record — layered, archival.",
    status: "draft",
    environment:
      "History is cartographic: slate-cyan strata stack like archived layers of a map, still and sequential. Time reads top-to-bottom; nothing animates that shouldn't.",
    accent1: { ink: "#7fd6e8", ivory: "#0e7490" }, ...t({ ink: "#7fd6e8", ivory: "#0e7490" }),
    atmosphere: "cartographic", motif: "strata", motionChar: "sequential", density: "dense",
    motionCharter: { enterChoreo: "stagger→reveal (2.3)", exitChoreo: "exit (2.3)", morphTarget: "stratum edge", ambient: { enabled: true, budget: 3, pauseOffscreen: true, stopsOnBlur: true, fallback: "static" } },
    roomMood: "layered, still, archival — strata as quiet rules.",
    degradation: { reduced: "sequence instant, strata static", static: "flat record + cyan stratum rules" },
  },
  /* DEC-047 (2026-10-09): the closed six became seven BY EXPLICIT OWNER
     MANDATE — the Interactive 3D Subject Gallery brief directs Computer
     Science as a first-class subject. This is the governed schema change
     the identity file warns about: reported (DEC-047), migration 0015,
     never silent. Accent validated by scripts/validate-subjects.mjs:
     electric blue, mutually distinct (ΔE ≥15) and ≥20 from brass/teal. */
  {
    id: "computer-science",
    name: "Computer Science",
    tagline: "The Circuit — logic you can build.",
    status: "ready",
    environment:
      "Computer Science is a dark substrate of luminous circuits: electric traces radiate across near-black silicon, data moving as light. The environment rewards sequence — stepwise, debuggable, exact — so an algorithm reads as a path of glowing decisions, never as noise.",
    accent1: { ink: "#00b4ff", ivory: "#0369a1" }, ...t({ ink: "#00b4ff", ivory: "#0369a1" }),
    atmosphere: "glass", motif: "lattice", motionChar: "sequential", density: "dense",
    motionCharter: { enterChoreo: "reveal→stagger (2.3)", exitChoreo: "exit (2.3)", morphTarget: "circuit node", ambient: { enabled: true, budget: 6, pauseOffscreen: true, stopsOnBlur: true, fallback: "static" } },
    roomMood: "sequential glow — traces dim to a steady schematic calm.",
    degradation: { reduced: "traces static, packets to opacity", static: "flat substrate + single electric contour" },
  },
];

export const getSubject = (id: string) => SUBJECTS.find((s) => s.id === id);

/** Room name as authored in each subject's tagline ("The Lattice — …"). */
export const roomNameOf = (id: string): string => {
  const s = getSubject(id);
  if (!s) return id;
  return s.tagline.split(" — ")[0] ?? s.name;
};
