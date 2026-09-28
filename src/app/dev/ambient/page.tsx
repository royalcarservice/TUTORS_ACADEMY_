import { notFound } from "next/navigation";

import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";

import AmbientSpecimen from "./preview";

/* DEV-ONLY AMBIENT SPECIMEN · /dev/ambient — 404s in production.

   ONE SUBJECT in full depth (Mathematics). The other five get recommendations
   on the page, not code. NO-JS: the SVG substrate renders server-side as the
   baseline; the WebGL lens is progressive enhancement, lazy-loaded.         */

export default function DevAmbientPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const math = getSubject("mathematics") ?? SUBJECTS[0];
  const subject = {
    id: math.id,
    name: math.name,
    motif: math.motif,
    density: math.density,
    motionChar: math.motionChar,
    accent: math.accent1,
  };

  return <AmbientSpecimen subject={subject} />;
}
