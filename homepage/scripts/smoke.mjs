/* ════════════════════════════════════════════════════════════════════════
   SMOKE TEST — the sculpture's layout + choreography math

   These two modules are the whole of the scroll-driven 3D: `layouts.ts`
   decides where every mesh sits in each state, `choreography.ts` turns a
   scrubbed scroll position into the state blend, camera travel and slot grid.
   This runs the REAL modules — transpiled with the project's own TypeScript —
   and asserts the invariants the render loop depends on.

   Run: npm run smoke
   ════════════════════════════════════════════════════════════════════════ */

import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { transpileTree } from "./lib-transpile.mjs";

const out = transpileTree({
  root: process.cwd(),
  sources: [
    "scripts/smoke-entry.ts",
    "src/three/layouts.ts",
    "src/three/choreography.ts",
    "src/lib/math.ts",
  ],
  out: join(process.cwd(), "node_modules", ".smoke"),
});

const mod = await import(pathToFileURL(join(out, "scripts/smoke-entry.mjs")).href);

let failures = 0;
const check = (name, ok, detail = "") => {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

console.log("\nTutors Academy — sculpture math\n");
mod.run(check);

if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll sculpture checks passed.\n");
