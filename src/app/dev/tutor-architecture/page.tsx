import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

import { PLATFORM_MODULES } from "@/config/modules";

/* DEV-ONLY · /dev/tutor-architecture (Phase 6 · Step 1 · Part 8).
 * 404s in production. Nothing here is authored by hand: every table is READ
 * from the step's own artefacts, so the page cannot claim more than they hold —
 *   supabase/migrations/20261001000002_relationship.sql   the model + policies (the truth)
 *   docs/TUTOR_VISIBILITY.md                              the policy in prose (matrix, tighten/loosen)
 *   audit/tutor-visibility.json                           17 assertions through the real JWT → PostgREST path
 *   audit/rls-test.log                                    56 SQL assertions, last run (local + project)
 * It is not a tutor surface. It renders no student. */

export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-secondary)" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", lineHeight: 1.45 };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };
const PRE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "var(--ta-surface-sunken)", padding: "var(--ta-space-3)", borderRadius: "var(--ta-radius-2)", margin: 0 };

type Visibility = { ranAt: string; path: string; passed: number; total: number; results: Array<{ ok: boolean; label: string; detail?: string }> };

function read(file: string): string | null { try { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); } catch { return null; } }
function section(md: string, heading: RegExp, until: RegExp = /^## /m): string {
  const m = md.match(heading); if (!m || m.index === undefined) return "";
  const rest = md.slice(m.index + m[0].length); const e = rest.search(until); return (e === -1 ? rest : rest.slice(0, e)).trim();
}
function mdTable(block: string): string[][] {
  return block.split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l)).map((l) => l.split("|").slice(1, -1).map((c) => c.trim().replace(/\*\*/g, "")));
}
function Table({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return <p style={{ fontSize: "var(--ta-text-sm)" }}>artefact not found</p>;
  const [head, ...body] = rows;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{head.map((h, i) => <th key={i} style={{ ...TD, ...MONO, textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>{body.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={TD}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function TutorArchitectureDev() {
  if (process.env.NODE_ENV === "production") notFound();
  const sql = read("supabase/migrations/20261001000002_relationship.sql") || "";
  const doc = read("docs/TUTOR_VISIBILITY.md") || "";
  const visRaw = read("audit/tutor-visibility.json");
  const vis: Visibility | null = visRaw ? (JSON.parse(visRaw) as Visibility) : null;
  const rlsLog = read("audit/rls-test.log") || "";

  const policies = [...sql.matchAll(/create policy (\w+) on public\.(\w+)\s+for (\w+) to (\w+) using \(([\s\S]*?)\);/g)]
    .map((m) => [m[1], m[2], m[3], m[4], m[5].replace(/\s+/g, " ").trim()]);
  const ddl = sql.match(/create table if not exists public\.relationships \([\s\S]*?\n\);/)?.[0] ?? "";
  const predicate = sql.match(/create or replace function public\.is_related_tutor[\s\S]*?\$\$;/)?.[0] ?? "";
  const matrix = mdTable(section(doc, /^## 2\. .*\n/m));
  const costs = mdTable(section(doc, /^## 4\. .*\n/m));
  const creation = mdTable(section(doc, /^## 6\. .*\n/m));
  const rlsSummary = rlsLog.split("\n").filter((l) => /RLS: all|FAILED|ERROR|^(local|project):/.test(l));
  const rlsBreaks = rlsLog.split("\n").filter((l) => /ok — (BREAK|P6-R1|revoked|revocation)/.test(l)).map((l) => l.replace(/^.*NOTICE:\s+/, ""));
  const registry = PLATFORM_MODULES.filter((m) => m.surfaces.includes("tutor")).map((m) => [m.id, m.name, m.status, m.routePrefix ?? "— (no route)"]);

  return (
    <main style={{ maxWidth: "72rem", margin: "0 auto", padding: "var(--ta-space-8) var(--ta-space-4) var(--ta-space-16)" }}>
      <p style={MONO}>dev only · Phase 6 · Step 1 · the tutor architecture</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 var(--ta-space-3)" }}>Who a tutor can see, and why</h1>
      <p style={{ fontSize: "var(--ta-text-base)", lineHeight: 1.55, maxWidth: "60ch" }}>
        Everything on this page is read from the step&apos;s artefacts: the migration, <code>docs/TUTOR_VISIBILITY.md</code>, and the two test outputs.
        It is not a tutor surface and renders no student.
      </p>

      <h2 style={H2}>1 · The relationship (P6-R1) — DDL as applied</h2>
      <pre style={PRE}>{ddl || "migration not found"}</pre>

      <h2 style={H2}>2 · The one predicate</h2>
      <pre style={PRE}>{predicate || "predicate not found"}</pre>

      <h2 style={H2}>3 · Policies in the migration (parsed from SQL)</h2>
      <Table rows={[["policy", "table", "command", "role", "USING"], ...policies]} />

      <h2 style={H2}>4 · Visibility default (P6-R2) — data type · who · condition · why · refused</h2>
      <Table rows={matrix} />

      <h2 style={H2}>5 · Policy-break proof</h2>
      <p style={{ fontSize: "var(--ta-text-sm)" }}>SQL fixture test, last run (<code>audit/rls-test.log</code>):</p>
      <pre style={PRE}>{rlsSummary.join("\n") || "no log — run bash scripts/test-rls.sh --local | tee audit/rls-test.log"}</pre>
      <ul style={{ fontSize: "var(--ta-text-sm)", lineHeight: 1.6, paddingLeft: "1.2em" }}>{rlsBreaks.map((l, i) => <li key={i}>{l}</li>)}</ul>
      <p style={{ fontSize: "var(--ta-text-sm)", marginTop: "var(--ta-space-4)" }}>
        Through the real path ({vis?.path ?? "—"}), {vis ? `${vis.passed}/${vis.total}` : "—"} at {vis?.ranAt ?? "—"}:
      </p>
      <Table rows={[["", "assertion", "detail"], ...(vis?.results ?? []).map((r) => [r.ok ? "ok" : "FAIL", r.label, r.detail ?? ""])]} />

      <h2 style={H2}>6 · Tighten / loosen — what each costs</h2>
      <Table rows={costs} />

      <h2 style={H2}>7 · Creation flow options (recommend only; nothing built)</h2>
      <Table rows={creation} />

      <h2 style={H2}>8 · Registry — tutor surface</h2>
      <Table rows={[["id", "name", "status", "route"], ...registry]} />
      <p style={{ fontSize: "var(--ta-text-sm)", maxWidth: "60ch" }}>
        Nothing is live. <code>tutor-relationship</code> is <em>in-progress</em>: the model exists below the surface; it becomes live only when a surface that resolves depends on it.
      </p>
    </main>
  );
}
