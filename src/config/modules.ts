/**
 * PLATFORM MODULE REGISTRY
 * --------------------------------------------------------------------------
 * The product roadmap expressed as data. Every domain the platform will grow
 * into is declared here once; navigation, the marketing "platform" section and
 * the portal shells all read from it.
 *
 * Adding a feature later is therefore an additive change:
 *   1. flip `status` here,
 *   2. add its route under the owning portal segment,
 *   3. it appears in navigation automatically — no existing file is rewritten.
 */

export type ModuleStatus = "planned" | "in-progress" | "live";

export type Surface = "public" | "student" | "tutor" | "admin" | "shared";

export interface PlatformModule {
  /** Stable kebab-case identifier. Never renamed once shipped. */
  id: string;
  /** Human-facing name. */
  name: string;
  /** One-line description used in navigation and the platform overview. */
  summary: string;
  status: ModuleStatus;
  /** Every surface the module appears on. `shared` means all portals. */
  surfaces: readonly Surface[];
  /**
   * Reserved future route prefix. Intentionally NOT rendered as a link while
   * the module is `planned`, so the app never advertises a 404.
   */
  routePrefix: string | null;
}

/**
 * Typed as `readonly PlatformModule[]` rather than `as const satisfies`, so
 * `surfaces` stays `readonly Surface[]`. That keeps `.includes(surface)`
 * legal — with a const-narrowed tuple the argument type collapses to `never`.
 */
export const PLATFORM_MODULES: readonly PlatformModule[] = [
  {
    id: "public-website",
    name: "Public website",
    summary: "Marketing site, programme information and sign-up funnel.",
    status: "live",
    surfaces: ["public"],
    routePrefix: "/",
  },
  {
    id: "student-portal",
    name: "Student portal",
    summary: "The student's space: the subjects chosen, entered and returned to.",
    /* 5.5 (P5-R4 Addendum 2): corrected from "planned". The student SPACE
       exists in production — sign-in, the /student shell, the next-action
       engine, enrolment and entry. Schedule, work and progress do NOT. The
       schema's one status per module cannot say "shell built, contents not";
       "in-progress" is the honest value it can express. Consumers already
       map it: homepage beats → "In foundation"; provider gate still requires
       "live", so nothing new is emitted. */
    status: "in-progress",
    surfaces: ["student"],
    routePrefix: "/student",
  },
  {
    id: "tutor-portal",
    name: "Tutor portal",
    summary: "The tutor's space: the students placed with you, by subject.",
    status: "planned",
    surfaces: ["tutor"],
    routePrefix: "/tutor",
  },
  {
    id: "tutor-relationship",
    name: "Tutor relationship",
    summary: "One tutor, one student, one subject — explicit, revocable, never inferred.",
    /* 6.1 (P6-R1/R2): the MODEL — `public.relationships` and the four tutor
       read policies gated by it (migration 0002). 6.2: a surface that resolves
       now depends on it — /tutor renders a tutor's relationship rows (display
       name · subject) through the relationship-scoped reader. "live" per the
       registry's own rule: shipped and reachable now (by tutor accounts; the
       production role path still does not exist, 6.1 Part 6). The student's
       `tutor-presence` slot stays gated on `tutor-portal`, unchanged. */
    status: "live",
    surfaces: ["tutor"],
    routePrefix: null,
  },
  {
    id: "admin-portal",
    name: "Admin portal",
    summary: "Architecture only: a route and a guard. No admin account exists.",
    status: "planned",
    surfaces: ["admin"],
    routePrefix: "/admin",
  },
  {
    /* PHASE 7 PREREQUISITE (5.6 close-out): before this module records anything,
       create public.progress_record from docs/proposed/progress_record.sql —
       Phase 7's FIRST task. The open referent question in that file must be
       decided with the real session table in hand. */
    id: "live-classroom",
    name: "Live classroom",
    summary: "Real-time video sessions with a shared whiteboard and chat.",
    status: "planned",
    surfaces: ["student", "tutor"],
    routePrefix: null,
  },
  {
    id: "recorded-classes",
    name: "Recorded classes",
    summary: "On-demand lesson library with chapters, notes and playback.",
    status: "planned",
    surfaces: ["student", "tutor"],
    routePrefix: null,
  },
  {
    id: "assignments",
    name: "Assignments",
    summary: "Homework set by tutors, submitted and reviewed by students.",
    status: "planned",
    surfaces: ["student", "tutor", "admin"],
    routePrefix: null,
  },
  {
    id: "tests",
    name: "Tests & assessments",
    summary: "Timed exams, auto-grading and detailed performance analytics.",
    status: "planned",
    surfaces: ["student", "tutor", "admin"],
    routePrefix: null,
  },
  {
    id: "payments",
    name: "Payments",
    summary: "Plans, checkout, invoices, refunds and tutor payouts.",
    status: "planned",
    surfaces: ["student", "tutor", "admin"],
    routePrefix: null,
  },
  {
    id: "ai-assistant",
    name: "AI learning assistant",
    summary: "Context-aware tutor aid for doubt solving and revision.",
    status: "planned",
    surfaces: ["student", "tutor"],
    routePrefix: null,
  },
];

export const MODULE_STATUS_LABEL: Record<ModuleStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  live: "Live",
};

/** Modules that surface on a given portal or the public site. */
export function getModulesForSurface(surface: Surface): PlatformModule[] {
  return PLATFORM_MODULES.filter(
    (m) => m.surfaces.includes(surface) || m.surfaces.includes("shared"),
  );
}

/** Everything that is not live yet — drives the "what's next" panels. */
export function getPlannedModules(surface: Surface): PlatformModule[] {
  return getModulesForSurface(surface).filter((m) => m.status !== "live");
}
