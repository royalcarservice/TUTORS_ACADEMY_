import type { SceneContract } from "@/lib/spine/types";

import { SceneSlot, type SpineSubjectEntry } from "./scene-slot";

/* SPINE RENDERER — renders the homepage from the scene sequence (4.1).

   The page is data: order comes from the contract, not from markup.
   Reordering the story never edits this component. It holds no feature
   logic and imports no scene or subject config — everything arrives as
   props from the route (the guard covers spine configs too).          */

export function HomeSpine({
  scenes,
  subjectEntries,
}: {
  scenes: readonly SceneContract[];
  subjectEntries: SpineSubjectEntry[];
}) {
  const ordered = [...scenes].sort((a, b) => a.order - b.order);
  return (
    <div data-spine>
      {ordered.map((s) => (
        <div
          key={s.id}
          className="ta-container ta-container--content"
          style={{ borderBottom: "1px solid var(--ta-border-subtle)" }}
        >
          <SceneSlot scene={s} entries={subjectEntries} />
        </div>
      ))}
    </div>
  );
}
