import { createContext, useContext } from "react";

/**
 * Whether the live WebGL sculpture is running.
 *
 * `false` in two situations, and both are deliberate:
 *   · WebGL is unavailable — the browser cannot run it at all.
 *   · `prefers-reduced-motion: reduce` — a scrubbed, continuously moving
 *     sculpture is exactly what the visitor asked not to get.
 *
 * Either way every `[data-sculpture-window]` renders the static composition
 * that belongs to it, so no window on the page is ever an empty box and all
 * content stays reachable.
 */
export interface SculptureMode {
  live: boolean;
}

export const SculptureContext = createContext<SculptureMode>({ live: false });

export const useSculptureMode = () => useContext(SculptureContext);
