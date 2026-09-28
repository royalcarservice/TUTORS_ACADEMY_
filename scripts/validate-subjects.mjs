#!/usr/bin/env node
/* BUILD-TIME SUBJECT VALIDATOR GATE (Phase 3 · Step 1).
   Compiles the TS validator with the project's own TypeScript (no new dep),
   runs validateAll(), prints the full report and EXITS NON-ZERO on any
   failure — a failing subject config therefore breaks the build.
   usage: node scripts/validate-subjects.mjs   (run before `next build`)   */
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, ".tmp-subj");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

execSync(
  `npx tsc src/lib/subjects/validate.ts --outDir .tmp-subj --module commonjs --target es2020 --esModuleInterop --skipLibCheck`,
  { cwd: root, stdio: "inherit" },
);

const require = createRequire(import.meta.url);
const { validateAll } = require(join(out, "validate.js"));
const { pass, subjects, matrix } = validateAll();

for (const s of subjects) {
  console.log(`\n■ ${s.id} [${s.status}] ${s.pass ? "PASS" : "FAIL"}`);
  for (const c of s.checks) console.log(`  ${c.pass ? "✓" : "✗"} ${c.name}: ${c.detail}`);
}
console.log("\n■ mutual distinctness (ΔE ink / ivory, ≥15)");
for (const m of matrix) console.log(`  ${m.pass ? "✓" : "✗"} ${m.pair}: ${m.dInk.toFixed(1)} / ${m.dIvory.toFixed(1)}`);

rmSync(out, { recursive: true, force: true });
console.log(`\n${pass ? "✓ ALL SUBJECTS VALID" : "✗ VALIDATION FAILED"}`);
process.exit(pass ? 0 : 1);
