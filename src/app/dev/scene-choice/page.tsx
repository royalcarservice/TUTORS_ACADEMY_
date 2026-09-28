import { notFound } from "next/navigation";

import { motifBudget } from "@/components/motif/motif";
import { MAX_COMMANDS, MAX_DOM_NODES, MAX_GEN_MS } from "@/lib/motif/budgets";
import { generateMotif } from "@/lib/motif/grammar";
import type { Density, MotifKind } from "@/lib/motif/types";
import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { SUBJECTS } from "@/lib/subjects/subjects";

import { SURFACE, TEXT, contrast } from "../motifs/measure";
import ChoiceSpecimen from "./preview";

/* DEV-ONLY SCENE SPECIMEN · /dev/scene-choice — 404s in production (Phase 4 · Step 4).
   ?frame=1&theme=dark|light&allReady=1  → renders the bare scene for the width frames.
   ?allReady=1                             → forces every subject to `ready` (composition at
                                             the six-door extreme); the shipped page never does. */

function entriesFor(allReady: boolean) {
  return SUBJECTS.map((s) => ({
    id: s.id,
    name: s.name,
    href: `/subjects/${s.id}`,
    motif: s.motif,
    density: s.density,
    status: allReady ? "ready" : s.status,
    tagline: s.tagline,
  }));
}

function measureBudgets() {
  const rows = SUBJECTS.flatMap((s) =>
    (["specimen", "door"] as const).map((purpose) => {
      const t0 = performance.now();
      const data = generateMotif({ subject: s.id, kind: s.motif as MotifKind, role: "edge", density: s.density as Density, purpose, index: purpose === "door" ? 1 : 0 });
      const ms = Math.round((performance.now() - t0) * 100) / 100;
      return { id: `${s.id} · ${purpose}`, ...motifBudget(data), ms };
    }),
  );
  return rows;
}

export default async function DevSceneChoicePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);
  const sp = await searchParams;
  const allReady = sp.allReady === "1";
  const frame = sp.frame === "1";
  const theme = sp.theme === "light" ? "light" : "dark";

  const scene = SPINE.find((s) => s.id === "choice")!;
  const contrastRows = SUBJECTS.flatMap((s) =>
    (["dark", "light"] as const).map((t) => ({
      id: s.id,
      theme: t,
      name: contrast(TEXT.primary[t], SURFACE.base[t]),
      tagline: contrast(TEXT.secondary[t], SURFACE.base[t]),
      envOnSurface: contrast(t === "dark" ? s.accent1.ink : s.accent1.ivory, SURFACE.base[t]),
      status: contrast(TEXT.muted[t], SURFACE.base[t]),
    })),
  );

  return (
    <ChoiceSpecimen
      scene={scene}
      entries={entriesFor(allReady)}
      entriesReal={entriesFor(false)}
      entriesAllReady={entriesFor(true)}
      specimenEntries={entriesFor(false)}
      allReady={allReady}
      frame={frame}
      frameTheme={theme}
      budgets={measureBudgets()}
      ceilings={{ commands: MAX_COMMANDS, dom: MAX_DOM_NODES, ms: MAX_GEN_MS }}
      contrastRows={contrastRows}
    />
  );
}
