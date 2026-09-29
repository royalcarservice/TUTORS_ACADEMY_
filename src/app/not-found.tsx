import { HonestPage } from "@/components/state/honest-page";
import { STATE_COPY } from "@/components/state/copy";
import { StateFrame } from "@/components/state/state-frame";

/* Global 404 (reviewed Phase 5 · Step 7 · Part 2). The nearest not-found for
 * every segment — /subjects/[nonsense], a draft environment for a student not
 * enrolled in it (same page, on purpose: the draft's existence is not
 * announced), and any unknown path. Brand frame, one h1, one sentence, one
 * action. NOT a second homepage: no portal list, no second CTA, no numeral.
 * KNOWN FRAMEWORK DEFECT (Next 16.3.6, vercel/next.js#99287): when reached
 * via notFound() the document is client-rendered — blank without JS. An
 * unmatched URL is server-rendered. Recorded in PHASE5_STEP7; not ours to fix. */
export default function NotFound() {
  return (
    <StateFrame>
      <HonestPage state="not-found" {...STATE_COPY.notFound} />
    </StateFrame>
  );
}
