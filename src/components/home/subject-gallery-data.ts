/* Shared gallery metadata (DEC-047). Plain data only — importable from both
   the server card layer and the client canvas layer without dragging three.js
   into the server bundle. */

export const GALLERY_SLUGS = [
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "english",
  "history",
  "computer-science",
] as const;
export type GallerySlug = (typeof GALLERY_SLUGS)[number];

/** Homepage display accents from the owner brief (schema identity accents
    live in src/lib/subjects/subjects.ts and are validated separately). */
export const GALLERY_ACCENTS: Record<GallerySlug, string> = {
  mathematics: "#3B82F6",
  physics: "#F59E0B",
  chemistry: "#8B5CF6",
  biology: "#10B981",
  english: "#FB7185",
  history: "#06B6D4",
  "computer-science": "#06B6D4",
};

export const GALLERY_COPY: Record<GallerySlug, { title: string; description: string; linkLabel: string }> = {
  mathematics: {
    title: "Mathematics",
    description: "Build confidence in numbers, patterns, and problem-solving.",
    linkLabel: "Explore subject ↗",
  },
  physics: {
    title: "Physics",
    description: "Understand the forces that shape our world.",
    linkLabel: "Explore subject ↗",
  },
  chemistry: {
    title: "Chemistry",
    description: "Explore matter, molecules, and how things change.",
    linkLabel: "Explore subject ↗",
  },
  biology: {
    title: "Biology",
    description: "Discover living systems, from cells to ecosystems.",
    linkLabel: "Explore subject ↗",
  },
  english: {
    title: "English",
    description: "Develop confident reading, writing, and expression.",
    linkLabel: "Explore subject ↗",
  },
  history: {
    title: "History",
    description: "Connect the past to the world we live in.",
    linkLabel: "Explore subject ↗",
  },
  "computer-science": {
    title: "Computer Science",
    description: "Build skills in coding, computational thinking, and the technology shaping our future.",
    linkLabel: "Explore Computer Science ↗",
  },
};
/** Darker accent inks — AA-legible link/stroke colours on warm ivory. */
export const GALLERY_INK: Record<GallerySlug, string> = {
  mathematics: "#1D4ED8",
  physics: "#D97706",
  chemistry: "#6D28D9",
  biology: "#059669",
  english: "#E11D48",
  history: "#0891B2",
  "computer-science": "#0891B2",
};
