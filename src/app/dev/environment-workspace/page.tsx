import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

import { PLATFORM_MODULES } from "@/config/modules";
import { ENVIRONMENT_REGIONS, ENVIRONMENT_SLOTS, STUDENT_SLOTS, STUDENT_SLOT_REGIONS } from "@/config/student-slots";

/* DEV-ONLY SPECIMEN · /dev/environment-workspace (Phase 5 · Step 5 · Part 7)
 * 404s in production. Frames render the real environment composition with the
 * identity decision replayed from the query (see ./frame). Evidence tables are
 * read from audit/environment-baseline.json, written by audit/environment.cjs. */

export const dynamic = "force-dynamic";

interface Baseline {
  generatedAt?: string;
  gates?: Record<string, { pass: boolean; evidence: string }>;
  states?: Record<string, { status?: number; htmlHash?: string; rscHash?: string; noJs?: { primaryAction?: { tag?: string; text?: string; form?: { method: string; action: string } | null; href?: string | null } }; primaryAboveFold?: Record<string, { primaryActionBottom: number }>; studentRegions?: number; threshold?: boolean }>;
  write?: Record<string, unknown>;
  db?: unknown;
}
function readBaseline(): Baseline | null {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "audit/environment-baseline.json"), "utf8")) as Baseline; } catch { return null; }
}

const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const NOTE: React.CSSProperties = { fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "70ch" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };
const CODE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 };

function Frame({ q, w, h, scale = 1, title }: { q: string; w: number; h: number; scale?: number; title: string }) {
  return (
    <figure style={{ margin: 0, width: w * scale }}>
      <figcaption style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{title}</figcaption>
      <div style={{ width: w * scale, height: h * scale, overflow: "hidden", border: "1px solid var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)" }}>
        <iframe src={`/dev/environment-workspace/frame?${q}`} title={title} width={w} height={h} loading="lazy" style={{ border: 0, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }} />
      </div>
    </figure>
  );
}

const IDENTITIES = [
  { q: "who=visitor&subject=mathematics", t: "Visitor · Mathematics (3.6 composition, byte-pinned)" },
  { q: "who=student-nonenrolled&subject=mathematics", t: "Student, not enrolled · Mathematics → THRESHOLD" },
  { q: "who=student-enrolled&subject=mathematics", t: "Student, enrolled · Mathematics → regions (none exist)" },
  { q: "who=student-enrolled&subject=physics", t: "Student, enrolled · Physics (draft) → admitted, labelled" },
] as const;

export default function DevEnvironmentWorkspacePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const b = readBaseline();
  const W = (b?.write ?? {}) as Record<string, unknown>;
  const moduleStatus = (id: string) => PLATFORM_MODULES.find((m) => m.id === id)?.status ?? "—";
  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)", color: "var(--ta-text-primary)" }}>
      <p style={MONO}>Dev specimen · Phase 5 · Step 5</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The environment workspace</h1>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
        <strong>Real:</strong> one environment per subject at <code>/subjects/[id]</code>; the identity decision (server-side); the threshold control and the enrolment write (form POST → 303, RLS-bounded, idempotent); environment state initialised on entry; the shell&rsquo;s primary action as a POST for an enrolled subject.{" "}
        <strong>Not built:</strong> every region below — nothing inside an environment exists yet, so an enrolled student sees exactly what a visitor sees plus a way back to their space. <strong>Not a dashboard.</strong>
      </p>

      <h2 style={H2}>Four identity states · 390×844 · dark</h2>
      <p style={NOTE}>Same route, same composition. The visitor frame must be indistinguishable from 3.6; the non-enrolled frame adds ONE control beneath the identity; the enrolled frames add nothing visible today.</p>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        {IDENTITIES.map((f) => <Frame key={f.q} q={`${f.q}&theme=dark`} w={390} h={844} title={f.t} />)}
      </div>
      <h2 style={H2}>Same four · 1280×800 · light (scaled ½)</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        {IDENTITIES.map((f) => <Frame key={f.q} q={`${f.q}&theme=light`} w={1280} h={800} scale={0.5} title={f.t} />)}
      </div>

      <h2 style={H2}>Region layout · enrolled · specimen fill (impossible in production)</h2>
      <p style={NOTE}>The registry gate is bypassed HERE ONLY to show where regions would sit in reading order inside the Room. Every card says “Specimen”. In production the resolver table is empty and the registry has no live module, so the block renders nothing at all.</p>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        <Frame q="who=student-enrolled&subject=mathematics&regions=specimen&theme=dark" w={390} h={1400} title="regions=specimen · 390" />
        <Frame q="who=student-enrolled&subject=mathematics&regions=specimen&theme=light" w={1280} h={1400} scale={0.5} title="regions=specimen · 1280 (½)" />
      </div>

      <h2 style={H2}>Two-level slot map · one registry, two scopes</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["Capability", "Phase", "Shell scope (5.3)", "Environment scope (5.5)", "Module gate", "Renders today"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {ENVIRONMENT_SLOTS.map((e) => {
            const s = STUDENT_SLOTS.find((x) => x.id === e.id);
            return (
              <tr key={e.id}>
                <td style={TD}>{e.name}</td><td style={TD}>{e.phase}</td>
                <td style={TD}>{s ? `${STUDENT_SLOT_REGIONS[s.region].title} · ${s.position}` : "—"}</td>
                <td style={TD}>{ENVIRONMENT_REGIONS[e.region].title} (order {ENVIRONMENT_REGIONS[e.region].order})</td>
                <td style={TD}><code>{e.module}</code> · {moduleStatus(e.module)}</td>
                <td style={TD}>{e.today}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={H2}>The write · evidence from the last harness run</h2>
      <p style={NOTE}>Recorded by <code>audit/environment.cjs</code> on the write account (student-e): rows before, after GET, after prefetch, after POST, after a second POST, after a draft POST, after a signed-out POST. {b?.generatedAt ? `Run: ${b.generatedAt}.` : "No baseline found."}</p>
      <pre style={{ ...CODE, padding: "var(--ta-space-4)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)" }}>{JSON.stringify(W, null, 1)}</pre>

      <h2 style={H2}>Gates</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["Gate", "Result", "Evidence"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {Object.entries(b?.gates ?? {}).map(([k, v]) => (
            <tr key={k}><td style={TD}>{k}</td><td style={{ ...TD, color: v.pass ? "var(--ta-text-primary)" : "var(--ta-accent-brass)" }}>{v.pass ? "pass" : "FAIL"}</td><td style={TD}><pre style={CODE}>{v.evidence}</pre></td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={H2}>Per-state readout</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["State", "HTTP", "DOM hash", "Primary (no JS)", "Bottom @390", "Threshold", "Student regions"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {Object.entries(b?.states ?? {}).map(([k, v]) => (
            <tr key={k}>
              <td style={TD}>{k}</td><td style={TD}>{v.status ?? "—"}</td><td style={TD}><code>{v.htmlHash ?? "—"}</code></td>
              <td style={TD}>{v.noJs?.primaryAction ? `${v.noJs.primaryAction.tag} “${v.noJs.primaryAction.text}” ${v.noJs.primaryAction.form ? `form ${v.noJs.primaryAction.form.method} ${v.noJs.primaryAction.form.action}` : v.noJs.primaryAction.href ?? ""}` : "—"}</td>
              <td style={TD}>{v.primaryAboveFold?.["390x844"]?.primaryActionBottom ?? "—"}</td>
              <td style={TD}>{String(v.threshold ?? "—")}</td><td style={TD}>{v.studentRegions ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
