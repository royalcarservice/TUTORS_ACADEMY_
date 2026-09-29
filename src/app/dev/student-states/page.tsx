import fs from "node:fs";
import path from "node:path";

import Link from "next/link";
import { notFound } from "next/navigation";

import { FRAME_STATES } from "./states";

/* DEV-ONLY INVENTORY · /dev/student-states (Phase 5 · Step 7 · Part 7).
 * 404s in production. The table is READ FROM docs/STATE_LANGUAGE.md so the
 * page cannot drift from the document; each specimen is the real component
 * in a 390-wide frame with its claim printed beneath. */

export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-2xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 var(--ta-space-3)" };

/** Which inventory row each frame stands for, and what the frame CLAIMS (printed beneath). */
const SPECIMENS: Array<{ state: (typeof FRAME_STATES)[number]; rows: string; real: boolean; claim: string }> = [
  { state: "not-found", rows: "12, 13", real: true, claim: "There is no page here. (The draft-not-enrolled miss is byte-identical by design.)" },
  { state: "page-failed", rows: "15", real: true, claim: "Nothing was recorded; opening again is a read." },
  { state: "student-failed", rows: "4, 16", real: true, claim: "The read failed — not a claim that there are no subjects." },
  { state: "environment-failed", rows: "5, 16", real: true, claim: "The environment could not be opened; nothing was recorded." },
  { state: "entry-failed", rows: "7", real: true, claim: "No row exists; repeating the idempotent write is safe." },
  { state: "login-ended", rows: "10, 11", real: true, claim: "Auth cookies were present and invalid — the session ended (a fact); sign-in returns to where they were." },
  { state: "login-continue", rows: "23", real: true, claim: "Where sign-in goes. Nothing about why (unknown)." },
  { state: "login-refused", rows: "20", real: false, claim: "The pair does not match — deliberately vague (security decision)." },
  { state: "login-unavailable", rows: "21", real: false, claim: "Nothing was changed; repeating is safe. Driver message never shown." },
  { state: "in-flight", rows: "6", real: false, claim: "The student’s own action is being attempted. No outcome." },
  { state: "region-failing", rows: "3", real: true, claim: "Nothing. An absent region claims nothing; one log line was written on the server." },
  { state: "global-error", rows: "15 (root layout)", real: true, claim: "The plainest honest page: no theme can be assumed." },
];

function readInventory(): string[][] {
  try {
    const md = fs.readFileSync(path.join(process.cwd(), "docs/STATE_LANGUAGE.md"), "utf8");
    const lines = md.split("\n").filter((l) => /^\| \d+ \|/.test(l));
    return lines.map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
  } catch { return []; }
}

export default function StudentStatesDev() {
  if (process.env.NODE_ENV === "production") notFound();
  const rows = readInventory();
  return (
    <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-12) var(--ta-space-section)" }}>
      <p style={MONO}>Dev specimen · Phase 5 · Step 7 · not linked from any surface · 404 in production</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" }}>The student states</h1>
      <p style={{ maxWidth: "70ch", color: "var(--ta-text-secondary)" }}>An error is a claim. Every row below says what renders and what that rendering claims. Source: <code>docs/STATE_LANGUAGE.md</code> ({rows.length} rows).</p>

      <h2 style={H2}>Inventory</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>{["#", "State", "Where", "What renders", "What it claims", "Verified"].map((h) => <th key={h} style={{ ...TD, ...MONO }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]} data-inventory-row={r[0]}>{r.map((c, i) => <td key={i} style={TD}>{c.replace(/\*\*/g, "")}</td>)}</tr>)}</tbody>
      </table>

      <h2 style={H2}>Specimens at 390 (light; the harness renders dark via prefers-color-scheme)</h2>
      <p style={{ maxWidth: "70ch", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>
        <strong>Real</strong> = the production component with the production copy, through the production path. <strong>Simulation</strong> = the same primitive rendered statically because the trigger is a server action mid-flight. Forced real failures: <Link href="/dev/student-states/throw">/dev/student-states/throw</Link> (a server component throws → the real root error boundary), <Link href="/dev/student-states/no-such-page">/dev/student-states/no-such-page</Link> (the real 404), and the region frame below (the real isolation wrapper with a throwing resolver).
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-6)", marginTop: "var(--ta-space-6)" }}>
        {SPECIMENS.map((s) => (
          <figure key={s.state} data-specimen={s.state} style={{ margin: 0, width: 390 }}>
            <figcaption style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{s.state} · rows {s.rows} · {s.real ? "real" : "simulation"}</figcaption>
            <div style={{ width: 390, height: 640, overflow: "hidden", border: "1px solid var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)" }}>
              <iframe src={`/dev/student-states/frame?state=${s.state}`} title={s.state} width={390} height={640} loading="lazy" style={{ border: 0, width: 390, height: 640 }} />
            </div>
            <p data-claim style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", marginTop: "var(--ta-space-2)" }}><span style={MONO}>Claims · </span>{s.claim}</p>
          </figure>
        ))}
      </div>

      <h2 style={H2}>States with no specimen — because nothing of ours renders</h2>
      <ul style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "70ch" }}>
        <li>Rows 1, 2, 18 (arriving, soft navigation, slow network): no loading.tsx, no spinner, no skeleton. The browser&apos;s own indication.</li>
        <li>Row 8 (unknown outcome): the browser&apos;s own failure page; recovery = the environment GET. Verified by cutting the network mid-POST in the report.</li>
        <li>Row 9 (failed after commit): the environment renders as enrolled, never entered — the ordinary page.</li>
        <li>Row 14 (role redirect), 17 (double submit), 22 (sign-out): a redirect; the destination is the state.</li>
        <li>Row 19 (offline): nothing. No service worker, nothing cached, nothing at rest — negative evidence in the report.</li>
      </ul>
    </main>
  );
}
