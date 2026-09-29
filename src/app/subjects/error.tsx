"use client";

import { usePathname } from "next/navigation";

import { HonestPage } from "@/components/state/honest-page";
import { STATE_COPY } from "@/components/state/copy";

/* /subjects SEGMENT ERROR BOUNDARY (Phase 5 · Step 7 · Part 2). Renders
 * INSIDE the subjects layout (nav shell + <main> already there) when an
 * environment page throws — e.g. the enrolment read failed. The environment
 * is the PRIMARY answer: it is never silently absent, so this is the honest
 * page failure with one action, a GET of the same path. Dumb: reads nothing
 * from `error`, never calls `reset()`. */
export default function SubjectsError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;
  const pathname = usePathname() || "/subjects";
  const copy = pathname.startsWith("/subjects/") ? STATE_COPY.environmentFailed : STATE_COPY.pageFailed;
  return <HonestPage state="page-failed" {...copy} action={{ ...copy.action, href: pathname }} />;
}
