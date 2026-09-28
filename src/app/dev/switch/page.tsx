import { notFound } from "next/navigation";

import { SUBJECTS } from "@/lib/subjects/subjects";

import SwitchSpecimen from "./preview";

/* DEV-ONLY SUBJECT SWITCH SPECIMEN · /dev/switch — 404s in production.

   NO-JS / SSR CORRECTNESS: the current subject environment is rendered by the
   SERVER below (SubjectSwitchSurface renders its initial layer server-side);
   the switch is progressive enhancement layered on top. A direct load shows a
   correct, static environment with NO transition and no client JS required.   */

export default function DevSwitchPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const subjects = SUBJECTS.map((s) => ({
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    motif: s.motif,
    density: s.density,
    accent: s.accent1,
  }));

  return <SwitchSpecimen subjects={subjects} initialId="mathematics" />;
}
