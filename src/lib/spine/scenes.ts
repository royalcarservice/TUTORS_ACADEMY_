import {
  ACCENT_USE,
  AMBIENT_MODE,
  MAX_STICKY_SCENES,
  NARRATIVE_FNS,
  PAGE_SCROLL_CEILING,
  SCROLL_BEHAVIOURS,
  SCENE_STATUSES,
  SUBJECT_MODES,
  type SceneContract,
} from "./types";

/* ════════════════════════════════════════════════════════════════════════
   THE SPINE — nine scenes, one sequence (Phase 4 · Step 1)

   The story: WHAT IS THIS? → I HAVE CHOSEN A SUBJECT AND ENTERED.
   The page ends at ENTER. Account creation happens at the point of actual
   use, never as a toll gate (Locked Decision 1 — flagged for veto in the
   report).

   STICKY-STAGE CLAIMANT: `enter` (Scene 4). It is the signature moment —
   the 3.4 switch transforming one environment into another — and a held
   viewport is what makes that transformation legible. No other scene earns
   a pin; everything else flows. Asserted by validateSpine.

   SEQUENCE is claimed by `practice` (Scene 6) only: it steps four beats
   inside one scene. It does not sequence the page.
   ════════════════════════════════════════════════════════════════════════ */

export const SPINE: readonly SceneContract[] = [
  {
    id: "arrival",
    order: 0,
    name: "Arrival",
    narrativeFn: "arrive",
    status: "authored",
    scrollBehaviour: "reveal-once",
    scrollBudget: 1.2,
    pins: false,
    subjectMode: "neutral",
    accentUse: "none",
    ambient: "off",
    reducedMotion: "Static full-bleed statement; the single h1 and line read in place, complete.",
    mobileBehaviour: "Stacked statement at full width; type scales by token, nothing repositioned.",
    noJsBehaviour: "Server-rendered statement with the h1; motion classes are never applied without JS.",
    liveCapability: true,
    quietLine: "A place where learning happens differently.",
    authoredIn: "Step 4.2",
  },
  {
    id: "premise",
    order: 1,
    name: "The Premise",
    narrativeFn: "premise",
    status: "authored",
    scrollBehaviour: "reveal-once",
    scrollBudget: 1.0,
    pins: false,
    subjectMode: "neutral",
    accentUse: "none",
    ambient: "off",
    reducedMotion: "Static two-column statement; reads top to bottom in order.",
    mobileBehaviour: "Columns stack; measure holds 45–75 characters.",
    noJsBehaviour: "Server-rendered prose; no enhancement required to understand it.",
    liveCapability: true,
    anchorId: "how-it-works",
    quietLine: "One tutor, one plan, one environment per subject. The platform is the place, not a pile of tools.",
    authoredIn: "Step 4.3",
  },
  {
    id: "difference",
    order: 2,
    name: "The Difference",
    narrativeFn: "differentiate",
    status: "authored",
    scrollBehaviour: "reveal-once",
    scrollBudget: 1.2,
    pins: false,
    subjectMode: "preview",
    accentUse: "subtle",
    ambient: "off",
    reducedMotion: "The six environments shown as static, scoped swatches; identity intact, no motion.",
    mobileBehaviour: "Swatches become a horizontal snap row or stacked list; all six reachable.",
    noJsBehaviour: "Server-rendered scoped swatches (tokens resolve without JS); no interaction required.",
    liveCapability: true,
    quietLine: "One brand, six environments. Each subject is a place with its own structure and calm.",
    authoredIn: "Step 4.3",
  },
  {
    id: "choice",
    order: 3,
    name: "The Choice",
    narrativeFn: "choose",
    status: "authored",
    scrollBehaviour: "static",
    /* CORRECTION (4.9, D-08) — 1.2 → 1.4. The 1.2 was declared in 4.1 against
       the skeleton; the 4.4 amendment mandated six full-width doors (floor
       ≈982px at 1280×800 > 960px), so 1.2 became unreachable by construction.
       4.4 §12 disclosed the overrun at the time. One-time retroactive
       correction: permitted only because the declaration predates the
       geometry. Future scope changes update their declaration when they land. */
    scrollBudget: 1.4,
    pins: false,
    subjectMode: "preview",
    accentUse: "forward",
    ambient: "off",
    reducedMotion: "Chooser fully operable with zero motion; selection state conveyed by text and focus.",
    mobileBehaviour: "Chooser becomes a vertical list of six; targets keep 44px minimums.",
    noJsBehaviour: "Renders as six real links to /subjects/* (server-rendered); choosing works without JS.",
    liveCapability: true,
    anchorId: "for-students",
    quietLine: "Six doors. Choose the subject you are here for.",
    authoredIn: "Step 4.4",
  },
  {
    id: "enter",
    order: 4,
    name: "Enter",
    narrativeFn: "enter",
    status: "authored",
    scrollBehaviour: "sticky-stage",
    scrollBudget: 1.6,
    pins: true,
    subjectMode: "active",
    accentUse: "forward",
    ambient: "permitted",
    reducedMotion: "The 3.4 switch runs at its instant tier: state swap plus announcement; the scene is static.",
    mobileBehaviour: "Held viewport released on small widths; the switch runs at its reduced tier, contained.",
    noJsBehaviour: "Server-rendered environment preview of the chosen (or default) subject with a real ENTER link.",
    liveCapability: true,
    quietLine: "The environment becomes the subject. This is the moment the product stops being a website.",
    authoredIn: "Step 4.5",
  },
  {
    id: "people",
    order: 5,
    name: "The People",
    narrativeFn: "people",
    status: "authored",
    scrollBehaviour: "reveal-once",
    scrollBudget: 1.2,
    pins: false,
    subjectMode: "neutral",
    accentUse: "subtle",
    ambient: "off",
    reducedMotion: "Static prose about how tutors are chosen and held to a standard; no cards, no motion.",
    mobileBehaviour: "Single column; no profile-card grid to collapse.",
    noJsBehaviour: "Server-rendered honest state: tutors are described in words; no invented profiles exist.",
    liveCapability: false,
    anchorId: "for-tutors",
    quietLine: "Tutors are people with a standard, not profile cards. This scene waits for real people.",
    authoredIn: "Step 4.6",
  },
  {
    id: "practice",
    order: 6,
    name: "The Practice",
    narrativeFn: "practice",
    status: "authored",
    scrollBehaviour: "sequence",
    scrollBudget: 1.6,
    pins: false,
    subjectMode: "neutral",
    accentUse: "subtle",
    ambient: "off",
    reducedMotion: "The four beats render as one static, ordered list; the story reads completely.",
    mobileBehaviour: "Beats stack vertically with the same order and labels.",
    noJsBehaviour: "Server-rendered roadmap beat, complete and in order, without client JS.",
    liveCapability: false,
    anchorId: "platform",
    quietLine: "What is live, what is next — one scene, four beats, no apology.",
    authoredIn: "Step 4.7",
  },
  {
    id: "promise",
    order: 7,
    name: "The Promise",
    narrativeFn: "promise",
    status: "authored",
    scrollBehaviour: "reveal-once",
    scrollBudget: 1.0,
    pins: false,
    subjectMode: "neutral",
    accentUse: "subtle",
    ambient: "off",
    reducedMotion: "Static statement of what mastery looks like; no charts, no animated counters.",
    mobileBehaviour: "Single column statement.",
    noJsBehaviour: "Server-rendered statement; makes no claim the product does not already demonstrate.",
    liveCapability: false,
    quietLine: "Progress you can see, described only in words the product already keeps.",
    authoredIn: "Step 4.7",
  },
  {
    id: "return",
    order: 8,
    name: "The Return",
    narrativeFn: "return",
    status: "authored",
    scrollBehaviour: "static",
    scrollBudget: 0.8,
    pins: false,
    subjectMode: "neutral",
    accentUse: "forward",
    ambient: "off",
    reducedMotion: "Static closing CTA pair; focus order unchanged.",
    mobileBehaviour: "CTAs stack full-width.",
    noJsBehaviour: "Server-rendered links: ENTER A WORLD → /subjects; UNDERSTAND IT → #premise.",
    liveCapability: true,
    quietLine: "Choose a subject and enter. The rest of the platform meets you inside.",
    authoredIn: "Step 4.8",
  },
] as const;

