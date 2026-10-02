import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

import { ARC_COPY } from "@/components/student/arc-region";
import { RELATIONSHIP_COPY } from "@/components/tutor/relationship-surface";

import { SPECIMENS, specimenView, type SpecimenKey } from "./fixtures";

/* /dev/relationship-surface — THE SPECIMEN PAGE (Phase 6 · Step 3 · Part 9).
 * Dev-only (404 in production). The real surface component in iframes from
 * LABELLED FIXTURES, next to the evidence the harness pins on the real route.
 * Nothing here is a person. */
export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)" };
const NOTE: React.CSSProperties = { fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "70ch" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, margin: "var(--ta-space-12) 0 0" };
const TD: React.CSSProperties = { padding: "var(--ta-space-2) var(--ta-space-3)", borderBottom: "1px solid var(--ta-border-subtle)", verticalAlign: "top", fontSize: "var(--ta-text-sm)", textAlign: "left" };
const PRE: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)", background: "var(--ta-surface-raised)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", padding: "var(--ta-space-3)", overflowX: "auto", whiteSpace: "pre-wrap" };

function Frame({ q, w, h, scale = 1, title, noJs = false }: { q: string; w: number; h: number; scale?: number; title: string; noJs?: boolean }) {
  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{title}</figcaption>
      <div style={{ width: w * scale, height: h * scale, overflow: "hidden", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)" }}>
        <iframe src={`/dev/relationship-surface/frame?${q}`} title={title} width={w} height={h} loading="lazy" sandbox={noJs ? "" : undefined} style={{ border: 0, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }} />
      </div>
    </figure>
  );
}

function readBaseline() {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "audit/relationship-baseline.json"), "utf8")); } catch { return null; }
}

