import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

/* DEV-ONLY · /dev/student-gate (Phase 5 · Step 8 · Part 8).
 * 404s in production. Nothing here is authored by hand: every table is READ
 * from the gate's own artefacts so the page cannot say more than the
 * instruments measured —
 *   audit/gate-baseline.json           the 8 pm journey, LCP distribution, fold gate, pin, matrix
 *   docs/EXCEPTIONS.md                 the consolidated register
 *   PHASE5_STEP8_VALIDATION_GATE_REPORT.md   ledgers, audit, breakage evidence, "what this gate cannot see"
 * Screenshots are in audit/gate-shots/ (not served; paths listed). */

export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-secondary)" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", lineHeight: 1.45 };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };
const PRE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "var(--ta-surface-sunken)", padding: "var(--ta-space-3)", borderRadius: "var(--ta-radius-2)", margin: 0 };

type Step = { step: string; url: string | null; wall?: number; fcp?: number | null; lcp?: number | null; h1: string[]; primary: Array<{ text: string; inFold: boolean; bottom: number }>; foldText?: string; arc?: string; error?: string; skipped?: string; submitToArrive?: number; clickToArrive?: number };
type Gate = { pass: boolean; detail: string };
type Baseline = {
  generatedAt: string; reference?: unknown; profile: unknown; sectionsRun?: string[]; pass: boolean;
  gates: Record<string, Gate>;
  journey: { firstVisit?: { steps: Step[]; encodedKB: number; requests: number }; secondVisit?: { steps: Step[]; encodedKB: number; requests: number } };
  lcp: Record<string, { used: number[]; min: number; median: number; max: number; n: number; discardedWarmUp: { lcp: number } }>;
  fold: Record<string, Record<string, { primary: { text: string; bottom: number; inFold: boolean } | null; h1InFold: boolean; hscroll: boolean; primariesVisible: number; error?: string }>>;
  foldExceptions?: string[];
  pin: { firstVisitEncodedKB: number | null; secondVisitEncodedKB: number | null; policy: string };
  matrix: Record<string, Record<string, { verdict: string; reason?: string; url?: string }>>;
  matrixTotals: { cells: number; pass: number; fail: number; exception: number };
  unfillable: Array<{ state: string; condition: string; reason: string }>;
};

function read(file: string): string | null { try { return fs.readFileSync(path.join(process.cwd(), file), "utf8"); } catch { return null; } }
function section(md: string, heading: RegExp, until: RegExp = /^## /m): string {
  const m = md.match(heading); if (!m || m.index === undefined) return "";
  const rest = md.slice(m.index + m[0].length); const e = rest.search(until); return (e === -1 ? rest : rest.slice(0, e)).trim();
}
function mdTable(block: string): string[][] {
  return block.split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l)).map((l) => l.split("|").slice(1, -1).map((c) => c.trim().replace(/\*\*/g, "")));
}

