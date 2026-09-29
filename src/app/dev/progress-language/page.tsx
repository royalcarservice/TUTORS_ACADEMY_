import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

import { ArcRegion, ARC_COPY, ARC_STATE_TEXT } from "@/components/student/arc-region";
import { ARC_STEPS } from "@/config/arc";
import { PLATFORM_MODULES } from "@/config/modules";
import * as P from "@/lib/progress";
import { arcPosition, countByKind, latestEvent, validateEvents } from "@/lib/progress";

import * as F from "./fixtures";

/* DEV-ONLY SPECIMEN · /dev/progress-language (Phase 5 · Step 6 · Part 6).
 * 404s in production. Everything with a number in it on this page comes from
 * FIXTURES (./fixtures.ts) — there is no event table in the product. */

export const dynamic = "force-dynamic";

const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const NOTE: React.CSSProperties = { fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "70ch" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };
const CODE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 };
const BOX: React.CSSProperties = { border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-4)" };

function Frame({ q, w, h, scale = 1, title, noJs }: { q: string; w: number; h: number; scale?: number; title: string; noJs?: boolean }) {
  return (
    <figure style={{ margin: 0, width: w * scale }}>
      <figcaption style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{title}</figcaption>
      <div style={{ width: w * scale, height: h * scale, overflow: "hidden", border: "1px solid var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)" }}>
        <iframe src={`/dev/progress-language/frame?${q}`} title={title} width={w} height={h} loading="lazy" sandbox={noJs ? "" : undefined} style={{ border: 0, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }} />
      </div>
    </figure>
  );
}

function readDoc(): { permitted: string[][]; banned: string[][] } {
  try {
    const md = fs.readFileSync(path.join(process.cwd(), "docs/PROGRESS_LANGUAGE.md"), "utf8");
    const table = (heading: string) => {
      const start = md.indexOf(heading); if (start < 0) return [];
      const rest = md.slice(start).split("\n").slice(1);
      const rows: string[][] = [];
      for (const line of rest) { if (line.startsWith("|")) { const cells = line.split("|").slice(1, -1).map((c) => c.trim()); if (!/^-+$/.test(cells[0])) rows.push(cells); } else if (rows.length) break; }
      return rows.slice(1);
    };
    return { permitted: table("## Permitted words"), banned: table("## Banned words and forms") };
  } catch { return { permitted: [], banned: [] }; }
}

/* THE FAILING ATTEMPT — evaluated at render, the result pasted below. */
function attemptRatio(): string {
  const m = P as unknown as Record<string, unknown>;
  const lines: string[] = [];
  for (const name of ["percentComplete", "completion", "ratio", "overallProgress", "combinedScore", "projectedFinish"]) lines.push(`P.${name} → ${typeof m[name]}`);
  const counts = countByKind(F.MANY, "mathematics", [...F.LIVE_PRETEND]);
  lines.push(`countByKind(MANY) → ${JSON.stringify(counts.map((c) => ({ kind: c.kind, count: c.count, sources: c.sources.length })))}`);
  lines.push(`// To form "n of m" a denominator is needed. The module exposes none; the only numbers are counts whose keys are ["count","kind","sources"].`);
  try {
    const total = (counts[0] as unknown as { total?: number } | undefined)?.total;
    lines.push(`counts[0].total → ${String(total)}  (undefined: there is nothing to divide by)`);
  } catch (e) { lines.push(String(e)); }
  return lines.join("\n");
}

