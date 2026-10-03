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

/* 6.4: the validator now reaches the motif grammar and the ambient contract (relative imports; one
   type-only "@/" import is erased on emit), so it is compiled through a temp tsconfig that extends the
   project's — paths resolve for type-checking, output is CommonJS for node. */
import { writeFileSync } from "node:fs";
writeFileSync(join(out, "tsconfig.json"), JSON.stringify({ extends: "../tsconfig.json", compilerOptions: { outDir: ".", rootDir: "../src", module: "commonjs", moduleResolution: "node", target: "es2020", noEmit: false, incremental: false, isolatedModules: false, plugins: [] }, include: ["../src/lib/subjects/validate.ts"] }));
execSync(`npx tsc -p .tmp-subj/tsconfig.json`, { cwd: root, stdio: "inherit" });

const require = createRequire(import.meta.url);
const { validateAll } = require(join(out, "lib/subjects/validate.js"));
const { pass, subjects, matrix, combinations } = validateAll();

for (const s of subjects) {
  console.log(`\n■ ${s.id} [${s.status}] ${s.pass ? "PASS" : "FAIL"}`);
  for (const c of s.checks) console.log(`  ${c.pass ? "✓" : "✗"} ${c.name}: ${c.detail}`);
}
console.log("\n■ mutual distinctness (ΔE ink / ivory, ≥15)");
for (const m of matrix) console.log(`  ${m.pass ? "✓" : "✗"} ${m.pair}: ${m.dInk.toFixed(1)} / ${m.dIvory.toFixed(1)}`);

console.log(`\n■ 6.4 lever combinations: ${combinations.count} (${combinations.perSubject} per subject) ${combinations.pass ? "PASS" : "FAIL"}`);
for (const r of combinations.reports) {
  const line = `  ${r.pass ? "✓" : "✗"} ${r.subject} · ${r.levers.density} · ${r.levers.motionChar}`;
  if (!r.pass || process.argv.includes("--verbose")) console.log(line + "\n" + r.checks.map((c) => `      ${c.pass ? "✓" : "✗"} ${c.name}: ${c.detail}`).join("\n"));
}
if (process.argv.includes("--json")) writeFileSync(join(root, "audit/lever-combinations.json"), JSON.stringify({ generatedAt: new Date().toISOString(), count: combinations.count, perSubject: combinations.perSubject, pass: combinations.pass, reports: combinations.reports }, null, 1));
rmSync(out, { recursive: true, force: true });
console.log(`\n${pass ? "✓ ALL SUBJECTS VALID" : "✗ VALIDATION FAILED"}`);
process.exit(pass ? 0 : 1);
