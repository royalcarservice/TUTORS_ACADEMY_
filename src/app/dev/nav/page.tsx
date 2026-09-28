import { notFound } from "next/navigation";

import NavSpecimenLoader from "./loader";

/* DEV-ONLY NAV SPECIMEN · /dev/nav — 404s in production. */
export default function DevNavPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <NavSpecimenLoader />;
}
