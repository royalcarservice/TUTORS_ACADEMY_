import { notFound } from "next/navigation";

import { generateMotif } from "@/lib/motif/grammar";
import { MAX_COMMANDS, MAX_DOM_NODES, MAX_GEN_MS } from "@/lib/motif/budgets";
import { motifBudget } from "@/components/motif/motif";
import type { Density, MotifKind } from "@/lib/motif/types";
import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { SUBJECTS } from "@/lib/subjects/subjects";

import { SURFACE, TEXT, contrast } from "../motifs/measure";
import ScenesSpecimen from "./preview";

/* DEV-ONLY SCENE SPECIMEN · /dev/scenes — 404s in production (Phase 4 · Step 3).
   Scenes 1 and 2 in isolation; six specimens in both themes; grayscale, RM
   and no-JS previews; scroll + motif budgets; copy panel; boundary checklist.
   This route is the sole reader of subject + scene config for the specimen —
   scene components receive everything as props (3.1 guard).            */

/* Timing is measurement, not render logic — kept outside the component body. */
function measureBudgets() {
  return SUBJECTS.map((s) => {
    const t0 = performance.now();
    const data = generateMotif({ subject: s.id, kind: s.motif as MotifKind, role: "edge", density: s.density as Density, purpose: "specimen", index: 0 });
    const ms = Math.round((performance.now() - t0) * 100) / 100;
    return { id: s.id, ...motifBudget(data), ms };
  });
}

export default function DevScenesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);

  const scenes = SPINE.filter((s) => s.id === "premise" || s.id === "difference");
  const entries = SUBJECTS.map((s) => ({ id: s.id, name: s.name, href: `/subjects/${s.id}`, motif: s.motif, density: s.density }));

  /* MOTIF BUDGET READOUT for `/` — the six edge fragments Scene 2 places. */
  const budgets = measureBudgets();

  /* CONTRAST for every specimen text/surface pairing, six subjects × two themes.
     Specimen surface is the flat card = --ta-surface-base. Text tokens do not
     change per subject (that is the point); the accent rule/mark are graphic. */
  const contrastRows = SUBJECTS.flatMap((s) =>
    (["dark", "light"] as const).map((theme) => ({
      id: s.id,
      theme,
      namePrimary: contrast(TEXT.primary[theme], SURFACE.base[theme]),
      captionMuted: contrast(TEXT.muted[theme], SURFACE.base[theme]),
      accentGraphic: contrast(theme === "dark" ? s.accent1.ink : s.accent1.ivory, SURFACE.base[theme]),
    })),
  );

  return (
    <ScenesSpecimen
      scenes={scenes}
      entries={entries}
      budgets={budgets}
      ceilings={{ commands: MAX_COMMANDS, dom: MAX_DOM_NODES, ms: MAX_GEN_MS }}
      contrastRows={contrastRows}
    />
  );
}
