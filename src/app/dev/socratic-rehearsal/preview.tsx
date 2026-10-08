"use client";

import { useState } from "react";

import { SocraticLens } from "@/components/socratic/socratic-lens";
import type { ArtifactRecord } from "@/lib/archive/artifact";
import { PROMPT_TYPE_OF_GUIDANCE } from "@/lib/socratic/contract";
import type { ExchangeRecord } from "@/lib/socratic/data";
import { milestoneKeysFor, scaffoldFor } from "@/lib/socratic/resolver";

/* THE REHEARSAL PROPER — the lens with specimen facts (DEC-034). */

const SUBJECT_ID = "physics";
const SUBJECT_NAME = "Physics";

/* Specimen artifacts: one Session Notation with a readable summary and one
   Board Record — the engine's citation rule prefers the notation. */
const SPECIMEN_ARTIFACTS: readonly ArtifactRecord[] = [
  {
    id: "spec-notes-1",
    sessionId: "spec-sess-1",
    subjectId: SUBJECT_ID,
    type: "pedagogical_notes",
    storagePath: `${SUBJECT_ID}/spec-sess-1/spec-notes-1`,
    metadata: { summary: "Restoring force first, then the energy trade." },
    createdAt: "2026-09-24T11:05:00.000Z",
  },
  {
    id: "spec-board-1",
    sessionId: "spec-sess-1",
    subjectId: SUBJECT_ID,
    type: "canvas_snapshot",
    storagePath: `${SUBJECT_ID}/spec-sess-1/spec-board-1`,
    metadata: {},
    createdAt: "2026-09-24T11:00:00.000Z",
  },
];

/* One specimen exchange already on the log — the shape persistence writes
   (payload enriched with the citation's word and date). */
const SPECIMEN_EXCHANGE: ExchangeRecord = {
  id: "spec-exchange-1",
  milestoneKey: "physics:harmonic-motion",
  promptType: "socratic_question",
  queryText: "Why does the period not depend on the amplitude?",
  createdAt: "2026-09-24T12:00:00.000Z",
  guidance: [
    {
      type: "question",
      text: "Where in the oscillation is the restoring force greatest, and what is the velocity doing at that same instant?",
    },
    {
      type: "hint",
      text: "Harmonic motion is what happens when a restoring force grows in proportion to the displacement it answers: the further the system strays, the harder it is pulled back. Energy trades between two stores, kinetic and potential, twice each cycle.",
    },
    {
      type: "reference",
      text: "Derive the period of a mass on a spring from Newton's second law: set the restoring force equal to mass times acceleration, and show the motion satisfies the equation whose solutions are sines and cosines.",
    },
    {
      type: "reference",
      text: "Your own Session Notation of 2026-09-24 stands in the archive beside this stage. Open it, and read the record before you answer.",
      referencedArtifactId: "spec-notes-1",
      artifactWord: "Session Notation",
      artifactDate: "2026-09-24",
    },
  ],
};

const OPTIONS = milestoneKeysFor(SUBJECT_ID).map((key) => ({
  key,
  path: scaffoldFor(SUBJECT_ID, key)?.path ?? key,
}));

export function SocraticRehearsalPreview() {
  const [exchanges, setExchanges] = useState<readonly ExchangeRecord[]>([SPECIMEN_EXCHANGE]);
  const [count, setCount] = useState(1);

  return (
    <SocraticLens
      subjectId={SUBJECT_ID}
      subjectName={SUBJECT_NAME}
      exchanges={exchanges}
      options={OPTIONS}
      rehearsalComposer={{
        artifacts: SPECIMEN_ARTIFACTS,
        onReflect: (entry) => {
          const next = count + 1;
          setCount(next);
          const record: ExchangeRecord = {
            id: `rehearsal-${next}`,
            milestoneKey: entry.milestoneKey,
            promptType: PROMPT_TYPE_OF_GUIDANCE[entry.guidance[0].type],
            queryText: entry.queryText,
            createdAt: "2026-10-08T09:00:00.000Z", // specimen instant — the rehearsal reads no clock
            guidance: entry.guidance,
          };
          setExchanges([record, ...exchanges]);
        },
      }}
    />
  );
}
