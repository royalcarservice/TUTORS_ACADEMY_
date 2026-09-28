/**
 * Global brand + metadata configuration.
 * Consumed by the root layout (metadata/OG), the header, the footer and
 * every portal shell, so the brand is defined in exactly one place.
 */
export const siteConfig = {
  name: "Tutors Academy",
  shortName: "TA",
  tagline: "Live tutoring, built for real learning outcomes.",
  description:
    "Tutors Academy is a single learning platform for students, tutors and administrators — live classrooms, recorded lessons, assignments, assessments and an AI learning assistant in one place.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",
} as const;

export type SiteConfig = typeof siteConfig;
