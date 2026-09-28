/* THE COPY VOICE (Phase 4 · Step 1 · Part 3) — committed reference.
   Later scene steps write against this; they do not re-decide tone.
   Prose version: COPY_VOICE.md at the repository root. */

export const VOICE_RULES = [
  "Confident and plainspoken. Speak to an intelligent person, not a customer.",
  "Concrete over abstract. Name the thing. Show the detail.",
  "Adult. No exclamation marks, no urgency, no hype.",
  "Short sentences carry the page. Long sentences earn their length or get cut.",
  "Second person, addressed to the student. “You” means the learner.",
  "Every claim must be demonstrable in the product, or the scene is labelled as what's next.",
  "No claim about outcomes the product does not control: marks, ranks, admissions.",
  "No invented testimonial, statistic or credential. Not even as a placeholder.",
] as const;

export const BANNED_PHRASES = [
  "unlock your potential",
  "revolutionize",
  "transform your future",
  "game-changing",
  "world-class",
  "cutting-edge",
  "seamless",
  "empower",
  "journey", // as a marketing noun
  "next-generation",
  "leverage",
  "elevate",
  "discover the magic",
  "unleash",
  "in today's fast-paced world",
  "rhetorical questions as headlines",
  "triple stacks of adjectives",
  "em-dash-heavy listicles",
] as const;
