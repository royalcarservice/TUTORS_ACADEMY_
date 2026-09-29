"use client";

import { HonestPage } from "@/components/state/honest-page";
import { STATE_COPY } from "@/components/state/copy";

/* /student SEGMENT ERROR BOUNDARY (Phase 5 · Step 7 · Part 2). Renders
 * INSIDE the student layout (room-mode nav + container already there) when
 * the overview or account page throws — e.g. the enrolments read failed. The
 * next action is the PRIMARY answer: never a shell with a hole, never state
 * A from a failed read. Dumb: reads nothing from `error`, never `reset()`. */
export default function StudentError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;
  return <HonestPage state="page-failed" bare {...STATE_COPY.studentFailed} />;
}
