/**
 * Canonical route map.
 * Nothing in the app should hard-code a URL string — import from here so a
 * route rename is a one-line change and dead links are caught by TypeScript.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  student: "/student",
  tutor: "/tutor",
  admin: "/admin",
  /** The legal framework (Phase 10 · Step 1, DEC-037 — resolves E-07). */
  legalTerms: "/legal/terms",
  legalPrivacy: "/legal/privacy",
  legalGuardianConsent: "/legal/guardian-consent",
  /** The onboarding continuation (Phase 10 · Step 2, DEC-038). */
  registerGuardian: "/register/guardian",
  verifyGuardian: "/auth/verify-guardian",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * The three authenticated surfaces. Portal layouts, navigation and future
 * auth guards all key off this union.
 */
export const PORTAL_IDS = ["student", "tutor", "admin"] as const;
export type PortalId = (typeof PORTAL_IDS)[number];

export const PORTAL_META: Record<
  PortalId,
  { label: string; home: AppRoute; blurb: string }
> = {
  student: {
    label: "Student portal",
    home: ROUTES.student,
    blurb: "Your subjects, and what to open next.",
  },
  tutor: {
    label: "Tutor portal",
    home: ROUTES.tutor,
    blurb: "The students placed with you, by subject.",
  },
  admin: {
    label: "Admin portal",
    home: ROUTES.admin,
    blurb: "Architecture only. No account can open it.",
  },
};
