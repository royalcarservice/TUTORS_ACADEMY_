/* THE STATE COPY — the chosen sentences from docs/STATE_LANGUAGE.md, in one
 * place so a page, a boundary and the dev inventory cannot drift. Every
 * sentence: one claim we can stand behind, subject = the product, one action
 * that is a READ (safe to repeat). Nothing here apologises, blames, or names
 * an internal. */

export const STATE_COPY = {
  /** 404 — no such subject / no such page (also the draft-subject miss for a non-enrolled student: byte-identical by design). */
  notFound: {
    eyebrow: "Not here",
    heading: "There is no page at this address.",
    sentence: "The six subject environments are listed on the subjects page.",
    action: { label: "See the subjects", href: "/subjects" },
  },
  /** page-scope failure (a render threw; the server could not answer) */
  pageFailed: {
    eyebrow: "Not shown",
    heading: "This page could not be shown just now.",
    sentence: "Nothing was recorded. Opening it again only reads — it is safe to do.",
    action: { label: "Open it again", href: "" }, // href filled with the current path by the boundary
  },
  /** student overview specifically — the primary answer could not be computed truthfully */
  studentFailed: {
    eyebrow: "Not shown",
    heading: "Your subjects could not be read just now.",
    sentence: "Nothing was recorded. Opening the page again only reads — it is safe to do.",
    action: { label: "Open your subjects again", href: "/student" },
  },
  /** /tutor segment failed (6.2) — the same shape and rule as studentFailed: a failed read is never state A. */
  tutorFailed: {
    eyebrow: "Not shown",
    heading: "Your students could not be read just now.",
    sentence: "Nothing was recorded. Opening the page again only reads — it is safe to do.",
    action: { label: "Open your students again", href: "/tutor" },
  },
  /** environment page failed */
  environmentFailed: {
    eyebrow: "Not shown",
    heading: "This environment could not be opened just now.",
    sentence: "Nothing was recorded. Opening it again only reads — it is safe to do.",
    action: { label: "Open it again", href: "" },
  },
  /** ACTION scope: the entry POST returned a known failure (no enrolment written) — rendered beside the Begin control */
  entryFailed: "Beginning did not go through, and nothing was recorded — beginning again is safe.",
  /** login page, when a session ended during a visit (auth cookies present but no longer valid) */
  sessionEnded: (where: string) => `That session ended. Signing in again goes back to ${where}.`,
  /** login page, when a protected page was requested without any session */
  signInToContinue: (where: string) => `Signing in opens ${where}.`,
  /** sign-in failed for a reason the product will not name (security decision, P5-R8.4) */
  signInRefused: "That email and password do not match an account here.",
  /** sign-in service could not be reached (any other failure) */
  signInUnavailable: "Sign-in could not be completed just now. Nothing was changed; signing in again is safe.",
  /** create-account: the service refused for a reason we can pass on truthfully */
  registerUnavailable: "The account could not be created just now. Nothing was saved; sending the form again is safe.",
} as const;
