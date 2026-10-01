import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

import { TUTOR_REGIONS, TUTOR_SLOTS } from "@/config/student-slots";
import { TUTOR_NAV_ITEMS } from "@/config/tutor-nav";
import { TUTOR_COPY } from "@/components/tutor/tutor-shell";
import { orderRows } from "@/lib/tutor/data";

import { fixtureContext, SHUFFLED_INPUT } from "./fixtures";

/* /dev/tutor-shell — THE SPECIMEN PAGE (Phase 6 · Step 2 · Part 8). Dev-only
 * (404 in production). Shows the real shell component in iframes at exact
 * viewports from LABELLED FIXTURES. Nothing here is a person. */

export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const NOTE: React.CSSProperties = { fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "70ch" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 0" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };
const PRE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", background: "var(--ta-surface-raised)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-3)", overflowX: "auto", whiteSpace: "pre-wrap" };

/* The NEVER-CONTAINS list = the student shell's (5.3) + the P6-R3 bans. The harness sweeps every entry on the real route. */
export const NEVER_CONTAINS = [
  "Statistic cards, metric grids, “your numbers”",
  "Streaks, XP, levels, badges, leaderboards, points",
  "Notification bell, unread count, message icon",
  "“Recommended for you” (no recommendation engine exists)",
  "Skeleton loaders, shimmer, “loading” on empty states",
  "Empty-state illustrations of people or scenes",
  "CTAs beyond the single primary — and in the tutor shell, ANY invented CTA or disabled control (P6-R4)",
  "A welcome header, greeting banner or hero",
  "Search, and any disabled or “coming soon” nav item",
  "P6-R3 · a flat list of students across subjects (the shape cannot express it)",
  "P6-R3 · “needs attention”, “at risk”, “inactive”, “falling behind”, “hasn't opened”, “last seen”",
  "P6-R3 · a count of students, of relationships, or of anything (“0”, “3 students”)",
  "P6-R3 · any per-row status, colour, icon, badge, arc or recency; any sort by activity",
  "P6-R3 · progress of a student on this surface (arc belongs to the relationship surface, 6.3)",
  "Earnings, payments, payouts, hours, rates — any money word (P6-R5 ruling pending)",
  "Roster, caseload, dashboard, pipeline, queue — management-console vocabulary",
];

function Frame({ q, w, h, scale = 1, title, noJs }: { q: string; w: number; h: number; scale?: number; title: string; noJs?: boolean }) {
  return (
    <figure style={{ margin: 0, width: w * scale }}>
      <figcaption style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{title}</figcaption>
      <div style={{ width: w * scale, height: h * scale, overflow: "hidden", border: "1px solid var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)" }}>
        <iframe src={`/dev/tutor-shell/frame?${q}`} title={title} width={w} height={h} loading="lazy" sandbox={noJs ? "" : undefined} style={{ border: 0, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }} />
      </div>
    </figure>
  );
}

function readText(rel: string): string | null {
  try { return fs.readFileSync(path.join(process.cwd(), rel), "utf8"); } catch { return null; }
}

