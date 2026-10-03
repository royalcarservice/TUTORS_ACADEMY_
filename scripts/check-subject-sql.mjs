// Asserts the six subject ids in the SQL check function equal the 3.1 config ids, in order.
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("../supabase/migrations/20260927000001_identity.sql", import.meta.url), "utf8");
const ts = readFileSync(new URL("../src/lib/subjects/subjects.ts", import.meta.url), "utf8");
const inSql = [...sql.match(/select p in \(([^)]*)\)/)[1].matchAll(/'(\w+)'/g)].map((m) => m[1]);
const inTs = [...ts.matchAll(/^\s{4}id:\s*"(\w+)",/gm)].map((m) => m[1]);
if (JSON.stringify(inSql) !== JSON.stringify(inTs)) { console.error("subject id mismatch\n  sql:", inSql, "\n  ts: ", inTs); process.exit(1); }
console.log("subject ids: SQL == config", inTs.join(","));

// 6.4 (P6-R11): the lever CHECK lists in environment_settings equal the authored sets in subjects.ts, in order.
const lev = readFileSync(new URL("../supabase/migrations/20261002000003_environment_settings.sql", import.meta.url), "utf8");
const sqlList = (col) => [...lev.match(new RegExp(`${col}\\s+text\\s+not null check \\(${col} in \\(([^)]*)\\)`))[1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
const tsList = (name) => [...ts.match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`))[1].matchAll(/"([\w-]+)"/g)].map((m) => m[1]);
for (const [col, name] of [["density", "DENSITIES"], ["motion_char", "MOTION_CHARS"]]) {
  const a = sqlList(col), b = tsList(name);
  if (JSON.stringify(a) !== JSON.stringify(b)) { console.error(`lever set mismatch for ${col}\n  sql:`, a, "\n  ts: ", b); process.exit(1); }
  console.log(`lever ${col}: SQL == config`, b.join(","));
}
// P6-R11: no identity column may exist on the settings table
if (/\b(accent|mark|hex|colou?r|font|type_scale|motion_grammar|atmosphere|motif)\b/i.test(lev.replace(/--.*$/gm, ""))) { console.error("identity value named in environment_settings DDL"); process.exit(1); }
console.log("environment_settings DDL names no identity value (accent/mark/colour/font/motion grammar/atmosphere/motif)");
