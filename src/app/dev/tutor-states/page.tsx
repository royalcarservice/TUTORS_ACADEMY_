import fs from "node:fs";
import path from "node:path";

import Link from "next/link";
import { notFound } from "next/navigation";

import { FRAME_CASES, TUTOR_STATES } from "./states";

/* DEV-ONLY INVENTORY · /dev/tutor-states (Phase 6 · Step 5 · Part 8). 404s in
 * production. The fourteen states with their claims; the write's four cases
 * and the sweep results READ FROM audit/tutor-states.json (the harness's last
 * run — nothing here is computed by the page); the account surface beside the
 * student's; docs/TUTOR_DISTANCE.md rendered as text; and a plain statement of
 * what is real and what is simulated. */

export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };
const PRE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "var(--ta-surface-raised)", padding: "var(--ta-space-4)", borderRadius: "var(--ta-radius-md)", margin: 0 };

function readJson(): Record<string, unknown> | null {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "audit/tutor-states.json"), "utf8")); } catch { return null; }
}
function readDoc(): string {
  try { return fs.readFileSync(path.join(process.cwd(), "docs/TUTOR_DISTANCE.md"), "utf8"); } catch { return "(docs/TUTOR_DISTANCE.md not found)"; }
}

const FRAME_LABEL: Record<(typeof FRAME_CASES)[number], string> = {
  "read-failed": "row 3 · the shaping surface's settings read failed — the honest page, no form (REAL component, REAL copy)",
  "write-failed": "row 6 · a save that did not land — one sentence beside Save (REAL component from a fixture)",
  "as-authored": "row 11 · no settings row — authored values, no Revert (REAL component from a fixture)",
  "shaped-by-you": "state line · Last shaped by you (REAL component from a fixture)",
  "shaped-by-other": "state line · Last shaped by another tutor (REAL component from a fixture)",
  "login-ended": "row 8 · the login page after a session ended mid-save, with the settling GET as the return path (REAL component)",
  account: "P6-R14 · the account surface — SIMULATED markup with fixture values (the real page needs a session; its DOM is in the harness output below)",
};

export default function TutorStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const j = readJson();
  const ev = (j?.evidence ?? {}) as Record<string, unknown>;
  const gates = (j?.gates ?? {}) as Record<string, { pass: boolean; detail: unknown }>;
  const write = (ev.write ?? {}) as Record<string, unknown>;
  const tutorAccount = (ev.tutorAccount ?? {}) as Record<string, unknown>;
  const studentAccount = (ev.studentAccount ?? {}) as Record<string, unknown>;
  const doc = readDoc();
  return (
    <main id="main" className="ta-container" style={{ paddingBlock: "var(--ta-space-10) var(--ta-space-section)" }}>
      <p style={MONO}>Dev · Phase 6 · Step 5</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The tutor&rsquo;s states, as a set</h1>
      <p style={{ maxWidth: "var(--ta-measure)", color: "var(--ta-text-secondary)", marginTop: "var(--ta-space-4)" }}>
        Three tutor surfaces read against one state language. Dev only; 404 in production. Harness: <code>node audit/tutor-states.cjs --check</code> (last run {String(j?.generatedAt ?? "never")}).
      </p>

      <h2 style={H2}>What is real and what is simulated</h2>
      <ul style={{ fontSize: "var(--ta-text-sm)", lineHeight: 1.6, maxWidth: "var(--ta-measure)" }}>
        <li><strong>Real:</strong> every number and string under &ldquo;the write&rsquo;s four cases&rdquo;, &ldquo;sweeps&rdquo; and &ldquo;account surfaces&rdquo; comes from the harness run against the production server with fixture accounts — real POSTs, real cookies, real rows (restored after).</li>
        <li><strong>Real components, fixture data:</strong> the frames below render the production components with 6.4&rsquo;s specimen views; the form posts to the real handler (which refuses without a session).</li>
        <li><strong>Simulated:</strong> the <code>account</code> frame is static markup with fixture values. The failed-read TRIGGER was not forced against production: row 3 is proven by the code branch and the frame, and said so.</li>
        <li><strong>Recorded, not fixed:</strong> row 9 (concurrent change) — a silent last-write-wins, stopped and reported as a design decision.</li>
      </ul>

      <h2 style={H2}>The fourteen states</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["#", "State", "Surface", "What renders", "What it claims", "How verified", "Status"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>
          {TUTOR_STATES.map((s) => (
            <tr key={s.n}><td style={TD}>{s.n}</td><td style={TD}>{s.state}</td><td style={TD}><code>{s.surface}</code></td><td style={TD}>{s.renders}</td><td style={TD}>{s.claims}</td><td style={TD}>{s.test}</td><td style={TD}>{s.verified}{s.reason ? ` — ${s.reason}` : ""}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={H2}>The write&rsquo;s four cases (P6-R15) — from the last harness run</h2>
      <pre style={PRE}>{JSON.stringify({ failed: write.failed, unknown: write.unknown, sessionEnded: write.sessionEnded, concurrent: write.concurrent }, null, 2)}</pre>

      <h2 style={H2}>The account surface, beside the student&rsquo;s</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "var(--ta-space-4)" }}>
        <div><p style={MONO}>/tutor/account · hash {String(tutorAccount.hash ?? "—")}</p><pre style={PRE}>{String(tutorAccount.text ?? "(run the harness)")}</pre></div>
        <div><p style={MONO}>/student/account · hash {String(studentAccount.hash ?? "—")}</p><pre style={PRE}>{String(studentAccount.text ?? "(run the harness)")}</pre></div>
      </div>

      <h2 style={H2}>Gates</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>{Object.entries(gates).map(([k, v]) => <tr key={k}><td style={TD}>{v.pass ? "PASS" : "FAIL"}</td><td style={TD}><code>{k}</code></td><td style={{ ...TD, fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)" }}>{JSON.stringify(v.detail).slice(0, 400)}</td></tr>)}</tbody>
      </table>

      <h2 style={H2}>Frames (390 first; add &amp;theme=light, &amp;gray=1, &amp;rm=1)</h2>
      {FRAME_CASES.map((c) => (
        <section key={c} style={{ marginBottom: "var(--ta-space-8)" }}>
          <p style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{FRAME_LABEL[c]} · <Link href={`/dev/tutor-states/frame?case=${c}`}>open</Link></p>
          <iframe title={c} src={`/dev/tutor-states/frame?case=${c}`} width={390} height={760} style={{ border: "1px solid var(--ta-border-subtle)", background: "var(--ta-surface-base)" }} />
        </section>
      ))}

      <h2 style={H2}>docs/TUTOR_DISTANCE.md</h2>
      <pre style={PRE}>{doc}</pre>
    </main>
  );
}
