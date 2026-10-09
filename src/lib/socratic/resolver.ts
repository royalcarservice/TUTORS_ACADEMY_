/* ════════════════════════════════════════════════════════════════════════
   THE SOCRATIC RESOLVER — deterministic milestone-to-concept resolution
   (Phase 9 · Step 1, DEC-033)

   Maps the student's current subject state — a milestone key of the form
   `{subjectId}:{concept-slug}` (the brief's example: Physics,
   "Classical Mechanics → Harmonic Motion") — to structured conceptual
   prompts and proofs, drawn from ONE curated scaffold map.

   THE POSTURES, all declared:
     · DETERMINISTIC — same prompt, same guidance, every time. No clock
       reads, no randomness, no network, no database, no react.
     · SCAFFOLDING, NEVER ANSWERS — an inquiry that demands the working
       itself (a completion demand) receives ONE disciplined redirect; the
       engine never produces a solution.
     · HONEST ABSENCE — a milestone the map does not name receives one calm
       sentence saying so; the engine never invents a scaffold.
     · SUBJECT ISOLATION IN LOGIC — a key is resolved only when its subject
       segment names the prompt's own subject; archive facts from another
       subject are never cited.
     · THE ARCHIVE, REFERENCED — when the student's own preserved artifacts
       speak to the subject (src/lib/archive's record shape, served by
       src/lib/archive/data.ts), the guidance POINTS at the most recent
       relevant row by id, in the archive's own words; it re-states nothing.
   ════════════════════════════════════════════════════════════════════════ */

import { ARTIFACT_WORD, type ArtifactRecord } from "@/lib/archive/artifact";
import { SUBJECTS } from "@/lib/subjects/subjects";
import type { SubjectId } from "@/lib/student/contract";

import {
  MAX_GUIDANCE_CHARS,
  checkInquiry,
  fitsGuidanceLimit,
  type GuidanceKind,
  type SocraticGuidance,
  type SocraticPrompt,
} from "./contract";

/** One curated scaffold: the concept's hint, its disciplined question and
 *  its canonical proof or reference — three texts, all bounded. */
export interface ConceptScaffold {
  subjectId: SubjectId;
  /** `{subjectId}:{concept-slug}` — the milestone_key the DB stores. */
  key: string;
  /** The concept's path in the subject, e.g. "Classical Mechanics → Harmonic Motion". */
  path: string;
  /** Conceptual scaffolding — the idea the student can climb. */
  hint: string;
  /** ONE disciplined Socratic question. */
  question: string;
  /** The canonical proof, derivation or exercise the concept stands on. */
  proof: string;
}

/** THE MILESTONE KEY'S GRAMMAR — one separator, two non-empty segments. */
export const MILESTONE_KEY_SEPARATOR = ":";

export function parseMilestoneKey(key: string): { subjectId: string; slug: string } | null {
  const i = key.indexOf(MILESTONE_KEY_SEPARATOR);
  if (i <= 0 || i === key.length - 1) return null;
  const subjectId = key.slice(0, i);
  const slug = key.slice(i + 1);
  if (slug.includes(MILESTONE_KEY_SEPARATOR)) return null;
  return { subjectId, slug };
}

/** ONE scaffold map — the engine's entire conceptual content, curated and
 *  bounded. A milestone not named here receives the honest absence, never
 *  an invention. */
