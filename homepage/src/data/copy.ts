/* Page copy, in one place. Written against the repository's copy voice
   (COPY_VOICE.md): confident, plainspoken, concrete, no hype, no invented
   testimonials, credentials, prices or results. */

export const SITE = {
  name: "Tutors Academy",
  mark: "TA",
} as const;

export const NAV_LINKS = [
  { id: "subjects", label: "Subjects" },
  { id: "approach", label: "Our approach" },
  { id: "experience", label: "Learning experience" },
] as const;

export const HERO = {
  headline: "Learning, in a place of its own.",
  body: "Explore Mathematics, Physics, Chemistry, Biology, English, and History — each with its own space to think, practise, and understand.",
  primary: "Explore subjects",
  secondary: "See how learning works",
  sculptureCaption: "Six subject spaces, one structure",
} as const;

export const APPROACH = {
  heading: "One academy. Six ways to explore.",
  body: "Each subject gets its own room. Mathematics looks like a lattice, because it is built from things you have already proved. Physics looks like a field, because it is about forces acting at a distance. Chemistry is bonds, Biology branches, English is a page, History stacks in layers. The point is not decoration — it is that you can feel which subject you are in, and the room stays out of the way of the work.",
  aside: "Nothing is hidden behind a sign-up here. Every subject space on this page opens, and every sample question answers back.",
} as const;

export interface FeatureCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  tone: "light" | "dark";
  /** Only the large card carries a live 3D window. */
  visual: "sculpture" | "motifs" | "practice";
  bullets?: ReadonlyArray<string>;
}

export const FEATURE_CARDS: ReadonlyArray<FeatureCard> = [
  {
    id: "explore",
    eyebrow: "Understanding",
    title: "Understanding comes from turning the thing over.",
    body: "A topic you can only read stays flat. Here you can move it: open a subject, change what you are looking at, and watch the same idea appear from another side. That is what the space is for.",
    tone: "light",
    visual: "sculpture",
    bullets: [
      "Six subject spaces, each arranged around its own way of thinking",
      "Every space opens without an account",
      "Sample material you can actually work through",
    ],
  },
  {
    id: "focus",
    eyebrow: "Focus",
    title: "A subject space keeps the subject's own logic.",
    body: "You are not learning in one grey window with a tab for each subject. Mathematics keeps its structure visible. History keeps its layers. The room tells you what kind of thinking is being asked for, so you do not lose a minute working out where you are.",
    tone: "dark",
    visual: "motifs",
    bullets: [
      "Each space has its own accent, motif and reading rhythm",
      "No unrelated material competing for the same screen",
    ],
  },
  {
    id: "return",
    eyebrow: "Practice",
    title: "You can always come back to an idea.",
    body: "Understanding an idea once is not the same as being able to use it next week. Practice here is short, specific and immediate: a question, an answer, and the working shown next to it so the next attempt is a smaller step.",
    tone: "dark",
    visual: "practice",
    bullets: [
      "Questions answer back with the working, not just a tick",
      "Retake any sample as many times as you like",
    ],
  },
];

export const SUBJECT_EXPLORER = {
  eyebrow: "Subjects",
  heading: "Six spaces. Open any of them.",
  body: "Each card opens a short introduction, three example topics and one working sample. These are previews of how a subject space reads — no live tutoring and no student accounts sit behind them.",
  previewNote: "Preview material",
  cta: "Open space",
} as const;

export interface LearningStage {
  id: "explore" | "practise" | "reflect";
  label: string;
  heading: string;
  body: string;
  /** Read out next to the stage so the section explains rather than only shows. */
  detail: ReadonlyArray<string>;
}

export const LEARNING_STAGES: ReadonlyArray<LearningStage> = [
  {
    id: "explore",
    label: "Explore",
    heading: "Look at the problem before you solve it.",
    body: "Open the topic and take it apart. What is given, what is being asked, and which part of the subject does this belong to? Nothing is calculated yet — you are learning where you are.",
    detail: [
      "Read the question twice and underline what is actually given.",
      "Say, in your own words, what the answer will look like.",
      "Name the method before you use it.",
    ],
  },
  {
    id: "practise",
    label: "Practise",
    heading: "Work the method until it is yours.",
    body: "Now you do the thing. Short, specific questions with the working shown beside the answer, so a wrong attempt tells you which step went — not only that it did.",
    detail: [
      "One step per line, so a mistake has somewhere to hide.",
      "Check the units before you check the number.",
      "Retake it. The second attempt is where it sticks.",
    ],
  },
  {
    id: "reflect",
    label: "Reflect",
    heading: "Write down what the method was.",
    body: "Close the loop. Say what the method was, when you would recognise it again, and where it would fail. This is the step most often skipped and the one that makes the next topic faster.",
    detail: [
      "Summarise the method in one sentence.",
      "Write the condition that makes it apply.",
      "Note the mistake you would most likely make.",
    ],
  },
];

export const SAMPLE_QUESTION = {
  eyebrow: "Sample question",
  prompt: "A train covers 90 km in 1 hour 15 minutes.",
  question: "What is its average speed in km/h?",
  answer: 72,
  tolerance: 0.5,
  work: "1 hour 15 minutes is 1.25 hours. Average speed = distance ÷ time = 90 ÷ 1.25 = 72 km/h.",
} as const;

export const FINAL = {
  heading: "Find your subject. Start exploring.",
  body: "Six spaces, all open. Pick one and read the first topic — nothing else is asked of you.",
  cta: "Explore subjects",
} as const;

export const FOOTER_LINKS = [
  { id: "subjects", label: "Subjects" },
  { id: "approach", label: "Our approach" },
  { id: "experience", label: "Learning experience" },
] as const;

export const FOOTER_NOTE =
  "Subject spaces and sample questions on this page are previews for demonstration. No live tutoring, student accounts or saved progress.";
