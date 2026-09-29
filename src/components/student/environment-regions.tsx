import { PLATFORM_MODULES } from "@/config/modules";
import { ENVIRONMENT_REGIONS, ENVIRONMENT_SLOTS, type EnvironmentRegion } from "@/config/student-slots";
import type { EnvironmentFacts, ProgressEvent } from "@/lib/progress";

import { resolveArc } from "./arc-region";

/* STUDENT REGIONS INSIDE AN ENVIRONMENT (Phase 5 · Step 5 · Part 5)
 *
 * The second scope of 5.3's slot map. Rendered by the environment page ONLY
 * for the signed-in, enrolled student — a visitor's HTML never contains
 * [data-student-region]. Each slot is gated twice: by src/config/modules
 * (the module must be `live`) and by data (the resolver must return an
 * element). Today every slot resolves to null, so this component renders
 * NOTHING — not a heading, not a box. 3.6's honest labels remain the single
 * honest statement about what is not built.
 */

export interface ResolvedEnvironmentSlot {
  id: string;
  region: EnvironmentRegion;
  element: React.ReactNode;
}

const isLive = (moduleId: string) => PLATFORM_MODULES.some((m) => m.id === moduleId && m.status === "live");
export const liveModuleIds = () => PLATFORM_MODULES.filter((m) => m.status === "live").map((m) => m.id);

/** What a resolver may read: the student's facts for THIS environment, already RLS-bounded by the page. */
export interface SlotContext {
  subjectId: string;
  subjectName: string;
  facts: EnvironmentFacts;
  /** Progress events for this student. `[]` in production today — there is no table (5.1 amendment pending). */
  events: readonly ProgressEvent[];
  liveModules: readonly string[];
}
export type SlotResolver = (ctx: SlotContext) => React.ReactNode | null;

/**
 * Resolve the environment slots for one subject. Resolvers are looked up by
 * slot id. A slot gated "module-live" (the default) is never even asked while
 * its module is not live; a slot gated "facts" (5.6, the arc only) is asked
 * and gates its own later parts on `ctx.liveModules`. Returns only slots with
 * an element.
 */
export function resolveEnvironmentSlots(
  ctx: SlotContext,
  resolvers: Partial<Record<string, SlotResolver>> = ENVIRONMENT_SLOT_RESOLVERS,
): ResolvedEnvironmentSlot[] {
  const out: ResolvedEnvironmentSlot[] = [];
  for (const def of ENVIRONMENT_SLOTS) {
    if ((def.gate ?? "module-live") === "module-live" && !isLive(def.module)) continue;   // REGISTRY GATE
    const r = resolvers[def.id];
    const element = r ? r(ctx) : null;
    if (element) out.push({ id: def.id, region: def.region, element });
  }
  return out;
}

/** THE FILL POINT for the environment scope. One entry: the arc (5.6). Every other capability is absent. */
export const ENVIRONMENT_SLOT_RESOLVERS: Partial<Record<string, SlotResolver>> = {
  progress: (ctx) => resolveArc(ctx.facts, ctx.events, ctx.liveModules, ctx.subjectName),
};

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 };

export function EnvironmentRegions({ slots }: { slots: ResolvedEnvironmentSlot[] }) {
  if (slots.length === 0) return null;
  const regions = (Object.keys(ENVIRONMENT_REGIONS) as EnvironmentRegion[])
    .filter((r) => r !== "threshold")
    .sort((a, b) => ENVIRONMENT_REGIONS[a].order - ENVIRONMENT_REGIONS[b].order)
    .map((r) => ({ region: r, items: slots.filter((s) => s.region === r) }))
    .filter((x) => x.items.length > 0);
  return (
    <div data-student-regions style={{ display: "grid", gap: "var(--ta-space-stack)" }}>
      {regions.map(({ region, items }) => (
        <section key={region} data-student-region={region} aria-labelledby={`student-region-${region}`}>
          <h3 id={`student-region-${region}`} style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{ENVIRONMENT_REGIONS[region].title}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
            {items.map((x) => <div key={x.id} data-slot={x.id}>{x.element}</div>)}
          </div>
        </section>
      ))}
    </div>
  );
}
