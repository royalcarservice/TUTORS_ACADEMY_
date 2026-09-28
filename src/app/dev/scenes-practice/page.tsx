import { notFound } from "next/navigation";

import { PEOPLE_COPY } from "@/components/spine/scenes/people";
import { BEATS, PRACTICE_COPY, nextInOrder } from "@/components/spine/scenes/practice";
import { STATUS_LABEL, STATUS_RULES, statusFor, type ModuleEntry } from "@/components/spine/scenes/status";
import { PLATFORM_MODULES } from "@/config/modules";
import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { BANNED_PHRASES } from "@/lib/spine/voice";

import { SURFACE, TEXT, contrast } from "../motifs/measure";
import Specimen from "./preview";

/* DEV-ONLY SPECIMEN · /dev/scenes-practice — 404s in production (Phase 4 · Step 6).
   ?frame=people|practice&theme=dark|light&rm=1&state=live|foundation|next
     → the bare scene for the width frames and the harness (state forces the
       derived module statuses to one value — the shipped page never forces). */

export type Force = "live" | "foundation" | "next" | null;

const REG: ModuleEntry[] = PLATFORM_MODULES.map((m) => ({ id: m.id, name: m.name, status: m.status }));

export function modulesFor(force: Force): ModuleEntry[] {
  if (!force) return REG;
  const st = force === "live" ? "live" : force === "foundation" ? "in-progress" : "planned";
  return REG.map((m) => ({ ...m, status: st }));
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean).length;

export default async function DevScenesPracticePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);
  const sp = await searchParams;
  const frame = sp.frame === "people" || sp.frame === "practice" ? sp.frame : null;
  const theme = sp.theme === "light" ? "light" : "dark";
  const force: Force = sp.state === "live" || sp.state === "foundation" || sp.state === "next" ? sp.state : null;

  const people = SPINE.find((s) => s.id === "people")!;
  const practice = SPINE.find((s) => s.id === "practice")!;

  /* Copy budget readout (authored strings only; labels/eyebrows/status words excluded from the sentence budget but included in totals). */
  const peopleLines = [`Five things are theirs to set: accent, atmosphere, motif, motion character, density.`, PEOPLE_COPY.lines[1], `${STATUS_LABEL[statusFor(REG, ["tutor-portal"])]} — ${PEOPLE_COPY.statusSubject.toLowerCase()}.`];
  const consolidated = `${PRACTICE_COPY.consolidatedLive} ${PRACTICE_COPY.consolidatedNextPrefix} ${nextInOrder(REG).join(", ")}.`;
  const budget = {
    people: {
      leadSentences: sentences(PEOPLE_COPY.lead),
      lines: peopleLines.length,
      words: words([PEOPLE_COPY.eyebrow, PEOPLE_COPY.heading, PEOPLE_COPY.lead, ...peopleLines].join(" ")),
    },
    practice: {
      beats: BEATS.map((b) => ({ id: b.id, sentences: sentences(b.text), words: words(b.text) })),
      consolidatedSentences: sentences(consolidated),
      consolidatedWords: words(consolidated),
      words: words([PRACTICE_COPY.eyebrow, PRACTICE_COPY.heading, PRACTICE_COPY.lead, ...BEATS.flatMap((b) => [`${BEATS.indexOf(b) + 1} of 4`, b.label, b.text, STATUS_LABEL[statusFor(REG, b.modules)]]), consolidated, PRACTICE_COPY.outro].join(" ")),
    },
  };

  const all = [PEOPLE_COPY.heading, PEOPLE_COPY.lead, ...peopleLines, PRACTICE_COPY.heading, PRACTICE_COPY.lead, ...BEATS.flatMap((b) => [b.label, b.text]), consolidated, PRACTICE_COPY.outro].join(" ").toLowerCase();
  const banned = BANNED_PHRASES.filter((p) => all.includes(p.toLowerCase()));
  const urgency = /\b(20\d\d|q[1-4]\b|coming soon|soon|waitlist|notify|countdown|hurry|limited|today only|sign up|join now)\b/i;
  const urgencyHits = all.match(new RegExp(urgency.source, "gi")) ?? [];

  const contrastRows = (["dark", "light"] as const).map((t) => ({
    theme: t,
    primary: contrast(TEXT.primary[t], SURFACE.base[t]),
    secondary: contrast(TEXT.secondary[t], SURFACE.base[t]),
    muted: contrast(TEXT.muted[t], SURFACE.base[t]),
  }));

  return (
    <Specimen
      frame={frame}
      frameTheme={theme}
      force={force}
      modules={modulesFor(force)}
      registry={REG}
      people={people}
      practice={practice}
      budget={budget}
      banned={banned}
      urgencyHits={urgencyHits.filter((h) => h.toLowerCase() !== "today")}
      statusLabels={STATUS_LABEL}
      statusRules={[...STATUS_RULES]}
      contrastRows={contrastRows}
      copy={{
        people: { leadA: PEOPLE_COPY.lead, leadB: PEOPLE_COPY.leadCandidateB, lines: peopleLines },
        practice: {
          leadA: PRACTICE_COPY.lead,
          leadB: PRACTICE_COPY.leadCandidateB,
          beats: BEATS.map((b) => ({ id: b.id, label: b.label, shipped: b.text, alt: b.alt })),
          consolidatedA: consolidated,
          consolidatedB: PRACTICE_COPY.consolidatedCandidateB,
          outro: PRACTICE_COPY.outro,
        },
      }}
    />
  );
}