export const CONCEPT_SCAFFOLDS: readonly ConceptScaffold[] = [
  // ── physics ──────────────────────────────────────────────────────────────
  {
    subjectId: "physics",
    key: "physics:harmonic-motion",
    path: "Classical Mechanics → Harmonic Motion",
    hint:
      "Harmonic motion is what happens when a restoring force grows in proportion to the displacement it answers: the further the system strays, the harder it is pulled back. Energy trades between two stores, kinetic and potential, twice each cycle.",
    question:
      "Where in the oscillation is the restoring force greatest, and what is the velocity doing at that same instant?",
    proof:
      "Derive the period of a mass on a spring from Newton's second law: set the restoring force equal to mass times acceleration, and show the motion satisfies the equation whose solutions are sines and cosines.",
  },
  {
    subjectId: "physics",
    key: "physics:newton-laws",
    path: "Classical Mechanics → Newton's Laws",
    hint:
      "The three laws read as one statement about change: bodies keep their state unless a net force acts, force sets the rate of change of momentum, and forces always stand in pairs between two bodies.",
    question:
      "Draw one body, alone, with every force on it named by its source. Which other force is the third-law partner of its weight?",
    proof:
      "Show from the second and third laws together that the total momentum of two interacting bodies is conserved when no external force acts.",
  },
  {
    subjectId: "physics",
    key: "physics:conservation-energy",
    path: "Mechanics → Conservation of Energy",
    hint:
      "Conservation of energy turns a question about motion into a question about bookkeeping: name the stores at the start and at the end, and the path between them no longer needs tracing.",
    question:
      "Choose two instants in the motion you are studying. Which stores of energy have changed between them, and what work accounts for the difference?",
    proof:
      "Derive the work–energy theorem: integrate Newton's second law along the path and show the work done equals the change in kinetic energy.",
  },

  // ── mathematics ──────────────────────────────────────────────────────────
  {
    subjectId: "mathematics",
    key: "mathematics:limits-continuity",
    path: "Calculus → Limits and Continuity",
    hint:
      "A limit asks what a function tends toward as its argument approaches a value; continuity adds that the function actually arrives there. The two ideas separate exactly at holes and jumps.",
    question:
      "Where does the function you are studying fail to arrive where it tends, and what does its graph do at that place?",
    proof:
      "Prove from the epsilon–delta definition that the sum of two continuous functions is continuous.",
  },
  {
    subjectId: "mathematics",
    key: "mathematics:differentiation",
    path: "Calculus → The Derivative",
    hint:
      "The derivative is a limit of slopes: secants through one point and a neighbour, as the neighbour approaches. The rules of differentiation are consequences of that one definition, not replacements for it.",
    question:
      "What does the slope of the secant become as the second point approaches the first, and what must the function satisfy there?",
    proof:
      "Derive the product rule for two differentiable functions directly from the limit definition of the derivative.",
  },
  {
    subjectId: "mathematics",
    key: "mathematics:vector-geometry",
    path: "Linear Algebra → Vectors and Geometry",
    hint:
      "A vector carries direction and magnitude apart from any coordinate system; the dot product is where geometry enters algebra, measuring how much two directions agree.",
    question:
      "Which statement about the figure are you trying to establish, and which vector identity carries it without coordinates?",
    proof:
      "Prove the Cauchy–Schwarz inequality for the dot product, and deduce the condition under which two vectors are perpendicular.",
  },

  // ── chemistry ────────────────────────────────────────────────────────────
  {
    subjectId: "chemistry",
    key: "chemistry:periodic-trends",
    path: "Structure of Matter → Periodic Trends",
    hint:
      "The periodic table orders the elements so their outer electron structure repeats; the trends in radius, ionisation energy and electronegativity follow from that structure and the effective nuclear charge the outer electrons feel.",
    question:
      "Across one period, what changes in the atom's structure, and how does the property you are comparing answer that change?",
    proof:
      "Account for the dip in first ionisation energy between nitrogen and oxygen using orbital occupancy and electron pairing.",
  },
  {
    subjectId: "chemistry",
    key: "chemistry:chemical-equilibrium",
    path: "Reaction Chemistry → Chemical Equilibrium",
    hint:
      "Equilibrium is dynamic: forward and reverse reactions continue at equal rates, so composition holds steady without net change. The equilibrium constant records the ratio at that steady state, and only temperature moves it.",
    question:
      "When the mixture is disturbed, which rate answers first, and in which direction does composition move to restore equality of rates?",
    proof:
      "From the equality of forward and reverse rates at equilibrium, derive the expression for the equilibrium constant of a one-step reversible reaction.",
  },
  {
    subjectId: "chemistry",
    key: "chemistry:acid-base",
    path: "Reaction Chemistry → Acids and Bases",
    hint:
      "Acid–base chemistry is proton transfer. Strength is a matter of equilibrium — how completely the transfer proceeds in water — and pH records the resulting hydronium concentration on a logarithmic scale.",
    question:
      "In the reaction you are studying, which species gives up the proton and which accepts it, and what conjugate pair does that make?",
    proof:
      "Derive the relation between the dissociation constant of a weak acid and the pH of its solution, stating the approximation you rely on.",
  },

  // ── biology ──────────────────────────────────────────────────────────────
  {
    subjectId: "biology",
    key: "biology:cell-respiration",
    path: "Cell Biology → Cellular Respiration",
    hint:
      "Respiration is the stepwise, controlled release of energy from glucose: electrons pass along a chain of carriers, and the released energy is captured in ATP rather than surrendered as heat in one step.",
    question:
      "Follow one carbon atom of glucose through the pathway. Where does it leave, and in which molecule?",
    proof:
      "Account for the ATP yield of aerobic respiration stage by stage, and show why oxygen is the final electron acceptor.",
  },
  {
    subjectId: "biology",
    key: "biology:inheritance",
    path: "Genetics → Mendelian Inheritance",
    hint:
      "Mendel's ratios follow from two claims: traits are carried by discrete factors in pairs, and the pairs separate when gametes form. The deviations from the ratios are where the mechanism becomes interesting.",
    question:
      "Which cross would distinguish a heterozygote from a homozygote, and which ratios would each produce?",
    proof:
      "Show by a test cross that a heterozygote yields a one-to-one ratio, and state the assumption about gamete formation the argument depends on.",
  },
  {
    subjectId: "biology",
    key: "biology:natural-selection",
    path: "Evolution → Natural Selection",
    hint:
      "Natural selection needs three conditions: variation, inheritance, and differences in reproductive success. Where all three hold, the population's composition changes without anyone intending it.",
    question:
      "For the trait you are studying: what varies, what is inherited, and which variant leaves more offspring — and why?",
    proof:
      "Construct the argument that differential survival alone, without differential reproduction, cannot change a population's composition.",
  },

  // ── english ──────────────────────────────────────────────────────────────
  {
    subjectId: "english",
    key: "english:thesis-structure",
    path: "Composition → Thesis and Structure",
    hint:
      "A thesis is a claim that needs defending; structure is the order in which the defences appear. Paragraphs earn their place by advancing the claim, not by repeating it.",
    question:
      "State your claim in one sentence. Which of your paragraphs defends it, and which only repeats it?",
    proof:
      "Test the thesis by writing the strongest objection to it; if the thesis cannot answer the objection as it stands, narrow or revise it.",
  },
  {
    subjectId: "english",
    key: "english:close-reading",
    path: "Literature → Close Reading",
    hint:
      "Close reading treats every choice the writer made as deliberate: diction, syntax, image and form. The reading's work is to show what those choices do to a reader's understanding.",
    question:
      "Choose one line that surprised you. Which single word carries the surprise, and what would the line lose without it?",
    proof:
      "Analyse one passage twice — once for what it says, once for how it says it — and mark where the two accounts disagree.",
  },
  {
    subjectId: "english",
    key: "english:rhetorical-analysis",
    path: "Rhetoric → Rhetorical Analysis",
    hint:
      "Rhetorical analysis asks what a text does to its audience and by what means: argument, character and feeling are the three standing instruments, and any passage can be asked which of them it chiefly works through.",
    question:
      "Who is the audience, what response does the passage seek, and which instrument does it chiefly rely on?",
    proof:
      "Identify one appeal to character and one appeal to feeling in the passage, and judge which of them the argument could survive without.",
  },

  // ── history ──────────────────────────────────────────────────────────────
  {
    subjectId: "history",
    key: "history:source-criticism",
    path: "Historical Method → Source Criticism",
    hint:
      "A source is evidence for some questions and silent on others. Criticism asks who made it, for whom, under what constraints, and what it could not have said.",
    question:
      "What did the maker of this source stand to gain from its content, and which question can the source not answer?",
    proof:
      "Compare two accounts of one event written from different positions, and show where their interests shape their testimony.",
  },
  {
    subjectId: "history",
    key: "history:causation",
    path: "Historical Method → Causation and Change",
    hint:
      "Historical causation separates conditions from causes: the background that made an event possible, and the particular circumstances that decided its timing and its shape.",
    question:
      "Of the causes you have listed, which made the event possible, and which decided when and how it happened?",
    proof:
      "Construct a counterfactual: remove one candidate cause and argue carefully whether the event still occurs.",
  },
  {
    subjectId: "history",
    key: "history:industrial-revolution",
    path: "Modern History → The Industrial Revolution",
    hint:
      "Industrialisation rewove work, time and place: production moved to machines and mills, and households, seasons and the meaning of an hour moved with it.",
    question:
      "Whose daily life changed most in the period you are studying, and which piece of evidence shows the change rather than asserting it?",
    proof:
      "Set one quantitative measure (output, population or wages) beside one personal testimony from the period, and state what each proves that the other cannot.",
  },
] as const satisfies readonly ConceptScaffold[];

