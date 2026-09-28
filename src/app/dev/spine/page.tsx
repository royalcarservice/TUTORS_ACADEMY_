import { notFound } from "next/navigation";

import { SPINE, totalScrollBudget, validateSpine } from "@/lib/spine/scenes";
import { SUBJECTS } from "@/lib/subjects/subjects";

import SpineSpecimen from "./preview";

/* DEV-ONLY SPINE SPECIMEN · /dev/spine — 404s in production.
   The structure you judge BEFORE any art is made. */

export default function DevSpinePage() {
  if (process.env.NODE_ENV === "production") notFound();

  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);

  return (
    <SpineSpecimen
      scenes={[...SPINE]}
      total={totalScrollBudget(SPINE)}
      subjects={SUBJECTS.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
