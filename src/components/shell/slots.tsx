import type { ReactElement } from "react";

/* ENVIRONMENT SHELL — SLOT REGISTRY (Phase 3 · Step 6)
 *
 * THE DOCUMENTED FILL POINT. A later phase fills a named region by adding ONE
 * entry here mapping the region id (see src/config/shell-regions.ts) to a
 * component. The shell renders the registered component instead of the honest
 * placeholder — and `subject-shell.tsx` itself is never edited for features.
 *
 * Right now the registry is intentionally EMPTY: nothing is built, and the
 * shell says so plainly.
 */

export const REGION_SLOTS: Record<string, () => ReactElement> = {};

export const hasSlot = (id: string) => id in REGION_SLOTS;
