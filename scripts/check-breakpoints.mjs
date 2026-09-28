#!/usr/bin/env node
/**
 * BREAKPOINT DRIFT CHECK (Phase 2 · Step 4).
 *
 * CSS custom properties cannot be used inside media queries, so the canonical
 * band values live in src/lib/spatial.ts and are mirrored as literal
 * min-width values in src/app/globals.css. This script fails loudly if ANY
 * width used in a min/max-width media query (CSS or TSX) is not in the
 * canonical BREAKPOINTS list, or if the two files disagree.
 *
 *   usage: node scripts/check-breakpoints.mjs
 *   exit 0 = in sync · exit 1 = drift
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

// 1. canonical set from spatial.ts
const spatial = readFileSync(join(root, "src/lib/spatial.ts"), "utf8");
const canonical = new Set(
  [...spatial.matchAll(/min:\s*(\d+)/g)].map((m) => Number(m[1])),
);

// 2. collect candidate files (css + tsx/ts), skip node_modules/.next
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", "dist", "out"].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(css|tsx?|mts|cts)$/.test(name)) files.push(p);
  }
};
walk(join(root, "src"));

const toPx = (v) => {
  const n = parseFloat(v);
  if (v.endsWith("rem")) return n * 16;
  if (v.endsWith("em")) return n * 16;
  return n; // px
};

let failures = 0;
const mediaRe = /\((?:min|max)-width:\s*([^)]+)\)/g;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(mediaRe)) {
    const px = toPx(m[1].trim());
    if (Number.isNaN(px)) continue; // template literal (e.g. spatial.ts mediaUp)
    if (px === 0) continue; // xs floor is 0, allowed
    if (!canonical.has(px)) {
      console.error(`DRIFT ${f}: media width ${m[1].trim()} (=${px}px) not in canonical [${[...canonical].join(", ")}]`);
      failures++;
    }
  }
}

// 3. CSS must actually use every non-zero canonical band (the pair is live)
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
for (const v of canonical) {
  if (v === 0) continue;
  if (!css.includes(`min-width: ${v}px`)) {
    console.error(`MISSING ${v}px band is not present in globals.css media queries`);
    failures++;
  }
}

if (failures) {
  console.error(`\n✗ breakpoint drift: ${failures} problem(s)`);
  process.exit(1);
}
console.log(`✓ breakpoints in sync — canonical [${[...canonical].sort((a, b) => a - b).join(", ")}]`);
