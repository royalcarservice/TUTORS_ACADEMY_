"use client";

import { usePathname } from "next/navigation";

import { HonestPage } from "@/components/state/honest-page";
import { STATE_COPY } from "@/components/state/copy";
import { StateFrame } from "@/components/state/state-frame";

/* ROOT ERROR BOUNDARY (Phase 5 · Step 7 · Part 2). Reached when a render
 * OUTSIDE the subjects/student segments throws (or when a segment LAYOUT
 * throws — segment boundaries only cover their page). A DUMB client
 * component: static copy and a plain link to the same path (a GET — reading
 * again is safe). It does NOT read `error.message`, print a digest, call
 * `reset()` or retry anything. Kept deliberately small: it ships on EVERY
 * route, so it carries the brand mark, not the whole nav shell (the segment
 * boundaries render inside their layouts, which already have it). */
export default function RootError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  void error; // nothing about the error reaches the page (P5-R8.6)
  const pathname = usePathname() || "/";
  const copy = { ...STATE_COPY.pageFailed, action: { ...STATE_COPY.pageFailed.action, href: pathname } };
  return (
    <StateFrame>
      <HonestPage state="page-failed" {...copy} />
    </StateFrame>
  );
}
