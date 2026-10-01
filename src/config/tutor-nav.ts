import { ROUTES } from "@/config/routes";

/* TUTOR IA (Phase 6 · Step 2 · Part 1) — the same contract as the student's
 * (config/student-nav.ts): three destinations, all real, every one 200 today.
 *   Overview  /tutor            the tutor shell
 *   Subjects  /subjects         the six environments ("the environment is the workspace", Scene 5)
 *   Account   /tutor/account    profile facts + the real sign-out
 * A later phase appends an item AFTER its route exists and resolves. No
 * disabled or "coming soon" items; nothing named that the registry does not
 * declare built (P5-R7).                                                      */
export const TUTOR_NAV_ITEMS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Overview", href: ROUTES.tutor },
  { label: "Subjects", href: "/subjects" },
  { label: "Account", href: `${ROUTES.tutor}/account` },
];
