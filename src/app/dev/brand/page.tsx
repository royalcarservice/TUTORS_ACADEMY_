import { notFound } from "next/navigation";

import BrandSpecimenLoader from "./loader";

/* DEV-ONLY BRAND SPECIMEN · /dev/brand — 404s in production. */
export default function DevBrandPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <BrandSpecimenLoader />;
}
