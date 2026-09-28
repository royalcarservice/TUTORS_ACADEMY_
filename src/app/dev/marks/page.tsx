import { notFound } from "next/navigation";

import MarksSpecimenLoader from "./loader";

/* DEV-ONLY SUBJECT MARKS SPECIMEN · /dev/marks — 404s in production. */
export default function DevMarksPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MarksSpecimenLoader />;
}
