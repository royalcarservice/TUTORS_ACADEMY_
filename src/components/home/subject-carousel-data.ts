/* ════════════════════════════════════════════════════════════════════
   SUBJECT CAROUSEL — DATA (DEC-052)

   ONE clearly named array drives every card: swap the `image` value
   when final assets arrive — nothing else changes. Current images are
   TEMPORARY placeholders (owner-supplied finals did not persist into
   the workspace); paths are stable so replacement is one line each.
   ════════════════════════════════════════════════════════════════════ */

export interface SubjectCardData {
  slug: string;
  name: string;
  description: string;
  /** TEMPORARY placeholder — replace with the final asset URL. */
  image: string;
  alt: string;
}

export const SUBJECT_CARD_DATA: SubjectCardData[] = [
  {
    slug: "mathematics",
    name: "Mathematics",
    description: "Build confidence in numbers, patterns, and problem-solving.",
    image: "/gallery/mathematics.jpg", // TEMPORARY placeholder
    alt: "Mathematics artwork",
  },
  {
    slug: "physics",
    name: "Physics",
    description: "Understand the forces that shape our world.",
    image: "/gallery/physics.jpg", // TEMPORARY placeholder
    alt: "Physics artwork",
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    description: "Explore matter, molecules, and how things change.",
    image: "/gallery/chemistry.jpg", // TEMPORARY placeholder
    alt: "Chemistry artwork",
  },
  {
    slug: "biology",
    name: "Biology",
    description: "Discover living systems, from cells to ecosystems.",
    image: "/gallery/biology.jpg", // TEMPORARY placeholder
    alt: "Biology artwork",
  },
  {
    slug: "english",
    name: "English",
    description: "Develop confident reading, writing, and expression.",
    image: "/gallery/english.jpg", // TEMPORARY placeholder
    alt: "English artwork",
  },
  {
    slug: "history",
    name: "History",
    description: "Connect the past to the world we live in.",
    image: "/gallery/history.jpg", // TEMPORARY placeholder
    alt: "History artwork",
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    description: "Build skills in coding, computational thinking, and the technology shaping our future.",
    image: "/gallery/computer-science.jpg", // TEMPORARY placeholder
    alt: "Computer Science artwork",
  },
];