export default function TutorShellSpecimen() {
  if (process.env.NODE_ENV === "production") notFound();
  const sorted = orderRows(fixtureContext("B", 4).groups.flatMap((g) => g.rows));
  const attack1 = readText("audit/attacks/tutor-shell-attack-1.ts");
  const attack2 = readText("audit/attacks/tutor-shell-attack-2.ts");
  const tscOut = readText("audit/attacks/tsc-output.txt");
  const readerSrc = readText("src/lib/tutor/data.ts") ?? "";
  const tables = Array.from(readerSrc.matchAll(/\.from\("([a-z_]+)"\)/g)).map((m) => m[1]);
  const imports = Array.from(readerSrc.matchAll(/^import .* from "([^"]+)";/gm)).map((m) => m[1]);
  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)", color: "var(--ta-text-primary)" }}>
      <p style={MONO}>Dev specimen · Phase 6 · Step 2</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The tutor shell</h1>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
        <strong>Real on /tutor:</strong> identity (cookie session, tutor role), the active relationships that name this tutor (RLS, 6.1), the related students&apos; display names, states A and B, Account, sign-out.{" "}
        <strong>Fixture here:</strong> every name in these frames (“Specimen …”), and state C — which no production account can reach because no events table exists (5.6).{" "}
        <strong>Not built, and not pretended:</strong> a next act for a tutor, the relationship surface (6.3), sessions, work, recordings, assistance — every region renders nothing.
      </p>

      <h2 style={H2}>States A · B · C side by side · 390×844 first paint · both themes</h2>
      <p style={NOTE}>Three-second test: a reader should know there is nothing to do here, and why. There is no primary action in any state (P6-R4).</p>
      {(["dark", "light"] as const).map((theme) => (
        <div key={theme} style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
          <Frame q={`state=A&theme=${theme}`} w={390} h={844} scale={0.75} title={`A · no relationships · ${theme}`} />
          <Frame q={`state=B&theme=${theme}`} w={390} h={844} scale={0.75} title={`B · relationships, no events · ${theme}`} />
          <Frame q={`state=C&theme=${theme}`} w={390} h={844} scale={0.75} title={`C · FIXTURE ONLY (unreachable today) · ${theme}`} />
        </div>
      ))}

      <h2 style={H2}>Row density · 1 · 2 · 4 subjects · 390</h2>
      <p style={NOTE}>The subject is the unit; rows sit inside it. A row is a display name and the subject — nothing else. Rows are not links: nothing resolves for a relationship yet (6.3).</p>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        <Frame q="state=B&n=1" w={390} h={844} scale={0.75} title="1 subject" />
        <Frame q="state=B&n=2" w={390} h={844} scale={0.75} title="2 subjects" />
        <Frame q="state=B&n=4" w={390} h={844} scale={0.75} title="4 subjects" />
      </div>

      <h2 style={H2}>1280 · state B · both themes</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        <Frame q="state=B&n=2&theme=dark" w={1280} h={800} scale={0.45} title="B · dark · 1280" />
        <Frame q="state=B&n=2&theme=light" w={1280} h={800} scale={0.45} title="B · light · 1280" />
      </div>

      <h2 style={H2}>Ordering is fixed and non-evaluative — shuffled fixture in, one order out</h2>
      <p style={NOTE}>Subjects in the 3.1 config order; within a subject, rows by display name (locale compare, case-insensitive), ties by opaque id. Never by start date, never by anything a student did. The sort, verbatim from <code>src/lib/tutor/data.ts</code>:</p>
      <pre style={PRE}>{readerSrc.match(/export function orderRows[\s\S]*?\n}\n/)?.[0] ?? "(orderRows not found)"}</pre>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--ta-space-6)", marginTop: "var(--ta-space-4)" }}>
        <div><p style={MONO}>fixture input (deliberately shuffled)</p><pre style={PRE}>{SHUFFLED_INPUT.join("\n")}</pre></div>
        <div><p style={MONO}>rendered order (4-subject frame)</p><pre style={PRE}>{fixtureContext("B", 4).groups.map((g) => `${g.subjectId}\n${g.rows.map((r) => `  ${r.displayName} · ${r.studentId}`).join("\n")}`).join("\n")}</pre></div>
      </div>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>Flat order of all rows, for the tie-break check (two “Specimen Anand”): {sorted.map((r) => `${r.displayName} (${r.studentId})`).join(" → ")}.</p>

      <h2 style={H2}>Two violations, shown impossible</h2>
      <p style={NOTE}>Both attacks go through the shell&apos;s own code path and are rejected by the compiler — not by a runtime check someone could remove. The reader imports {imports.length} modules and names {tables.length} tables: <code>{tables.join(", ")}</code>. It has no path to enrolments, environment_state or auth.users.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--ta-space-6)", marginTop: "var(--ta-space-4)" }}>
        <div><p style={MONO}>attack 1 · a non-related student&apos;s name</p><pre style={PRE}>{attack1 ?? "(file missing)"}</pre></div>
        <div><p style={MONO}>attack 2 · a related student&apos;s other subject</p><pre style={PRE}>{attack2 ?? "(file missing)"}</pre></div>
      </div>
      <p style={{ ...MONO, marginTop: "var(--ta-space-4)" }}>tsc, directives stripped — the raw errors</p>
      <pre style={PRE}>{tscOut ?? "(tsc output missing — run the attack check)"}</pre>
      <p style={NOTE}>Reach is the database&apos;s (6.1 RLS: four tutor read policies gated by an active relationship). <code>scripts/test-tutor-visibility.mjs</code> proves the runtime half: a tutor&apos;s anon-key client reading a non-related profile, or a related student&apos;s other-subject enrolment, gets zero rows.</p>

      <h2 style={H2}>Robustness · grayscale · reduced motion · no JavaScript · 390</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        <Frame q="state=B&gray=1" w={390} h={700} scale={0.75} title="grayscale · B (nothing is carried by colour)" />
        <Frame q="state=B&rm=1" w={390} h={700} scale={0.75} title="reduced motion · B (nothing moves anyway)" />
        <Frame q="state=B&theme=light" w={390} h={700} scale={0.75} title="no JavaScript · B (sandboxed iframe, scripts blocked)" noJs />
      </div>

      <h2 style={H2}>The copy (chosen candidates)</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "var(--ta-space-4)" }}>
        <thead><tr><th style={TD}>state</th><th style={TD}>heading (h1)</th><th style={TD}>line</th></tr></thead>
        <tbody>
          <tr><td style={TD}>A</td><td style={TD}>{TUTOR_COPY.A.heading}</td><td style={TD}>{TUTOR_COPY.A.line}</td></tr>
          <tr><td style={TD}>B</td><td style={TD}>{TUTOR_COPY.B.heading}</td><td style={TD}>{TUTOR_COPY.B.line}</td></tr>
        </tbody>
      </table>

      <h2 style={H2}>Regions · third scope of the one registry · nothing renders</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "var(--ta-space-4)" }}>
        <thead><tr><th style={TD}>region</th><th style={TD}>slot</th><th style={TD}>module gate</th><th style={TD}>needs</th><th style={TD}>today</th></tr></thead>
        <tbody>
          {TUTOR_SLOTS.map((s) => (
            <tr key={s.id}><td style={TD}>{TUTOR_REGIONS[s.region].title}</td><td style={TD}>{s.name} <span style={MONO}>{s.phase}</span></td><td style={TD}><code>{s.module}</code></td><td style={TD}>{s.needs}</td><td style={TD}>{s.today}</td></tr>
          ))}
          <tr><td style={TD}>{TUTOR_REGIONS.relationships.title}</td><td style={TD}>subject groups + rows</td><td style={TD}><code>tutor-relationship</code> (live)</td><td style={TD}>active relationships naming this tutor</td><td style={TD}>renders when ≥1 exists; otherwise no DOM</td></tr>
        </tbody>
      </table>

      <h2 style={H2}>Navigation · {TUTOR_NAV_ITEMS.length} destinations · all resolve</h2>
      <ul style={{ ...NOTE, margin: "var(--ta-space-3) 0 0", paddingLeft: "1.2em" }}>{TUTOR_NAV_ITEMS.map((i) => <li key={i.href}>{i.label} → <code>{i.href}</code></li>)}</ul>

      <h2 style={H2}>Never contains</h2>
      <ul style={{ ...NOTE, margin: "var(--ta-space-3) 0 0", paddingLeft: "1.2em" }}>{NEVER_CONTAINS.map((x) => <li key={x}>{x}</li>)}</ul>
    </main>
  );
}
