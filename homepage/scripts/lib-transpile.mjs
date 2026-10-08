/* Shared helper: transpile the real TypeScript sources to ESM so Node can
   execute the same code the browser runs. No parallel implementation — the
   tests import the shipped modules. */

import ts from "typescript";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.tsx?$/.test(full)) acc.push(full);
  }
  return acc;
}

export function transpileTree({ root, sources, out, skip = [] }) {
  rmSync(out, { recursive: true, force: true });
  const files = [];
  for (const s of sources) {
    const full = join(root, s);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }

  for (const full of files) {
    const rel = relative(root, full);
    if (skip.some((s) => rel === s || rel.endsWith(s))) continue;

    const source = readFileSync(full, "utf8");
    const js = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        verbatimModuleSyntax: true,
      },
      fileName: rel,
    }).outputText;

    // Relative specifiers point at the transpiled .mjs siblings; bare
    // specifiers (react, three, lucide-react, gsap) resolve from node_modules.
    const rewritten = js.replace(
      /(from\s*["'])(\.{1,2}\/[^"']+)(["'])/g,
      (_m, a, spec, c) => `${a}${spec}.mjs${c}`,
    );

    const target = join(out, rel.replace(/\.tsx?$/, ".mjs"));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, rewritten);
  }

  writeFileSync(join(out, "package.json"), JSON.stringify({ type: "module" }));
  return out;
}
