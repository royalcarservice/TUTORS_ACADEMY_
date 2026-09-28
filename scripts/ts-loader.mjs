// Minimal ESM resolve hook so plain `node --import` can run the repo's pure
// TypeScript modules (Node 22 strips types natively): maps "@/x" → src/x and
// adds ".ts" / ".tsx" / "/index.ts" to extensionless relative imports.
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";

const SRC = pathResolve(dirname(fileURLToPath(import.meta.url)), "../src");

register(new URL("data:text/javascript," + encodeURIComponent(`
  import { existsSync } from "node:fs";
  import { fileURLToPath, pathToFileURL } from "node:url";
  import { dirname, resolve as pr } from "node:path";
  const SRC = ${JSON.stringify(SRC)};
  export async function resolve(spec, ctx, next) {
    let base = null;
    if (spec.startsWith("@/")) base = pr(SRC, spec.slice(2));
    else if ((spec.startsWith("./") || spec.startsWith("../")) && ctx.parentURL?.startsWith("file:")) base = pr(dirname(fileURLToPath(ctx.parentURL)), spec);
    if (base && !/\\.[cm]?[jt]sx?$/.test(base)) {
      for (const c of [base + ".ts", base + ".tsx", base + "/index.ts"]) if (existsSync(c)) return { url: pathToFileURL(c).href, shortCircuit: true };
    } else if (base && existsSync(base)) return { url: pathToFileURL(base).href, shortCircuit: true };
    return next(spec, ctx);
  }
`)), import.meta.url);
