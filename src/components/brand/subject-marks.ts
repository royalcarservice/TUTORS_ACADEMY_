/* Subject mark geometry (Phase 3 · Step 2). PURE PATH DATA — no colours, no
   config, no subject schema import (the 3.1 guard applies: components consume
   tokens/context only). Colour arrives via currentColor from accent tokens.

   Language: see SUBJECT_MARK_LANGUAGE.md. 32-unit viewBox, stroke 2.5 (≈0.078
   of canvas), round caps/joins, ≤10 path commands per mark.               */

export interface SubjectMarkDef {
  d: string;
  commands: number;
  subpaths: number;
  idea: string; // one-line statement of the idea the mark figures
}

export const SUBJECT_MARKS: Record<string, SubjectMarkDef> = {
  mathematics: {
    // a line that folds into a lattice and returns along itself
    d: "M6 8 H26 L18 16 L26 24 H6 L14 16 L6 8",
    commands: 7, subpaths: 1,
    idea: "structure discovered, not imposed",
  },
  physics: {
    // a line entering as a curve, leaving as a straight vector
    d: "M5 24 C5 12 12 12 16 12 H27",
    commands: 3, subpaths: 1,
    idea: "force changes a path",
  },
  chemistry: {
    // a closed line containing an interior reaction step (2 subpaths, deliberate)
    d: "M7 7 H25 V25 H7 Z M11 18 H15 V12 H20",
    commands: 9, subpaths: 2,
    idea: "a vessel holding a reaction",
  },
  biology: {
    // a line that bifurcates, then rejoins
    d: "M6 16 C10 7 22 7 26 16 C22 25 10 25 6 16",
    commands: 3, subpaths: 1,
    idea: "one origin, many lives",
  },
  english: {
    // a line that begins fluid (hand) and ends constructed (type)
    d: "M6 22 C6 10 15 7 18 13 C20 17 21 18 23 18 H27",
    commands: 4, subpaths: 1,
    idea: "the stroke becomes language",
  },
  history: {
    // a line progressively interrupted — drawn gaps, not dasharray (deliberate)
    d: "M6 9 H26 M6 16 H14 M18 16 H22 M6 23 H12",
    commands: 6, subpaths: 4,
    idea: "an archive with missing years",
  },
};

export const SUBJECT_MARK_IDS = Object.keys(SUBJECT_MARKS);
export const MARK_STROKE = 2.5; // = 0.078 × 32 optical canvas (family class)
