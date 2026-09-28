#!/usr/bin/env node
/* GUARD TEST (Phase 3 · Step 1 · Part 4).
   No component may import a subject CONFIG or a scene CONFIG directly — components consume
   TOKENS ([data-subject]) and the SubjectContext ONLY. The scoping layer
   (src/lib/subjects/*) and the dev switchboard are the sole readers.
   This scans src/components for a direct config import and EXITS NON-ZERO.
   usage: node scripts/check-subject-imports.mjs                          */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "src/components");
const BAD = /from\s+["'](@\/lib\/subjects\/(subjects)|@\/lib\/spine\/(scenes)|(\.\.?\/)+subjects)["']/;

const files = [];
const walk = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mts|cts)$/.test(n)) files.push(p);
  }
};
walk(dir);

let fails = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (BAD.test(src)) {
    console.error(`✗ GUARD ${f}: direct subject/scene-config import (consume props or context)`);
    fails++;
  }
}
if (fails) { console.error(`\n✗ subject-import guard: ${fails} violation(s)`); process.exit(1); }
console.log("✓ subject-import guard: no component imports a subject config directly");