export default function DevProgressLanguagePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const doc = readDoc();
  const liveToday = PLATFORM_MODULES.filter((m) => m.status === "live").map((m) => m.id);
  const zero = arcPosition(F.FACTS_ENTERED, F.ZERO, liveToday);
  const one = arcPosition(F.FACTS_ENTERED, F.ONE, [...F.LIVE_PRETEND]);
  const many = arcPosition(F.FACTS_ENTERED, F.MANY, [...F.LIVE_PRETEND]);
  const dayOne = arcPosition(F.FACTS_DAY_ONE, F.ZERO, liveToday);
  const yesterday = arcPosition(F.FACTS_YESTERDAY, F.ZERO, liveToday);
  const manyCounts = countByKind(F.MANY, "mathematics", [...F.LIVE_PRETEND]);
  const manyLatest = latestEvent(F.MANY, "mathematics", [...F.LIVE_PRETEND], F.NOW);
  const malformed = validateEvents(F.MALFORMED);
  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)", color: "var(--ta-text-primary)" }}>
      <p style={MONO}>Dev specimen · Phase 5 · Step 6</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The progress language</h1>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
        <strong>Real today:</strong> the vocabulary (docs/PROGRESS_LANGUAGE.md); the pure module <code>src/lib/progress</code>; the arc region inside an enrolled student&rsquo;s environment, whose first three steps are derived from a real account, enrolment and entry, and whose last four are ahead; the boundary sentence. <strong>Fixture only:</strong> every event on this page. There is no event table — <code>progress_record</code> was never created (5.1 amendment pending) — so in production the module always receives <code>[]</code> and never a count.
      </p>

      <h2 style={H2}>The arc · zero / one / many · 390×844 · both themes</h2>
      <p style={NOTE}>Zero uses the registry as it stands (no admissible kind). One and many pretend live-classroom, recorded-classes and assignments are live — the only way texture can arrive. The region title, eyebrow and seven labels never change; only the state words and the boundary sentence do.</p>
      {(["dark", "light"] as const).map((theme) => (
        <div key={theme} style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
          <Frame q={`events=zero&live=today&theme=${theme}`} w={390} h={844} title={`zero · registry as is · ${theme}`} />
          <Frame q={`events=one&live=pretend&theme=${theme}`} w={390} h={844} title={`one (pretend live) · ${theme}`} />
          <Frame q={`events=many&live=pretend&theme=${theme}`} w={390} h={844} title={`many (pretend live) · ${theme}`} />
        </div>
      ))}
      <h2 style={H2}>Grayscale · reduced motion · no-JS · 1280 (½)</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        <Frame q="events=zero&live=today&theme=dark&gray=1" w={390} h={844} title="grayscale" />
        <Frame q="events=zero&live=today&theme=dark&rm=1" w={390} h={844} title="reduced motion" />
        <Frame q="events=zero&live=today&theme=light" w={390} h={844} title="no JS (sandboxed)" noJs />
        <Frame q="events=zero&live=today&theme=light" w={1280} h={800} scale={0.5} title="1280 · light" />
      </div>

      <h2 style={H2}>Never emit a zero — side by side</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "var(--ta-space-6)" }}>
        <div style={BOX}>
          <p style={MONO}>Shipped · empty record</p>
          <div style={{ marginTop: "var(--ta-space-3)" }}><ArcRegion position={zero} subjectName="Mathematics" /></div>
          <p style={{ ...NOTE, marginTop: "var(--ta-space-4)" }}>Strings rendered: {JSON.stringify([...zero.steps.map((s) => `${s.label} — ${ARC_STATE_TEXT[s.state]}`), ARC_COPY.boundary])} — list aria-label &ldquo;{ARC_COPY.eyebrow} in Mathematics&rdquo;; visible heading &ldquo;Your record&rdquo; from the region contract.{""}</p>
        </div>
        <div style={{ ...BOX, borderStyle: "dashed" }}>
          <p style={MONO}>The wrong version · never shipped</p>
          <ul style={{ margin: "var(--ta-space-3) 0 0", paddingLeft: "1.2em", fontSize: "var(--ta-text-md)", color: "var(--ta-text-secondary)" }}>
            <li>Sessions attended: 0</li><li>Recordings watched: 0</li><li>Work submitted: 0</li><li>Course progress: 0 %</li><li>You haven&rsquo;t started yet.</li>
          </ul>
          <p style={{ ...NOTE, marginTop: "var(--ta-space-4)" }}>Each line is a claim about a child in a product that measures none of these things. The zeros are not facts; they are the absence of a table rendered as a verdict.</p>
        </div>
      </div>

      <h2 style={H2}>No backfill, no defaults — enrolled since day one vs enrolled yesterday</h2>
      <p style={NOTE}>Deep-equal: <strong>{JSON.stringify(dayOne) === JSON.stringify(yesterday) ? "identical" : "DIFFERENT — defect"}</strong>. Both render the strings above, unchanged.</p>

      <h2 style={H2}>The module cannot produce a ratio, a composite or a prediction</h2>
      <p style={NOTE}>Exports (the complete public surface): <code>{Object.keys(P).sort().join(", ")}</code>. The attempt below runs on every render of this page.</p>
      <pre style={{ ...CODE, ...BOX }}>{attemptRatio()}</pre>

      <h2 style={H2}>Traceability — one worked example (fixture MANY, pretend registry)</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["Displayed figure", "Value", "Rows behind it"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {manyCounts.map((c) => <tr key={c.kind}><td style={TD}>{c.kind}</td><td style={TD}>{c.count}</td><td style={TD}><code style={CODE}>{c.sources.join(", ")}</code></td></tr>)}
          {manyLatest ? <tr><td style={TD}>most recent</td><td style={TD}>{manyLatest.kind} · {manyLatest.when}</td><td style={TD}><code style={CODE}>{manyLatest.sources.join(", ")}</code></td></tr> : null}
          {many.steps.map((s) => <tr key={s.id}><td style={TD}>arc · {s.label}</td><td style={TD}>{ARC_STATE_TEXT[s.state]}</td><td style={TD}><code style={CODE}>{s.sources.join(", ") || "—"}</code></td></tr>)}
        </tbody>
      </table>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>With one event: {JSON.stringify(one.steps.map((s) => `${s.id}:${s.state}`))} — the same shape as with eleven; nothing is emphasised because it is first.</p>

      <h2 style={H2}>Malformed is not missing</h2>
      <pre style={{ ...CODE, ...BOX }}>{`validateEvents(MALFORMED) → valid ${malformed.valid.length}, defects ${JSON.stringify(malformed.defects)}\narcPosition(FACTS_NEVER_ENTERED /* no environment_state row */) → defects [] · enter: ahead (a state, silence)`}</pre>

      <h2 style={H2}>Arc integrity — 4.7&rsquo;s shipped steps vs the region</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["#", "Homepage (Scene 7 MARKERS)", "Environment (arc region)"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>{ARC_STEPS.map((s, i) => <tr key={s.id}><td style={TD}>{i + 1}</td><td style={TD}>{s.id} · {s.label}</td><td style={TD}>{zero.steps[i].id} · {zero.steps[i].label}</td></tr>)}</tbody>
      </table>
      <p style={NOTE}>One definition (<code>src/config/arc.ts</code>); Scene 7 re-exports it. State words: homepage &ldquo;done, on this page&rdquo; / &ldquo;ahead&rdquo;; environment &ldquo;{ARC_STATE_TEXT.done}&rdquo; / &ldquo;{ARC_STATE_TEXT.ahead}&rdquo; — 4.7 §13 recorded that &ldquo;on this page&rdquo; must change for a real student.</p>

      <h2 style={H2}>Vocabulary — permitted</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{doc.permitted.map((r, i) => <tr key={i}><td style={TD}>{r[0]}</td><td style={TD}>{r[1]}</td></tr>)}</tbody></table>
      <h2 style={H2}>Vocabulary — banned, with sources</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{doc.banned.map((r, i) => <tr key={i}><td style={TD}>{r[0]}</td><td style={{ ...TD, color: "var(--ta-text-secondary)" }}>{r[1]}</td></tr>)}</tbody></table>
    </main>
  );
}
