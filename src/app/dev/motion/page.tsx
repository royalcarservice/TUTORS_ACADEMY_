import { notFound } from "next/navigation";

import MotionSpecimenLoader from "./loader";

/* DEV-ONLY MOTION SPECIMEN · /dev/motion — 404s in production. */
export default function DevMotionPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MotionSpecimenLoader />;
}
