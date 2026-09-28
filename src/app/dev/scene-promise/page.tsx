import { notFound } from "next/navigation";

import { MARKERS, PROMISE_COPY, STATE_TEXT, markerStates, type Marker } from "@/components/spine/scenes/promise";
import { STATUS_LABEL, statusFor, type ModuleEntry } from "@/components/spine/scenes/status";
import { PLATFORM_MODULES } from "@/config/modules";
import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { BANNED_PHRASES } from "@/lib/spine/voice";

import { SURFACE, TEXT, contrast } from "../motifs/measure";
import Specimen from "./preview";

/* DEV-ONLY SPECIMEN · /dev/scene-promise — 404s in production (Phase 4 · Step 7).
   ?frame=1&theme=dark|light&done=0|3|7&gray=1 → the bare scene for frames and the harness. */

export type Done = 0 | 3 | 7;
const REG: ModuleEntry[] = PLATFORM_MODULES.map((m) => ({ id: m.id, name: m.name, status: m.status }));

export function statesFor(done: Done): Record<Marker["id"], "done" | "ahead"> {
  if (done === 3) return markerStates(["premise", "difference", "choice", "enter"]);
  const out = {} as Record<Marker["id"], "done" | "ahead">;
  for (const m of MARKERS) out[m.id] = done === 7 ? "done" : "ahead";
  return out;
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean).length;

export const SCENE_BANNED = [
  "unlock your potential", "you have it in you", "every expert was once a beginner", "the only limit is you", "imagine what you could become", "the future is yours", "look how far you've come", "this is just the beginning", "the sky's the limit", "dream big", "believe in yourself", "what if you could",
];
export const PROGRESS_UI_TERMS = ["progress bar", "ring", "dial", "percent", "%", "fraction", "streak", "xp", "points", "level", "tier", "badge", "trophy", "medal", "certificate", "rank", "leaderboard", "of 7"];
export const REWARD_TERMS = ["congratulations", "well done", "you did it", "achievement", "unlocked", "earned", "reward"];

export default async function DevScenePromisePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);
  const sp = await searchParams;
  const frame = sp.frame === "1";
  const theme = sp.theme === "light" ? "light" : "dark";
  const done: Done = sp.done === "0" ? 0 : sp.done === "7" ? 7 : 3;
  const gray = sp.gray === "1";
  const scene = SPINE.find((s) => s.id === "promise")!;

  const status = STATUS_LABEL[statusFor(REG, ["student-portal"])];
  const strings = [PROMISE_COPY.eyebrow, PROMISE_COPY.heading, PROMISE_COPY.lead, PROMISE_COPY.markersLabel, ...MARKERS.flatMap((m) => [m.label]), STATE_TEXT.done, STATE_TEXT.ahead, PROMISE_COPY.mastery, `${status} — ${PROMISE_COPY.masterySubject}.`, PROMISE_COPY.closing];
  const all = [...strings, PROMISE_COPY.leadCandidateB, PROMISE_COPY.masteryCandidate1, PROMISE_COPY.masteryCandidate3].join(" ").toLowerCase();
  const hit = (list: string[]) => list.filter((t) => new RegExp(`(^|[^a-z])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(all));
  const sweeps = {
    progressUi: hit(PROGRESS_UI_TERMS),
    reward: hit(REWARD_TERMS),
    cliche: hit([...SCENE_BANNED, ...BANNED_PHRASES]),
    urgency: (all.match(/\b(20\d\d|q[1-4]|coming soon|soon|waitlist|notify|countdown|hurry|limited|sign up|join now)\b/gi) ?? []),
    numbers: (strings.join(" ").match(/\d+/g) ?? []),
  };
  const budget = {
    lead: { sentences: sentences(PROMISE_COPY.lead), words: words(PROMISE_COPY.lead) },
    mastery: { sentences: sentences(PROMISE_COPY.mastery), words: words(PROMISE_COPY.mastery) },
    markers: MARKERS.map((m) => ({ id: m.id, words: words(m.label) })),
    closing: { sentences: sentences(PROMISE_COPY.closing), words: words(PROMISE_COPY.closing) },
    total: words(strings.join(" ")),
  };
  const contrastRows = (["dark", "light"] as const).map((t) => ({ theme: t, primary: contrast(TEXT.primary[t], SURFACE.base[t]), secondary: contrast(TEXT.secondary[t], SURFACE.base[t]), muted: contrast(TEXT.muted[t], SURFACE.base[t]) }));

  return <Specimen frame={frame} frameTheme={theme} done={done} gray={gray} states={statesFor(done)} scene={scene} strings={strings} sweeps={sweeps} budget={budget} contrastRows={contrastRows} status={status} />;
}