/** The scaffold a key names — only when its subject segment names the
 *  prompt's own subject. Cross-subject keys resolve to nothing. */
export function scaffoldFor(subjectId: string, milestoneKey: string): ConceptScaffold | null {
  const parsed = parseMilestoneKey(milestoneKey);
  if (!parsed || parsed.subjectId !== subjectId) return null;
  for (const s of CONCEPT_SCAFFOLDS) {
    if (s.subjectId === subjectId && s.key === milestoneKey) return s;
  }
  return null;
}

/** The subject's scaffold keys, in the map's own order. */
export function milestoneKeysFor(subjectId: string): readonly string[] {
  return CONCEPT_SCAFFOLDS.filter((s) => s.subjectId === subjectId).map((s) => s.key);
}

/** A guidance, bounded — a defect against the limit is thrown, never
 *  silently trimmed (the authored content is pinned under it by test). */
function bounded(guidanceType: GuidanceKind, responseText: string): SocraticGuidance {
  if (!fitsGuidanceLimit(responseText)) {
    throw new Error(`socratic: guidance text exceeds MAX_GUIDANCE_CHARS (${MAX_GUIDANCE_CHARS})`);
  }
  return { guidanceType, responseText };
}

/* ── the engine's standing sentences — calm, bounded, one posture each ──── */

