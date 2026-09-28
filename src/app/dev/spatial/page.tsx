import { notFound } from "next/navigation";

import SpatialSpecimenLoader from "./loader";

/* DEV-ONLY SPATIAL SPECIMEN · /dev/spatial — 404s in production. */
export default function DevSpatialPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <SpatialSpecimenLoader />;
}
