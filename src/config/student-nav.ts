import { ROUTES } from "@/config/routes";

/* STUDENT IA (Phase 5 · Step 3 · Part 1) — three destinations, all real.
 * EXTENSION CONTRACT: a later phase appends `{ label, href }` here AFTER its
 * route exists and resolves. Nothing is listed before it resolves; there are
 * no disabled or "coming soon" items — a nav item that leads nowhere is a lie
 * with a label. Expected additions: Classes (Phase 7), Recordings (Phase 8),
 * Resources / Progress / AI (Phase 8–9).                                   */
export const STUDENT_NAV_ITEMS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Overview", href: ROUTES.student },
  { label: "Subjects", href: "/subjects" },
  { label: "Account", href: `${ROUTES.student}/account` },
];