const EMPTY_INQUIRY_TEXT =
  "Name the concept you are working on, and say what about it feels unresolved. One or two sentences serve reflection best.";

const OVERLONG_TEXT =
  "A shorter question serves reflection best. Restate what you are asking in at most five hundred characters, and the scaffold will meet it there.";

const COMPLETION_REDIRECT_TEXT =
  "This engine keeps the concept's scaffold and its questions; the working stays the student's own. Take the first step the concept asks of you, and say what you notice.";

function noScaffoldText(subjectId: string): string {
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const name = subject ? subject.name : "this subject";
  return `No scaffold is recorded yet for this milestone in ${name}. Bring the question to your next session, or ask about a stage the subject's scaffold names.`;
}

/* ── completion-demand detection — deterministic marker classes ──────────── */

/** Phrases that demand the engine do the work. Kept tight and unambiguous:
 *  a legitimate conceptual question ("what determines the period …") never
 *  contains one; a demand ("solve this for me") always contains one. */
export const COMPLETION_DEMAND_MARKERS = [
  "for me",
  "final answer",
  "the answer",
  "the solution",
  "just tell me",
  "do my homework",
  "my homework",
  "my assignment",
  "my essay",
  "write my",
  "complete this",
  "finish this",
  "solve it",
  "calculate it",
] as const;

export function asksForCompletion(inquiry: string): boolean {
  const q = inquiry.toLowerCase();
  return COMPLETION_DEMAND_MARKERS.some((m) => q.includes(m));
}

/* ── the archive's reference — POINT at the student's own record ────────── */

/** The artifact the guidance cites, deterministically chosen: first a
 *  Session Notation that carries a readable summary (the tutor's notation —
 *  content over recency), then the newest Board Record (a visual record the
 *  student can re-read), then whatever stands newest. Artifacts of another
 *  subject are never seen. */
function chooseArchiveReference(prompt: SocraticPrompt): ArtifactRecord | null {
  const own = prompt.previousArtifacts.filter((a) => a.subjectId === prompt.subjectId);
  const newestFirst = [...own].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );
  const noted = newestFirst.find(
    (a) =>
      a.type === "pedagogical_notes" &&
      typeof a.metadata["summary"] === "string" &&
      (a.metadata["summary"] as string).trim().length > 0,
  );
  const board = newestFirst.find((a) => a.type === "canvas_snapshot");
  return noted ?? board ?? newestFirst[0] ?? null;
}

function citationText(record: ArtifactRecord): string {
  const word = ARTIFACT_WORD[record.type];
  const day = record.createdAt.slice(0, 10);
  return `Your own ${word} of ${day} stands in the archive beside this stage. Open it, and read the record before you answer.`;
}

/* ── THE RESOLUTION ──────────────────────────────────────────────────────── */

/**
 * Resolve one inquiry into structured guidance. Deterministic, pure, and
 * bounded: the same prompt yields the same guidance, always.
 *
 * Order of resolution, all declared:
 *   1. brevity first — an empty or overlong inquiry receives ONE calm
 *      sentence of redirection, and nothing else;
 *   2. scaffolding, never answers — a completion demand receives ONE
 *      disciplined redirect; the engine produces no working;
 *   3. honest absence — an unknown milestone (or a key naming another
 *      subject) receives ONE calm sentence; nothing is invented;
 *   4. the scaffold — question first (disciplined questions before
 *      essays), then the conceptual hint, then the proof reference;
 *   5. the archive — when the student's own artifacts speak to the
 *      subject, one closing reference cites the most recent by id.
 */
export function resolveGuidance(prompt: SocraticPrompt): readonly SocraticGuidance[] {
  const inquiry = checkInquiry(prompt.studentInquiry);
  if (!inquiry.ok) {
    return [bounded("question", inquiry.reason === "empty" ? EMPTY_INQUIRY_TEXT : OVERLONG_TEXT)];
  }
  if (asksForCompletion(inquiry.text)) {
    return [bounded("question", COMPLETION_REDIRECT_TEXT)];
  }
  const scaffold = scaffoldFor(prompt.subjectId, prompt.currentMilestone);
  if (!scaffold) {
    return [bounded("question", noScaffoldText(prompt.subjectId))];
  }
  const guidance: SocraticGuidance[] = [
    bounded("question", scaffold.question),
    bounded("hint", scaffold.hint),
    bounded("reference", scaffold.proof),
  ];
  const citation = chooseArchiveReference(prompt);
  if (citation) {
    guidance.push({ ...bounded("reference", citationText(citation)), referencedArtifactId: citation.id });
  }
  return guidance;
}
