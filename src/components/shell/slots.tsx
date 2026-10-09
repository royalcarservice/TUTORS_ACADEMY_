import Link from "next/link";
import type { ReactElement } from "react";

/* ENVIRONMENT SHELL — SLOT REGISTRY (Phase 3 · Step 6; context grown 8.2)
 *
 * THE DOCUMENTED FILL POINT. A later phase fills a named region by adding ONE
 * entry here mapping the region id (see src/config/shell-regions.ts) to a
 * component. The shell renders the registered component instead of the honest
 * placeholder — and `subject-shell.tsx` itself is never edited for features.
 *
 * Phase 8 · Step 2 (DEC-030) fills `recordings-notes` — the archive door.
 * The shell hands each slot the subject it stands in (and the region's own
 * title), because a per-subject door cannot be built without knowing its
 * subject: the contract's one declared growth, recorded rather than hidden.
 */

/** What the shell hands a registered slot. */
export interface ShellSlotContext {
  subjectId: string;
  subjectName: string;
  /** The region's registry title — the slot speaks with the region's voice. */
  regionTitle: string;
}

export const REGION_SLOTS: Record<string, (ctx: ShellSlotContext) => ReactElement> = {
  "recordings-notes": ArchiveDoorSlot,
};

export const hasSlot = (id: string) => id in REGION_SLOTS;

/* THE ARCHIVE DOOR (Phase 8 · Step 2, DEC-030) — the `recordings-notes`
 * region's honest answer once the archive exists: ONE quiet way in, in the
 * registry's own visual grammar. No counts, no thumbnails, no teaser copy —
 * the door names what the archive holds and where it stands. */
const MONO_LABEL: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export const ARCHIVE_DOOR_COPY = {
  heading: "Past sessions",
  line: "What each concluded session leaves behind — the board as it stood, the notation, the chamber's audio — is preserved in the archive.",
  door: "View past sessions",
} as const;

function ArchiveDoorSlot({ subjectId, regionTitle }: ShellSlotContext): ReactElement {
  return (
    <div
      data-archive-door
      style={{
        border: "1px solid var(--ta-border-subtle)",
        borderLeft: "2px solid var(--ta-accent-3)",
        borderRadius: "var(--ta-radius-2)",
        background: "var(--ta-surface-base)",
        padding: "var(--ta-space-4)",
      }}
    >
      <p style={MONO_LABEL}>{regionTitle}</p>
      <h3 style={{ margin: "var(--ta-space-1) 0 0", fontSize: "var(--ta-text-md)", fontWeight: 600, color: "var(--ta-text-primary)" }}>
        {ARCHIVE_DOOR_COPY.heading}
      </h3>
      <p style={{ margin: "var(--ta-space-1) 0 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>
        {ARCHIVE_DOOR_COPY.line}
      </p>
      <p style={{ margin: "var(--ta-space-2) 0 0" }}>
        <Link
          href={`/subjects/${subjectId}/archive`}
          data-archive-door-link
          style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-primary)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}
        >
          {ARCHIVE_DOOR_COPY.door}
        </Link>
      </p>
    </div>
  );
}
