import { PORTAL_META, ROUTES, type PortalId } from "./routes";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/* --------------------------------------------------------------------------
   Public website
   Anchors resolve to section ids rendered by the marketing home page.
   -------------------------------------------------------------------------- */

export const PUBLIC_NAV: NavLink[] = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For students", href: "/#for-students" },
  { label: "For tutors", href: "/#for-tutors" },
  { label: "Platform", href: "/#platform" },
];

/* --------------------------------------------------------------------------
   Portal entry points
   -------------------------------------------------------------------------- */

export const PORTAL_ENTRIES: Array<NavLink & { id: PortalId }> = [
  {
    id: "student",
    label: PORTAL_META.student.label,
    href: ROUTES.student,
    description: PORTAL_META.student.blurb,
  },
  {
    id: "tutor",
    label: PORTAL_META.tutor.label,
    href: ROUTES.tutor,
    description: PORTAL_META.tutor.blurb,
  },
  {
    id: "admin",
    label: PORTAL_META.admin.label,
    href: ROUTES.admin,
    description: PORTAL_META.admin.blurb,
  },
];

/* Footer links live in src/components/layout/site-footer.tsx (4.8): the
   footer is sparse and authored in place; the former FOOTER_NAV columns were
   unused and listed an anchor (/#platform) that no longer exists. Removed 4.9. */
