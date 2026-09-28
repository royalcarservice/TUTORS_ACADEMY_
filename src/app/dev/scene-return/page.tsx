import { notFound } from "next/navigation";

import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { SUBJECTS } from "@/lib/subjects/subjects";

import Specimen from "./preview";

/* DEV-ONLY SPECIMEN · /dev/scene-return — 404s in production (Phase 4 · Step 8).
   ?frame=scene|footer|both&theme=dark|light&ready=0|real|all&gray=1 */

export type Ready = "0" | "real" | "all";

export function entriesFor(r: Ready) {
  return SUBJECTS.map((s) => ({ id: s.id, name: s.name, status: r === "0" ? "draft" : r === "all" ? "ready" : s.status }));
}

export const BLOCKERS = [
  { item: "Privacy policy", blocks: "Collecting any personal data — sign-up, enrolment, class attendance, recordings.", status: "absent; no route, no draft" },
  { item: "Terms of service", blocks: "Anyone enrolling or paying; tutor onboarding.", status: "absent; no route, no draft" },
  { item: "Contact route", blocks: "A student or parent reaching a human; complaints; data-rights requests.", status: "absent — the foundation footer's hello@tutorsacademy.example address was not a real mailbox and has been removed" },
  { item: "DPDP Act, 2023 (India) review", blocks: "Processing personal data of Indian users at all — and specifically children's data (verifiable parental consent, no tracking/behavioural monitoring of children), which a school-age tutoring platform will hold. FLAG FOR LEGAL REVIEW; no policy copy drafted here.", status: "not started" },
  { item: "Cookies / analytics disclosure", blocks: "Adding any analytics or third-party script. None is present today, so nothing is currently blocked.", status: "not needed yet — becomes a blocker the day analytics is added" },
] as const;

export default async function DevSceneReturnPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);
  const sp = await searchParams;
  const frame = sp.frame === "scene" || sp.frame === "footer" || sp.frame === "both" ? sp.frame : null;
  const theme = sp.theme === "light" ? "light" : "dark";
  const ready: Ready = sp.ready === "0" ? "0" : sp.ready === "all" ? "all" : "real";
  const gray = sp.gray === "1";
  const scene = SPINE.find((s) => s.id === "return")!;
  return <Specimen frame={frame} frameTheme={theme} gray={gray} ready={ready} entries={entriesFor(ready)} entriesZero={entriesFor("0")} scene={scene} blockers={[...BLOCKERS]} />;
}