export default function RelationshipSurfaceSpecimen() {
  if (process.env.NODE_ENV === "production") notFound();
  const B = readBaseline();
  const keys = Object.keys(SPECIMENS) as SpecimenKey[];
  const views = keys.map((k) => ({ k, v: specimenView(k) }));
  return (
    <main id="main" className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-10) var(--ta-space-24)" }}>
      <p style={MONO}>dev · specimen · Phase 6 · Step 3</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500, fontSize: "var(--ta-display-sm)", margin: "var(--ta-space-2) 0 var(--ta-space-4)" }}>The relationship&rsquo;s surface</h1>
      <p style={NOTE}>One relationship → one page: WHO (the display name) · WHICH (the subject&rsquo;s environment) · WHERE (the arc) · THE RECORD (nothing, structurally) · what a tutor does here (nothing) · the way back. Every frame below is a fixture (&ldquo;Specimen …&rdquo;). Facts about real test accounts appear only as the harness&rsquo;s pinned output, and never as a name next to a date.</p>

      <h2 style={H2}>1 · Three students, one statement</h2>
      <p style={NOTE}>Three specimens at three different arc positions. The two statements under the arc are constants — <code>ARC_COPY.boundary</code> and <code>RELATIONSHIP_COPY.tutorStatement</code> — not functions of the student: the sentence cannot vary by anything a student did because nothing about the student reaches it.</p>
      <div style={{ display: "flex", gap: "var(--ta-space-4)", flexWrap: "wrap", marginTop: "var(--ta-space-4)" }}>
        {keys.map((k) => <Frame key={k} q={`s=${k}`} w={390} h={900} scale={0.6} title={`${SPECIMENS[k].displayName} · ${SPECIMENS[k].subjectId}`} />)}
      </div>
      <table style={{ borderCollapse: "collapse", marginTop: "var(--ta-space-4)" }}>
        <thead><tr><th style={TD}>specimen</th><th style={TD}>facts</th><th style={TD}>arc (done / ahead)</th><th style={TD}>statements</th></tr></thead>
        <tbody>
          {views.map(({ k, v }) => (
            <tr key={k}>
              <td style={TD}>{v.displayName}</td>
              <td style={TD}><code>{JSON.stringify(SPECIMENS[k].facts)}</code></td>
              <td style={TD}>{v.position.steps.map((s) => `${s.id}:${s.state}`).join(" ")}</td>
              <td style={TD}>identical — same two constants</td>
            </tr>
          ))}
        </tbody>
      </table>
      {B && (
        <div style={{ marginTop: "var(--ta-space-4)" }}>
          <p style={MONO}>real route · harness pin · sha-256 (first 16) of the two statements per related student</p>
          <pre style={PRE}>{Object.entries(B.statements as Record<string, { boundarySha: string; tutorSha: string; arc: string[] }>).map(([k, s]) => `${k.padEnd(10)} boundary ${s.boundarySha}  tutor ${s.tutorSha}  arc ${s.arc.map((a) => a.split(":")[2][0]).join("")}`).join("\n")}</pre>
        </div>
      )}

      <h2 style={H2}>2 · Three cases that cannot be told apart</h2>
      <p style={NOTE}>Never-related · ended · nonexistent (and a user id in the slot, garbage, the right id under the wrong subject, an unknown subject, and the same URL opened by an unrelated tutor) all leave the reader with <code>null</code>, and <code>null</code> has exactly one exit: <code>notFound()</code>. There is no second branch to render differently. The page cannot show those documents in a frame — they are the real route&rsquo;s 404 — so here is the harness&rsquo;s pinned evidence: status, raw byte length, and the canonical document hash (echoed route params tokenised, React Flight stream order-normalised — the same URL fetched twice varies in raw order, see the last row).</p>
      {B && (
        <pre style={PRE}>{Object.entries(B.cases as Record<string, { status: number; bytes: number; sha: string }>).map(([k, c]) => `${String(c.status).padEnd(4)} ${String(c.bytes).padStart(6)} B  ${c.sha}  ${k}`).join("\n")}\n\nsame url ×4 → raw ${JSON.stringify(B.sameUrlRuns.rawShas)}  canonical ${JSON.stringify(B.sameUrlRuns.canonicalShas)}</pre>
      )}

      <h2 style={H2}>3 · The arc&rsquo;s three consumers</h2>
      <p style={NOTE}>Scene 7, the student&rsquo;s region and this surface read <code>ARC_STEPS</code> at runtime; the harness lists all three from rendered DOM and gates on identity with the definition. The heading here is &ldquo;{RELATIONSHIP_COPY.arcHeading}&rdquo; and the list&rsquo;s accessible name &ldquo;{RELATIONSHIP_COPY.arcLabel("Physics")}&rdquo; — the subject of the sentence is the learning, not the person.</p>
      {B && <pre style={PRE}>{JSON.stringify(B.arcConsumers, null, 1)}</pre>}

      <h2 style={H2}>4 · Cross-subject is unrepresentable</h2>
      <p style={NOTE}>The address type is <code>{"{ subjectId: SubjectId; relationshipId: string }"}</code>; the reader&rsquo;s one query filters <code>tutor_id = auth.uid() AND subject_id = :subject AND id = :relationship AND state = &rsquo;active&rsquo;</code>. A relationship under another subject&rsquo;s URL is simply not found (row &ldquo;wrong subject&rdquo; above). Attack files 3–5 pin the signature: <code>audit/attacks.cjs</code> fails if any of them compiles.</p>

      <h2 style={H2}>5 · Perception</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-4)", flexWrap: "wrap", marginTop: "var(--ta-space-4)" }}>
        <Frame q="s=two&theme=light" w={390} h={900} scale={0.6} title="light · 390" />
        <Frame q="s=two&gray=1" w={390} h={900} scale={0.6} title="grayscale · state must read without hue" />
        <Frame q="s=two&rm=1" w={390} h={900} scale={0.6} title="reduced motion" />
        <Frame q="s=two" w={390} h={900} scale={0.6} title="no JavaScript (sandboxed iframe)" noJs />
        <Frame q="s=three&theme=light" w={320} h={900} scale={0.6} title="320 · light" />
      </div>

      <h2 style={H2}>6 · Failure behaviour of the record region</h2>
      <p style={NOTE}>The record loader is wired through <code>isolateAsync(&ldquo;region:relationship-record&rdquo;)</code> today, with nothing to read. This frame injects a loader that throws (the only consumer of the injectable argument): the region stays silent, the rest renders, and the server log line names the scope and subject — never the student.</p>
      <div style={{ marginTop: "var(--ta-space-4)" }}><Frame q="s=two&record=fail" w={390} h={900} scale={0.6} title="record loader throws → identical surface, one log line" /></div>

      <h2 style={H2}>7 · What this page refuses</h2>
      <pre style={PRE}>{["profile · avatar · bio · contact · email · account id", "dashboard · stats · metrics · charts · sparklines · progress bar", "recency: last / active / since / ago / seen / visited / date about the student (P6-R2 amendment)", "a zero: '0 sessions' · 'none' · 'not started'", "grading · notes · flags · messages · assignments · any action", "export · print · download · share · copy", "comparison: another student · cohort · average", "a link to any other student", "observation: analytics, beacons, access logging (no ruling)", "money language anywhere (P6-R8)"].join("\n")}</pre>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-4)" }}>Empty-record boundary, verbatim: &ldquo;{ARC_COPY.boundary}&rdquo; · Tutor statement, verbatim: &ldquo;{RELATIONSHIP_COPY.tutorStatement}&rdquo;</p>
    </main>
  );
}
