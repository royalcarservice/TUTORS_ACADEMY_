import { notFound } from "next/navigation";

import PrimitivesSpecimenLoader from "./loader";

/* DEV-ONLY PRIMITIVES SPECIMEN · /dev/primitives — 404s in production. */
export default function DevPrimitivesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PrimitivesSpecimenLoader />;
}
