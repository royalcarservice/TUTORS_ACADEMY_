import { reduceDensity } from "@/lib/motif/budgets";
import type { Density, MotifKind, MotifRole } from "@/lib/motif/types";
import { Motif, isRoleAllowed, type ExcludeRect } from "./motif";

/* ════════════════════════════════════════════════════════════════════════
   PART 6 — STAGE AND ROOM (Phase 3 · Step 3)

   The 3.1 roomMood rule, ENCODED IN THE RENDERER rather than in convention:

     Stage(subject) — substrate permitted, full density, ambient later (3.4).
     Room(subject)  — substrate DISABLED (type-level AND runtime), density
                      reduced one step, accent identity RETAINED.

   A Room nested in a Stage inherits the accent (the same [data-subject]
   scope, so no second colour source) but never the substrate: Room simply has
   no substrate code path. The refusal happens twice — the `RoomMotifRole`
   type excludes "substrate" | "transition", and `isRoleAllowed("room", role)`
   in motif.tsx returns false so `<Motif>` renders nothing.
   ════════════════════════════════════════════════════════════════════════ */

/**
 * DEFAULT CONTENT EXCLUSION — the reading column. A motif is never allowed
 * beneath text, so the substrate is masked out of this region by default.
 * Fractions of the composition box, not pixels, so it is viewport-independent.
 */
export const READING_COLUMN: ExcludeRect = { x: 0.05, y: 0.1, w: 0.66, h: 0.8 };

export interface StageProps {
  subject: string;
  motif: MotifKind;
  density: Density;
  children: React.ReactNode;
  /** Set false for a bare Stage (no structural field). */
  substrate?: boolean;
  purpose?: string;
  index?: number;
  /** Content region to keep clear. Pass `false` only for text-free Stages. */
  textRegion?: ExcludeRect | false;
  className?: string;
  style?: React.CSSProperties;
}

/** Full-bleed, cinematic. Owns the edges. May contain Rooms. */
export function Stage({
  subject,
  motif,
  density,
  children,
  substrate = true,
  purpose = "substrate",
  index = 0,
  textRegion = READING_COLUMN,
  className,
  style,
}: StageProps) {
  return (
    <div
      data-subject={subject}
      data-spatial="stage"
      className={className}
      style={{ position: "relative", isolation: "isolate", overflow: "clip", ...style }}
    >
      {substrate && (
        <Motif
          subject={subject}
          kind={motif}
          role="substrate"
          density={density}
          scope="stage"
          purpose={purpose}
          index={index}
          exclude={textRegion ? [textRegion] : []}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

/** The roles a Room may hold. Substrate and transition do not exist here. */
export type RoomMotifRole = Exclude<MotifRole, "substrate" | "transition">;

export interface RoomProps {
  subject: string;
  motif: MotifKind;
  density: Density;
  children: React.ReactNode;
  /** edge | divider | focus — anything else is a type error. */
  role?: RoomMotifRole;
  edgeSide?: "left" | "right";
  purpose?: string;
  index?: number;
  textRegion?: ExcludeRect | false;
  className?: string;
  style?: React.CSSProperties;
}

/** Contained, calm. Never breaks the container; never holds Stage content. */
export function Room({
  subject,
  motif,
  density,
  children,
  role = "edge",
  edgeSide = "right",
  purpose = "room",
  index = 0,
  textRegion = READING_COLUMN,
  className,
  style,
}: RoomProps) {
  // roomMood: reduce. One step calmer than the Stage, accent retained.
  const roomDensity = reduceDensity(density);
  // Runtime half of the enforcement (the type is the other half).
  const allowed = isRoleAllowed("room", role);

  return (
    <div
      data-subject={subject}
      data-spatial="room"
      className={className}
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "clip",
        background: "var(--ta-surface-raised)",
        border: "1px solid var(--ta-border-subtle)",
        borderRadius: "var(--ta-radius-3)",
        padding: "var(--ta-pad-card)",
        ...style,
      }}
    >
      {allowed && (
        <Motif
          subject={subject}
          kind={motif}
          role={role}
          density={roomDensity}
          scope="room"
          purpose={purpose}
          index={index}
          edgeSide={edgeSide}
          exclude={textRegion ? [textRegion] : []}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
