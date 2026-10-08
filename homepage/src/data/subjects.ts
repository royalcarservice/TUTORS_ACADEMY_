/* ════════════════════════════════════════════════════════════════════════
   THE SIX SUBJECTS — content for the homepage subject explorer.

   Identities (names, accents, motifs) are carried over from the repository's
   subject schema, `src/lib/subjects/subjects.ts`, so the homepage and the
   portal describe the same six spaces in the same colours.

   Everything in `topics` and `interaction` is sample teaching material written
   for this page. It is labelled a PREVIEW in the UI: there is no live tutor,
   no student account and no saved progress behind it.
   ════════════════════════════════════════════════════════════════════════ */

export type MotifId =
  | "lattice"
  | "field"
  | "bonds"
  | "branching"
  | "pages"
  | "strata";

export interface NumericInteraction {
  kind: "numeric";
  prompt: string;
  label: string;
  answer: number;
  tolerance: number;
  unit?: string;
  work: string;
}

export interface ChoiceInteraction {
  kind: "choice";
  prompt: string;
  question: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  answer: string;
  work: string;
}

export interface SequenceInteraction {
  kind: "sequence";
  prompt: string;
  question: string;
  /** Listed out of order; `answer` is the same ids in the correct order. */
  items: ReadonlyArray<{ id: string; label: string; note: string }>;
  answer: ReadonlyArray<string>;
  work: string;
}

export interface MatchInteraction {
  kind: "match";
  prompt: string;
  question: string;
  /** Shuffled on render. `left` matches the `right` of the same pair. */
  pairs: ReadonlyArray<{ left: string; right: string }>;
  work: string;
}

export type Interaction =
  | NumericInteraction
  | ChoiceInteraction
  | SequenceInteraction
  | MatchInteraction;

export interface Subject {
  id: string;
  name: string;
  /** One line, plain, no hype. */
  tagline: string;
  intro: string;
  /** Graphic accent — used on white card surfaces and in the 3D motif. */
  accent: string;
  /** Soft tint for badge backgrounds. */
  accentSoft: string;
  /** Dark enough for text on the ground (#F5F5F5) and on white. */
  accentInk: string;
  /** Brightened for dark (ink) surfaces — the portal's `ink` variant. */
  accentOnDark: string;
  motif: MotifId;
  motifLabel: string;
  topics: ReadonlyArray<{ title: string; detail: string }>;
  interaction: Interaction;
}

