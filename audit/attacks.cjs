/* THE ATTACK GATE (P6-R7). A boundary proven by attack ships with the attack
 * as a permanent failing test. For every audit/attacks/*.ts:
 *   1. with its @ts-expect-error directives in place, tsc must be CLEAN
 *      (every directive is satisfied by a real error on the next line);
 *   2. with the directives stripped, tsc must report EXACTLY the error
 *      codes the file declares in its `EXPECT TSxxxx` header — not merely
 *      "an error" (a typo proves nothing);
 *   3. if any attack compiles, or errors with a different code, FAIL LOUDLY.
 * Layers (each has its own gate; none substitutes): SIGNATURE = this file ·
 * POLICY = supabase/tests/rls_test.sql + scripts/test-tutor-visibility.mjs ·
 * ROUTE = audit/identity-matrix.cjs.
 * Adding an argument or a field to a reader is therefore a GATED ACT.
 *   node audit/attacks.cjs            (exit 1 on any failure)             */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(__dirname, "attacks");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".ts")).sort();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "attacks-"));
const cfg = (include) => { const p = path.join(tmp, `tsconfig.${Math.random().toString(36).slice(2)}.json`); fs.writeFileSync(p, JSON.stringify({ extends: path.join(ROOT, "tsconfig.json"), compilerOptions: { noEmit: true, baseUrl: ROOT, paths: { "@/*": ["./src/*"] }, incremental: false }, include: [...include, path.join(ROOT, "next-env.d.ts")] })); return p; };
const tsc = (p) => { const r = spawnSync(process.execPath, [path.join(ROOT, "node_modules/typescript/bin/tsc"), "-p", p], { encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };

let fail = 0;
const say = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) fail++; };

/* 1 · directives in place → clean */
const withDirectives = tsc(cfg(files.map((f) => path.join(DIR, f))));
say(withDirectives.code === 0, `attacks with @ts-expect-error in place compile clean (every directive met by a real error)${withDirectives.code === 0 ? "" : "\n" + withDirectives.out}`);

/* 2 · stripped → exactly the declared codes, per file */
const report = {};
for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), "utf8");
  const expected = [...src.matchAll(/EXPECT (TS\d{4})/g)].map((m) => m[1]).sort();
  const stripped = path.join(tmp, f);
  fs.writeFileSync(stripped, src.replace(/\/\/ @ts-expect-error.*/g, ""));
  const r = tsc(cfg([stripped]));
  const got = [...r.out.matchAll(/error (TS\d{4})/g)].map((m) => m[1]).sort();
  const lines = r.out.split("\n").filter((l) => /error TS/.test(l)).map((l) => l.replace(tmp + "/", "").replace(/^.*?attacks-[^/]*\//, ""));
  report[f] = { expected, got, lines };
  const ok = expected.length > 0 && got.length > 0 && JSON.stringify([...new Set(expected)]) === JSON.stringify([...new Set(got)]);
  say(ok, `${f}: expected ${expected.join(",") || "(none declared!)"} · got ${got.join(",") || "COMPILES"}`);
  for (const l of lines) console.log("        " + l);
}
fs.writeFileSync(path.join(DIR, "tsc-output.txt"), Object.entries(report).map(([f, r]) => `${f}\n  expected: ${r.expected.join(", ")}\n  got:      ${r.got.join(", ") || "COMPILES — BOUNDARY BROKEN"}\n${r.lines.map((l) => "  " + l).join("\n")}`).join("\n\n") + "\n");
console.log(`\n${files.length} attack files · ${fail} failure(s) · written audit/attacks/tsc-output.txt`);
process.exit(fail ? 1 : 0);
