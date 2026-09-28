import { notFound } from "next/navigation";

import { motifBudget } from "@/components/motif/motif";
import { MAX_COMMANDS, MAX_DOM_NODES, MAX_GEN_MS } from "@/lib/motif/budgets";
import { generateMotif } from "@/lib/motif/grammar";
import type { Density, MotifKind } from "@/lib/motif/types";
import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { SUBJECTS } from "@/lib/subjects/subjects";

import { SURFACE, TEXT, contrast } from "../motifs/measure";
import EnterSpecimen from "./preview";

/* DEV-ONLY SCENE SPECIMEN · /dev/scene-enter — 404s in production (Phase 4 · Step 5).
   ?frame=1&theme=dark|light&subject=<id>&force=ready|draft&rm=1
     → the bare scene (with the spine's sticky section) for the width frames and the harness.
   ?force=ready|draft → both CTA extremes; the shipped page never forces anything. */

export type Force = "ready" | "draft" | null;

function entriesFor(force: Force) {
  return SUBJECTS.map((s) => ({
    id: s.id,
    name: s.name,
    href: `/subjects/${s.id}`,
    motif: s.motif,
    density: s.density,
    status: force === "ready" ? "ready" : force === "draft" ? "draft" : s.status,
    tagline: s.tagline,
    accent: s.accent1,
  }));
}

/* `/` motif budget: Scene 2 (6 edge specimens) + Scene 3 (6 edge doors) + Scene 4 (ONE substrate at
   a time; TWO during TRANSFER). Reported per surface and as the page's live total. */
function measureBudgets() {
  const rows: { id: string; scene: string; elements: number; domNodes: number; commands: number; ms: number }[] = [];
  for (const s of SUBJECTS) {
    for (const [scene, role, purpose, index] of [
      ["Scene 2", "edge", "specimen", 0],
      ["Scene 3", "edge", "door", 1],
      ["Scene 4", "substrate", "switch", 0],
    ] as const) {
      const t0 = performance.now();
      const data = generateMotif({ subject: s.id, kind: s.motif as MotifKind, role, density: s.density as Density, purpose, index });
      const ms = Math.round((performance.now() - t0) * 100) / 100;
      rows.push({ id: `${s.id} · ${purpose}`, scene, ...motifBudget(data), ms });
    }
  }
  return rows;
}

export default async function DevSceneEnterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);
  const sp = await searchParams;
  const force: Force = sp.force === "ready" ? "ready" : sp.force === "draft" ? "draft" : null;
  const frame = sp.frame === "1";
  const theme = sp.theme === "light" ? "light" : "dark";
  const subject = typeof sp.subject === "string" && SUBJECTS.some((s) => s.id === sp.subject) ? sp.subject : undefined;

  const scene = SPINE.find((s) => s.id === "enter")!;
  const contrastRows = SUBJECTS.flatMap((s) =>
    (["dark", "light"] as const).map((t) => ({
      id: s.id,
      theme: t,
      name: contrast(TEXT.primary[t], SURFACE.base[t]),
      tagline: contrast(TEXT.secondary[t], SURFACE.base[t]),
      envOnSurface: contrast(t === "dark" ? s.accent1.ink : s.accent1.ivory, SURFACE.base[t]),
      muted: contrast(TEXT.muted[t], SURFACE.base[t]),
    })),
  );

  return (
    <EnterSpecimen
      scene={scene}
      entries={entriesFor(force)}
      entriesReal={entriesFor(null)}
      entriesAllReady={entriesFor("ready")}
      entriesAllDraft={entriesFor("draft")}
      force={force}
      frame={frame}
      frameTheme={theme}
      frameSubject={subject}
      budgets={measureBudgets()}
      ceilings={{ commands: MAX_COMMANDS, dom: MAX_DOM_NODES, ms: MAX_GEN_MS }}
      contrastRows={contrastRows}
    />
  );
}
