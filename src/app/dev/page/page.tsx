import { readFileSync } from "node:fs";
import { join } from "node:path";

import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { HomeSpine } from "@/components/spine/home-spine";
import { SPINE, validateSpine } from "@/lib/spine/scenes";
import { PAGE_SCROLL_CEILING } from "@/lib/spine/types";
import { SUBJECTS } from "@/lib/subjects/subjects";

import Gate from "./preview";

/* DEV-ONLY · /dev/page — PHASE 4 GATE (Step 4.9). 404s in production.

   This route is a READ-OUT, not a builder. Everything numeric on it comes
   from `audit/baseline.json` (written by `node audit/page.cjs --write`) and
   `audit/lighthouse-page.json`; the two players (second pass, fast skim)
   drive a same-origin iframe of `/` live. Nothing here changes the page.

   ?frame=spine&order=default|swap  — renders the real HomeSpine + SiteFooter
   with the contract's `order` values permuted, to prove the spine is data
   (used by the "spine is data" proof panel and by the verification matrix). */

function readJson<T>(rel: string): T | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), rel), "utf8")) as T;
  } catch {
    return null;
  }
}

export default async function DevPageGate({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const errors = validateSpine(SPINE);
  if (errors.length) throw new Error(`[spine] invalid: ${errors.join("; ")}`);
  const sp = await searchParams;

  const entries = SUBJECTS.map((s) => ({ id: s.id, name: s.name, href: `/subjects/${s.id}`, motif: s.motif, density: s.density, status: s.status, tagline: s.tagline, accent: s.accent1 }));

  if (sp.frame === "spine") {
    /* Permute `order` only — the contract objects are otherwise untouched.
       swap: the last two scenes exchange places (promise ↔ return). */
    const swap = sp.order === "swap";
    const scenes = swap
      ? SPINE.map((s) => (s.id === "promise" ? { ...s, order: 8 } : s.id === "return" ? { ...s, order: 7 } : s))
      : SPINE;
    return (
      <div data-dev-spine-frame data-order={swap ? "swap" : "default"}>
        <main id="main">
          <HomeSpine scenes={scenes} subjectEntries={entries} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const baseline = readJson<Record<string, unknown>>("audit/baseline.json");
  const lighthouse = readJson<Record<string, unknown>>("audit/lighthouse-page.json");

  return (
    <Gate
      baseline={baseline}
      lighthouse={lighthouse}
      ceiling={PAGE_SCROLL_CEILING}
      contract={SPINE.map((s) => ({ id: s.id, order: s.order, name: s.name, status: s.status, scrollBehaviour: s.scrollBehaviour, scrollBudget: s.scrollBudget, pins: s.pins, accentUse: s.accentUse, anchorId: s.anchorId ?? null }))}
    />
  );
}
