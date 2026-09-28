import type { ComponentType } from "react";

import { ArrivalScene } from "./scenes/arrival";
import { ChoiceScene } from "./scenes/choice";
import { DifferenceScene } from "./scenes/difference";
import { EnterScene } from "./scenes/enter";
import { PeopleScene } from "./scenes/people";
import { PracticeScene } from "./scenes/practice";
import { PromiseScene } from "./scenes/promise";
import { ReturnScene } from "./scenes/return";
import { PremiseScene } from "./scenes/premise";

/* SPINE — SCENE SLOT REGISTRY (Phase 4 · Step 2)

   The documented fill point for authored scenes, mirroring 3.6's region
   slots: each later Phase 4 step registers ONE scene here. The generic
   SceneSlot renders the registered component instead of the skeleton;
   the spine, contract and other scenes are never edited for it.      */

/* Authored scenes receive the route-supplied subject entries (id, name,
   motif, density) as PROPS — never a config import (the 3.1 guard). */
export interface SceneSlotProps {
  entries?: { id: string; name: string; href: string; motif?: string; density?: string; status?: string; tagline?: string; accent?: { ink: string; ivory: string } }[];
}

export const SCENE_SLOTS: Record<string, ComponentType<SceneSlotProps>> = {
  arrival: ArrivalScene,
  premise: PremiseScene,
  difference: DifferenceScene,
  choice: ChoiceScene,
  enter: EnterScene,
  people: PeopleScene,
  practice: PracticeScene,
  promise: PromiseScene,
  return: ReturnScene,
};
