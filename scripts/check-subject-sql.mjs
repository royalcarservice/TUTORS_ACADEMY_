// Asserts the six subject ids in the SQL check function equal the 3.1 config ids, in order.
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("../supabase/migrations/20260927000001_identity.sql", import.meta.url), "utf8");
const ts = readFileSync(new URL("../src/lib/subjects/subjects.ts", import.meta.url), "utf8");
const inSql = [...sql.match(/select p in \(([^)]*)\)/)[1].matchAll(/'(\w+)'/g)].map((m) => m[1]);
const inTs = [...ts.matchAll(/^\s{4}id:\s*"(\w+)",/gm)].map((m) => m[1]);
if (JSON.stringify(inSql) !== JSON.stringify(inTs)) { console.error("subject id mismatch\n  sql:", inSql, "\n  ts: ", inTs); process.exit(1); }
console.log("subject ids: SQL == config", inTs.join(","));