export const SUBJECTS: ReadonlyArray<Subject> = [
  {
    id: "mathematics",
    name: "Mathematics",
    tagline: "Structure you can stand on.",
    intro:
      "Mathematics here is worked, not watched. You write the step, see whether it holds, and only then move on. The lattice is the point: every result sits on something you have already checked.",
    accent: "#4353c9",
    accentSoft: "#e9ebfb",
    accentInk: "#33409f",
    accentOnDark: "#8fa0ff",
    motif: "lattice",
    motifLabel: "Structured lattice",
    topics: [
      {
        title: "Linear and quadratic graphs",
        detail: "What a, b and c actually do to the curve, sketched before it is plotted.",
      },
      {
        title: "Simultaneous equations",
        detail: "Elimination and substitution, and how to tell which one a pair wants.",
      },
      {
        title: "Indices and surds",
        detail: "Laws of indices, simplifying surds, rationalising a denominator.",
      },
    ],
    interaction: {
      kind: "numeric",
      prompt: "Solve for x",
      label: "5(x − 2) = 3x + 8",
      answer: 9,
      tolerance: 0.001,
      work: "Expand: 5x − 10 = 3x + 8. Collect x on one side: 2x = 18. Divide: x = 9.",
    },
  },
  {
    id: "physics",
    name: "Physics",
    tagline: "Forces you can feel.",
    intro:
      "Physics is a field of causes. You start from what is happening, say which law governs it, and only then reach for a number. Units are not decoration here — they are the check on your reasoning.",
    accent: "#c2410c",
    accentSoft: "#fbeae1",
    accentInk: "#9a330a",
    accentOnDark: "#ff9068",
    motif: "field",
    motifLabel: "Flowing field lines",
    topics: [
      {
        title: "Motion graphs",
        detail: "Reading gradient and area on displacement, velocity and time graphs.",
      },
      {
        title: "Forces and Newton's laws",
        detail: "Free-body diagrams, resultant force, and what equilibrium really means.",
      },
      {
        title: "Energy transfers",
        detail: "Stores, pathways and efficiency, with the wasted energy named.",
      },
    ],
    interaction: {
      kind: "match",
      prompt: "Quantity and unit",
      question: "Pair each quantity with its SI unit.",
      pairs: [
        { left: "Acceleration", right: "m/s²" },
        { left: "Momentum", right: "kg m/s" },
        { left: "Power", right: "W" },
      ],
      work: "Acceleration is a change of velocity per second (m/s²). Momentum is mass times velocity (kg m/s). Power is energy transferred per second, which is the watt (W).",
    },
  },
  {
    id: "chemistry",
    name: "Chemistry",
    tagline: "Reactions, contained.",
    intro:
      "Chemistry is bookkeeping with atoms. Nothing appears and nothing disappears — so the first habit is to count, and the second is to make both sides of the equation agree.",
    accent: "#8a3ffc",
    accentSoft: "#f1e9fe",
    accentInk: "#6d22d1",
    accentOnDark: "#c795ff",
    motif: "bonds",
    motifLabel: "Molecular connections",
    topics: [
      {
        title: "Atomic structure",
        detail: "Protons, neutrons, electrons, and why the table is shaped the way it is.",
      },
      {
        title: "Bonding",
        detail: "Ionic, covalent and metallic bonding, and the properties each one explains.",
      },
      {
        title: "Moles and reacting masses",
        detail: "From relative formula mass to reacting masses, one conversion at a time.",
      },
    ],
    interaction: {
      kind: "numeric",
      prompt: "Balance the equation",
      label: "__ Al + __ O₂ → 2 Al₂O₃  — what goes in front of O₂?",
      answer: 3,
      tolerance: 0,
      work: "Two Al₂O₃ hold 6 oxygen atoms, so 3 O₂ molecules are needed. Aluminium then balances at 4. The full equation is 4Al + 3O₂ → 2Al₂O₃.",
    },
  },
  {
    id: "biology",
    name: "Biology",
    tagline: "Life, layered.",
    intro:
      "Biology reads best when structure explains function. You build from the smallest working unit upward, and at each level you ask the same question: what does this shape let it do?",
    accent: "#15803d",
    accentSoft: "#e3f4e8",
    accentInk: "#116633",
    accentOnDark: "#7ce7a5",
    motif: "branching",
    motifLabel: "Branching structure",
    topics: [
      {
        title: "Cell structure",
        detail: "What plant and animal cells share, and the parts only one of them has.",
      },
      {
        title: "Enzymes",
        detail: "Active sites, denaturing, and the temperature and pH curves that show it.",
      },
      {
        title: "Transport in plants",
        detail: "Xylem and phloem, transpiration, and what moves in each direction.",
      },
    ],
    interaction: {
      kind: "sequence",
      prompt: "Levels of organisation",
      question: "Order these from the smallest working unit to the whole.",
      items: [
        { id: "organ", label: "Organ", note: "e.g. the leaf" },
        { id: "cell", label: "Cell", note: "e.g. a palisade cell" },
        { id: "organism", label: "Organism", note: "e.g. the plant" },
        { id: "tissue", label: "Tissue", note: "e.g. palisade mesophyll" },
        { id: "system", label: "Organ system", note: "e.g. the shoot system" },
      ],
      answer: ["cell", "tissue", "organ", "system", "organism"],
      work: "Cells group into tissues, tissues into organs, organs into organ systems, and organ systems make the organism.",
    },
  },
  {
    id: "english",
    name: "English",
    tagline: "Reading first.",
    intro:
      "English begins with the text in front of you. Name what the writer did, show the words that did it, and say what it makes the reader think. The reading carries the argument; the structure only holds it.",
    accent: "#be123c",
    accentSoft: "#fbe7ec",
    accentInk: "#9d0f33",
    accentOnDark: "#ff8fa3",
    motif: "pages",
    motifLabel: "Layered pages",
    topics: [
      {
        title: "Writers' methods",
        detail: "Language and structure choices, and the effect each one has.",
      },
      {
        title: "Building an argument",
        detail: "Thesis, evidence, and the sentence that does the analysing.",
      },
      {
        title: "Shakespeare in context",
        detail: "Reading a scene with the ideas of its time in view.",
      },
    ],
    interaction: {
      kind: "choice",
      prompt: "Identify the method",
      question: "\u201cThe wind whispered through the empty streets.\u201d",
      options: [
        { id: "personification", label: "Personification" },
        { id: "simile", label: "Simile" },
        { id: "hyperbole", label: "Hyperbole" },
        { id: "onomatopoeia", label: "Onomatopoeia" },
      ],
      answer: "personification",
      work: "The wind is given a human action — whispering — so it is personification. A simile would compare using 'like' or 'as', hyperbole would exaggerate, and onomatopoeia would sound like the thing itself.",
    },
  },
  {
    id: "history",
    name: "History",
    tagline: "Layered, archival.",
    intro:
      "History is evidence, argued about. A source is never simply true: you ask who made it, when, for whom, and what they stood to gain. Sequence comes next — you cannot weigh a cause before you can place it.",
    accent: "#0e7490",
    accentSoft: "#e2f2f6",
    accentInk: "#0b5b71",
    accentOnDark: "#7fd6e8",
    motif: "strata",
    motifLabel: "Stacked timeline rings",
    topics: [
      {
        title: "Source analysis",
        detail: "Provenance, purpose and reliability, and what a source cannot tell you.",
      },
      {
        title: "Industrial Britain",
        detail: "Towns, work and reform between 1750 and 1900.",
      },
      {
        title: "Causes of the First World War",
        detail: "Alliances, militarism, imperialism and nationalism, weighed against each other.",
      },
    ],
    interaction: {
      kind: "sequence",
      prompt: "Put these in order",
      question: "Arrange these from earliest to most recent.",
      items: [
        { id: "reform", label: "The Reform Act", note: "1832" },
        { id: "magna", label: "Magna Carta sealed", note: "1215" },
        { id: "fire", label: "The Great Fire of London", note: "1666" },
      ],
      answer: ["magna", "fire", "reform"],
      work: "Magna Carta was sealed in 1215, the Great Fire of London burned in 1666, and the Reform Act was passed in 1832.",
    },
  },
];

export const getSubject = (id: string | null) =>
  SUBJECTS.find((s) => s.id === id) ?? null;
