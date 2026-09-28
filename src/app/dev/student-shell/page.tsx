import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

import { STUDENT_SLOTS, STUDENT_SLOT_REGIONS } from "@/config/student-slots";

import { NEVER_CONTAINS } from "./fixtures";

/* DEV-ONLY SPECIMEN · /dev/student-shell — 404s in production.
 * Everything shown comes from fixtures (see ./fixtures.tsx) rendered by the
 * real shell component in iframes at exact viewports. The performance
 * readout and boundary checklist are read from audit/shell-baseline.json,
 * written by `audit/shell.cjs` (the harness extension, 390px reference).   */

export const dynamic = "force-dynamic";

const STATES = ["A", "B", "C"] as const;
const STATE_NAME = { A: "A — no enrolment", B: "B — enrolled, never entered", C: "C — enrolled, active" } as const;



interface Baseline {
  generatedAt?: string;
  boundary?: Record<string, { pass: boolean; evidence: string }>;
  perf?: Record<string, unknown>;
  hierarchy?: unknown;
  fold?: unknown;
}

function readBaseline(): Baseline | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "audit/shell-baseline.json"), "utf8")) as Baseline;
  } catch {
    return null;
  }
}

const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const NOTE: React.CSSProperties = { fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "70ch" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };

function Frame({ q, w, h, scale = 1, title, noJs }: { q: string; w: number; h: number; scale?: number; title: string; noJs?: boolean }) {
  return (
    <figure style={{ margin: 0, width: w * scale }}>
      <figcaption style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{title}</figcaption>
      <div style={{ width: w * scale, height: h * scale, overflow: "hidden", border: "1px solid var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)" }}>
        <iframe
          src={`/dev/student-shell/frame?${q}`}
          title={title}
          width={w}
          height={h}
          loading="lazy"
          sandbox={noJs ? "" : undefined}
          style={{ border: 0, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      </div>
    </figure>
  );
}

export default function DevStudentShellPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const b = readBaseline();
  const perf = b?.perf as Record<string, string | number> | undefined;
  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)", color: "var(--ta-text-primary)" }}>
      <p style={MONO}>Dev specimen · Phase 5 · Step 3</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The student shell</h1>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-3)" }}>
        <strong>Real:</strong> identity (Supabase cookie session), enrolments, environment state, the three states, the primary surface, subject rows, Account, sign-out.{" "}
        <strong>Deferred:</strong> every slot below (Phases 6–9), the next-action rungs 1–3 (5.4), the environment workspace and the enrolment write (5.5), progress language (5.6).
        Everything in these frames is a <strong>fixture</strong> rendered by the production shell component; slot “content” is labelled specimen text.
      </p>

      <h2 style={H2}>Three states · 390×844 first paint · both themes</h2>
      <p style={NOTE}>The three-second test is judged here: what a reader identifies as the next action without scrolling.</p>
      {(["dark", "light"] as const).map((theme) => (
        <div key={theme} style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
          {STATES.map((s) => <Frame key={s} q={`state=${s}&theme=${theme}`} w={390} h={844} title={`${STATE_NAME[s]} · ${theme}`} />)}
        </div>
      ))}

      <h2 style={H2}>Three states · 1280×800 · both themes (scaled ½)</h2>
      {(["dark", "light"] as const).map((theme) => (
        <div key={theme} style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
          {STATES.map((s) => <Frame key={s} q={`state=${s}&theme=${theme}`} w={1280} h={800} scale={0.5} title={`${STATE_NAME[s]} · ${theme}`} />)}
        </div>
      ))}

      <h2 style={H2}>Slot extremes · state C · 390 · zero / some / all</h2>
      <p style={NOTE}>A slot with no data renders nothing. “Some” = today’s sessions, tutor presence, progress. “All” = the nine mapped slots. The primary surface and the rows must keep their hierarchy at every extreme.</p>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap", marginTop: "var(--ta-space-6)" }}>
        {(["none", "some", "all"] as const).map((x) => <Frame key={x} q={`state=C&theme=dark&slots=${x}`} w={390} h={1200} title={`slots: ${x}`} />)}
      </div>

      <h2 style={H2}>Slot map</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["Slot", "Phase", "Region · position", "Needs", "Renders today", "Fit"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {STUDENT_SLOTS.map((s) => (
            <tr key={s.id}>
              <td style={TD}>{s.name}</td><td style={TD}>{s.phase}</td>
              <td style={TD}>{STUDENT_SLOT_REGIONS[s.region].title} · {s.position}</td>
              <td style={TD}>{s.needs}</td><td style={TD}>{s.today}</td><td style={TD}>{s.fit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={H2}>Boundary checklist</h2>
      {b?.boundary ? (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {Object.entries(b.boundary).map(([k, v]) => (
              <tr key={k}><td style={{ ...TD, fontFamily: "var(--ta-font-mono)" }}>{v.pass ? "PASS" : "FAIL"}</td><td style={TD}>{k}</td><td style={{ ...TD, color: "var(--ta-text-secondary)" }}>{v.evidence}</td></tr>
            ))}
          </tbody>
        </table>
      ) : <p style={NOTE}>Not yet measured — run <code>audit/shell.cjs --write</code>.</p>}

      <h2 style={H2}>What the shell never contains</h2>
      <ul style={{ ...NOTE, paddingLeft: "1.25rem" }}>{NEVER_CONTAINS.map((n) => <li key={n}>{n}</li>)}</ul>

      <h2 style={H2}>Grayscale · reduced motion · no JavaScript (390)</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-6)", flexWrap: "wrap" }}>
        {STATES.map((s) => <Frame key={s} q={`state=${s}&theme=dark&gray=1`} w={390} h={700} title={`grayscale · ${s}`} />)}
        <Frame q="state=C&theme=dark&rm=1" w={390} h={700} title="reduced motion · C" />
        <Frame q="state=C&theme=light" w={390} h={700} title="no JavaScript · C (sandboxed iframe, scripts blocked)" noJs />
      </div>

      <h2 style={H2}>Performance · mid-range Android profile</h2>
      {perf ? (
        <table style={{ borderCollapse: "collapse" }}>
          <tbody>{Object.entries(perf).map(([k, v]) => <tr key={k}><td style={{ ...TD, ...MONO }}>{k}</td><td style={TD}>{String(v)}</td></tr>)}</tbody>
        </table>
      ) : <p style={NOTE}>Not yet measured.</p>}
      {b?.generatedAt && <p style={{ ...MONO, marginTop: "var(--ta-space-3)" }}>measured {b.generatedAt}</p>}
    </main>
  );
}
