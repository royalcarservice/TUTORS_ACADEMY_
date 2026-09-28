import { notFound } from "next/navigation";

import SubjectsSwitchboardLoader from "./loader";

/* DEV-ONLY SUBJECT SWITCHBOARD · /dev/subjects — 404s in production. */
export default function DevSubjectsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <SubjectsSwitchboardLoader />;
}
