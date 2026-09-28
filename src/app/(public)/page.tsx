import { HomeSpine } from "@/components/spine/home-spine";
import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { SUBJECTS } from "@/lib/subjects/subjects";

/* `/` — THE NARRATIVE SPINE (Phase 4 · Step 1 · Part 5)

   EXTENDED, NOT REPLACED, AS A ROUTE: this file remains the (public) group's
   page for `/`, inside the unchanged SiteHeader/SiteFooter chrome. The
   foundation-era marketing body (hero, module grid, portal sections and its
   copy) is RETIRED by this step's mandate — Phase 4 rebuilds the homepage as
   nine scenes; this step renders the spine skeleton so `/` is always live,
   always coherent, and improves one scene per later step.

   The retired page's anchor targets are preserved as scene ids
   (#how-it-works #for-students #for-tutors #platform) so the existing public
   nav keeps resolving.

   CORRECT WITH NO JAVASCRIPT: every scene's content is server-rendered in
   order; motion classes are applied only as progressive enhancement.        */

export default function HomePage() {
  /* The validator is loud at build time, like 3.1. */
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);

  return (
    <HomeSpine
      scenes={SPINE}
      subjectEntries={SUBJECTS.map((s) => ({ id: s.id, name: s.name, href: `/subjects/${s.id}`, motif: s.motif, density: s.density, status: s.status, tagline: s.tagline, accent: s.accent1 }))}
    />
  );
}
