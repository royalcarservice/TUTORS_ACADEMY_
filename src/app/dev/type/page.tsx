import { notFound } from "next/navigation";

import TypeSpecimenLoader from "./loader";

/*
 * DEV-ONLY TYPE SPECIMEN · /dev/type
 * In production this resolves to notFound() (404) so it cannot ship.
 */
export default function DevTypePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <TypeSpecimenLoader />;
}