export default function StudentGateDev() {
  if (process.env.NODE_ENV === "production") notFound();
  const baseRaw = read("audit/gate-baseline.json");
  const base: Baseline | null = baseRaw ? (JSON.parse(baseRaw) as Baseline) : null;
  const exceptions = read("docs/EXCEPTIONS.md") || "";
  const report = read("PHASE5_STEP8_VALIDATION_GATE_REPORT.md") || "";
  const register = mdTable(section(exceptions, /^\| # \| exception/m, /^## /m) ? exceptions.slice(exceptions.indexOf("| # | exception")) : "").filter((r) => r[0] !== "#");
  const ledger1 = mdTable(section(report, /^### 1\.1 .*\n/m));
  const ledger2 = mdTable(section(report, /^### 1\.2 .*\n/m));
  const audit = mdTable(section(report, /^## PART 3 .*\n/m));
  const breakages = section(report, /^## PART 6 .*\n/m);
  const cannotSee = section(report, /^## What this gate cannot see\n/m);
  const conditions = base ? Array.from(new Set(Object.values(base.matrix).flatMap((r) => Object.keys(r)))) : [];

  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-12) var(--ta-space-section)" }}>
      <p style={MONO}>Dev evidence · Phase 5 · Step 8 · not linked from any surface · 404 in production</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The student gate</h1>
      <p style={{ maxWidth: "70ch", color: "var(--ta-text-secondary)" }}>
        Every table on this page is read from the gate&rsquo;s artefacts (<code>audit/gate-baseline.json</code>, <code>docs/EXCEPTIONS.md</code>, the 5.8 report). Nothing is typed here. If a file is missing the section below says so instead of showing an older number.
      </p>
      {!base ? <p data-missing style={{ color: "var(--ta-text-primary)" }}>No gate baseline found — run <code>node audit/gate.cjs --write</code>.</p> : (
        <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>baseline {base.generatedAt} · sections {(base.sectionsRun || []).join(",")} · {Object.values(base.gates).filter((g) => g.pass).length}/{Object.keys(base.gates).length} gates pass · profile {JSON.stringify(base.profile)}</p>
      )}

      <h2 style={H2}>1 · Promise ledger — homepage → student space</h2>
      <Table rows={ledger1} empty="Ledger 1 not found in the report (expects a table under '### 1.1')." />
      <h2 style={H2}>1b · Promise ledger — student space → a week of use</h2>
      <Table rows={ledger2} empty="Ledger 2 not found in the report (expects a table under '### 1.2')." />

      <h2 style={H2}>2 · The 8 pm journey (390 × 844, dark, 400 ms / 1.6 Mbps cold, 4× CPU)</h2>
      {base?.journey.firstVisit ? <Journey title={`First visit · student-e · ${base.journey.firstVisit.encodedKB} KB over the wire · ${base.journey.firstVisit.requests} requests`} steps={base.journey.firstVisit.steps} prefix="journey" /> : <p>No first-visit record.</p>}
      {base?.journey.secondVisit ? <Journey title={`Second visit · student-c (read-only) · ${base.journey.secondVisit.encodedKB} KB · ${base.journey.secondVisit.requests} requests`} steps={base.journey.secondVisit.steps} prefix="return" /> : <p>No second-visit record.</p>}

      <h2 style={H2}>2b · LCP as a distribution (warm-up discarded)</h2>
      {base ? (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr>{["route", "n", "min", "median", "max", "samples (ms)", "discarded warm-up"].map((h) => <th key={h} style={{ ...TD, ...MONO, textAlign: "left" }}>{h}</th>)}</tr></thead>
          <tbody>{Object.entries(base.lcp).map(([r, v]) => <tr key={r}><td style={TD}>{r}</td><td style={TD}>{v.n}</td><td style={TD}>{v.min}</td><td style={TD}>{v.median}</td><td style={TD}>{v.max}</td><td style={TD}>{v.used.join(", ")}</td><td style={TD}>{v.discardedWarmUp?.lcp}</td></tr>)}</tbody>
        </table>
      ) : null}

      <h2 style={H2}>2c · Fold gate — every journey surface × 320 / 360 / 390 / 1280 / 1920</h2>
      {base ? (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr>{["surface", ...Object.keys(Object.values(base.fold)[0] || {})].map((h) => <th key={h} style={{ ...TD, ...MONO, textAlign: "left" }}>{h}</th>)}</tr></thead>
          <tbody>{Object.entries(base.fold).map(([s, vps]) => <tr key={s}><td style={TD}>{s}</td>{Object.values(vps).map((x, i) => <td key={i} style={TD}>{x.error ? `ERROR ${x.error}` : `${x.primary ? `${x.primary.text} · bottom ${x.primary.bottom}${x.primary.inFold ? "" : " · BELOW"}` : "no primary"}${x.h1InFold ? "" : " · h1 out"}${x.hscroll ? " · H-SCROLL" : ""}${x.primariesVisible > 1 ? ` · ${x.primariesVisible} primaries` : ""}`}</td>)}</tr>)}</tbody>
        </table>
      ) : null}
      {base?.foldExceptions?.length ? <p style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>Declared (not passed): {base.foldExceptions.join(" · ")} — register E-22.</p> : null}
      {base ? <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>pin · first visit {base.pin.firstVisitEncodedKB} KB · second visit {base.pin.secondVisitEncodedKB} KB · {base.pin.policy}</p> : null}

      <h2 style={H2}>3 · Honesty audit (22 categories)</h2>
      <Table rows={audit} empty="Audit table not found in the report (expects the first table under '## PART 3')." />

      <h2 style={H2}>7 · The matrix — {base ? `${base.matrixTotals.cells} cells · ${base.matrixTotals.pass} pass · ${base.matrixTotals.fail} fail · ${base.matrixTotals.exception} declared exceptions` : "no baseline"}</h2>
      {base ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr><th style={{ ...TD, ...MONO, textAlign: "left" }}>state</th>{conditions.map((c) => <th key={c} style={{ ...TD, ...MONO, textAlign: "left" }}>{c}</th>)}</tr></thead>
            <tbody>{Object.entries(base.matrix).map(([st, row]) => <tr key={st}><td style={TD}>{st}</td>{conditions.map((c) => { const cell = row[c]; const v = cell?.verdict || "—"; return <td key={c} data-verdict={v} style={{ ...TD, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" }} title={cell?.reason || cell?.url || ""}>{v === "PASS" ? "pass" : v === "EXCEPTION" ? "exc" : v}</td>; })}</tr>)}</tbody>
          </table>
        </div>
      ) : null}
      {base?.unfillable.length ? (
        <ul style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", paddingLeft: "1.2em" }}>{base.unfillable.map((u, i) => <li key={i}>{u.state} × {u.condition} — {u.reason}</li>)}</ul>
      ) : null}

      <h2 style={H2}>6 · Breakage evidence</h2>
      {breakages ? <pre style={PRE}>{breakages}</pre> : <p>Part 6 not found in the report.</p>}

      <h2 style={H2}>5 · Exceptions register ({register.length} rows)</h2>
      <Table rows={register.length ? [["#", "exception", "what", "why accepted", "cost", "owner", "resolving phase"], ...register] : []} empty="docs/EXCEPTIONS.md not found or has no table." />

      <h2 style={H2}>What this gate cannot see</h2>
      {cannotSee ? <pre style={PRE}>{cannotSee}</pre> : <p>Section not found in the report.</p>}
      <p style={{ ...MONO, marginTop: "var(--ta-space-8)" }}>screenshots · audit/gate-shots/journey-01…08.png · return-01…04.png · not served by this page</p>
    </main>
  );
}

function Table({ rows, empty }: { rows: string[][]; empty: string }) {
  if (!rows.length) return <p data-missing style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>{empty}</p>;
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

function Journey({ title, steps, prefix }: { title: string; steps: Step[]; prefix: string }) {
  return (
    <>
      <p style={{ ...MONO, marginTop: "var(--ta-space-4)" }}>{title}</p>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["step", "lands on", "wall ms", "FCP", "LCP", "h1", "the one primary", "arc / notes", "shot"].map((h) => <th key={h} style={{ ...TD, ...MONO, textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>{steps.map((s, i) => (
          <tr key={i} data-step={i + 1}>
            <td style={TD}>{s.step}</td><td style={TD}>{s.url || "—"}</td><td style={TD}>{s.wall ?? "—"}</td><td style={TD}>{s.fcp ?? "—"}</td><td style={TD}>{s.lcp ?? "—"}</td>
            <td style={TD}>{s.h1?.join(" / ") || (s.error ? `BROKE: ${s.error}` : s.skipped || "—")}</td>
            <td style={TD}>{s.primary?.[0] ? `${s.primary[0].text}${s.primary[0].inFold ? "" : " (below fold)"}` : "—"}</td>
            <td style={TD}>{[s.arc, s.submitToArrive !== undefined ? `submit→arrive ${s.submitToArrive} ms` : null, s.clickToArrive !== undefined ? `click→arrive ${s.clickToArrive} ms` : null].filter(Boolean).join(" · ") || "—"}</td>
            <td style={{ ...TD, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" }}>{`audit/gate-shots/${prefix}-${String(i + 1).padStart(2, "0")}.png`}</td>
          </tr>
        ))}</tbody>
      </table>
    </>
  );
}