/* ── VALIDATOR — loud, like 3.1 ─────────────────────────────────────────── */

export function validateSpine(scenes: readonly SceneContract[]): string[] {
  const errors: string[] = [];
  const inEnum = <T,>(v: T, list: readonly T[]) => list.includes(v);

  const orders = scenes.map((s) => s.order).sort((a, b) => a - b);
  if (orders.some((o, i) => o !== i)) errors.push("orders must be contiguous from 0");
  const ids = new Set(scenes.map((s) => s.id));
  if (ids.size !== scenes.length) errors.push("scene ids must be unique");

  let budget = 0;
  let sticky = 0;
  for (const s of scenes) {
    if (!inEnum(s.narrativeFn, NARRATIVE_FNS)) errors.push(`${s.id}: bad narrativeFn`);
    if (!inEnum(s.status, SCENE_STATUSES)) errors.push(`${s.id}: bad status`);
    if (!inEnum(s.scrollBehaviour, SCROLL_BEHAVIOURS)) errors.push(`${s.id}: bad scrollBehaviour`);
    if (!inEnum(s.subjectMode, SUBJECT_MODES)) errors.push(`${s.id}: bad subjectMode`);
    if (!inEnum(s.accentUse, ACCENT_USE)) errors.push(`${s.id}: bad accentUse`);
    if (!inEnum(s.ambient, AMBIENT_MODE)) errors.push(`${s.id}: bad ambient`);
    if (!s.reducedMotion.trim()) errors.push(`${s.id}: reducedMotion is blank`);
    if (!s.mobileBehaviour.trim()) errors.push(`${s.id}: mobileBehaviour is blank`);
    if (!s.noJsBehaviour.trim() || /nothing/i.test(s.noJsBehaviour)) errors.push(`${s.id}: noJsBehaviour blank or "nothing"`);
    if (typeof s.liveCapability !== "boolean") errors.push(`${s.id}: liveCapability must be boolean`);
    if (s.scrollBudget <= 0) errors.push(`${s.id}: scrollBudget must be positive`);
    if (s.scrollBehaviour === "sticky-stage") sticky++;
    if (s.pins && s.scrollBehaviour !== "sticky-stage") errors.push(`${s.id}: pins requires sticky-stage`);
    budget += s.scrollBudget;
  }
  if (sticky > MAX_STICKY_SCENES) errors.push(`more than ${MAX_STICKY_SCENES} sticky-stage scene`);
  if (budget > PAGE_SCROLL_CEILING) errors.push(`total scrollBudget ${budget} exceeds ceiling ${PAGE_SCROLL_CEILING}`);
  return errors;
}

export const totalScrollBudget = (scenes: readonly SceneContract[]) =>
  Math.round(scenes.reduce((a, s) => a + s.scrollBudget, 0) * 100) / 100;
