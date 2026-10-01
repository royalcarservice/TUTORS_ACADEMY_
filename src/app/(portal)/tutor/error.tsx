"use client";

import { HonestPage } from "@/components/state/honest-page";
import { STATE_COPY } from "@/components/state/copy";

/* /tutor SEGMENT ERROR BOUNDARY (6.2; the 5.7 pattern). Renders
 * INSIDE the tutor layout (room-mode nav + container already there) when
 * the overview or account page throws — e.g. the relationships read failed. The
 * next action is the PRIMARY answer: never a shell with a hole, never state
 * A from a failed read. Dumb: reads nothing from `error`, never `reset()`. */
export default function TutorError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;
  return <HonestPage state="page-failed" bare {...STATE_COPY.tutorFailed} />;
}
