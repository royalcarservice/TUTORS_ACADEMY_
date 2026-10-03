import fs from "node:fs";
import path from "node:path";

import { notFound } from "next/navigation";

import { LEVERS_COPY } from "@/components/tutor/environment-levers";
import { LEVER_IDS, LEVER_LABELS, LEVER_NAMES, LEVER_OPTIONS } from "@/lib/environment/levers";
import { SUBJECTS } from "@/lib/subjects/subjects";

import { SPECIMENS, type SpecimenKey } from "./fixtures";

/* /dev/environment-levers — THE SPECIMEN PAGE (Phase 6 · Step 4 · Part 9).
 * Dev-only (404 in production). The real surface component in iframes from
 * labelled fixtures, next to the evidence the harnesses pin on the real
 * route and the live DB. Nothing here is a person. */
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
        <iframe src={`/dev/environment-levers/frame?${q}`} title={title} width={w} height={h} loading="lazy" sandbox={noJs ? "" : undefined} style={{ border: 0, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }} />
      </div>
    </figure>
  );
}

const readJson = (p: string) => { try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), p), "utf8")); } catch { return null; } };

const INVENTORY = [
  ["accent triad", "identity", "the subject's; validated at build (3.7); not a lever a tutor turns"],
  ["atmosphere", "inert", "six authored names read by no renderer — a control would change nothing"],
  ["motif", "identity", "one kind per subject; another kind is another subject's room"],
  ["motion character", "ADJUSTABLE", "six authored parameter sets; visible only where the ambient runs; off under reduced motion regardless"],
  ["density", "ADJUSTABLE", "three authored values; every motif renderer reads it; the Room reduces one step"],
];

export default function EnvironmentLeversSpecimen() {
  if (process.env.NODE_ENV === "production") notFound();
  const B = readJson("audit/levers-baseline.json");
  const C = readJson("audit/lever-combinations.json");
  const A = (() => { try { return fs.readFileSync(path.join(process.cwd(), "audit/attacks/tsc-output.txt"), "utf8"); } catch { return null; } })();
  const keys = Object.keys(SPECIMENS) as SpecimenKey[];
  const g = (n: string) => B?.gates?.[n];
  return (
    <main id="main" className="ta-container ta-container--content" style={{ paddingBlock: "var(--ta-space-10) var(--ta-space-24)" }}>
      <p style={MONO}>dev · specimen · Phase 6 · Step 4</p>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500, fontSize: "var(--ta-display-sm)", margin: "var(--ta-space-2) 0 var(--ta-space-4)" }}>The levers</h1>
      <p style={NOTE}>A tutor shapes ONE subject&rsquo;s environment, for everyone in it. Two levers, closed authored sets, every combination validated at build; one Physics; absence is the authored default; nobody is told.</p>

      <h2 style={H2}>1 · The inventory and the verdict</h2>
      <table style={{ borderCollapse: "collapse", marginTop: "var(--ta-space-4)" }}>
        <thead><tr><th style={TD}>lever (3.1)</th><th style={TD}>verdict</th><th style={TD}>why</th><th style={TD}>options presented</th></tr></thead>
        <tbody>
          {INVENTORY.map(([name, verdict, why]) => {
            const id = LEVER_IDS.find((l) => LEVER_NAMES[l].toLowerCase() === name);
            return (
              <tr key={name}>
                <td style={TD}>{name}</td><td style={TD}><code>{verdict}</code></td><td style={TD}>{why}</td>
                <td style={TD}>{id ? (LEVER_OPTIONS[id] as readonly string[]).map((o) => (LEVER_LABELS[id] as Record<string, string>)[o]).join(" · ") : "— (not a control)"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={H2}>2 · Every reachable combination, at build</h2>
      <p style={NOTE}><code>scripts/validate-subjects.mjs</code> enumerates density × motion character per subject and re-asserts identity contrast/ΔE/ring, substrate and edge budgets, the Room rule, motion caps and reduced-motion parity. Any failing combination fails the build.</p>
      <pre style={PRE}>{C ? `count ${C.count} (${C.perSubject} per subject × ${SUBJECTS.length} subjects) · pass ${C.pass} · generated ${C.generatedAt}` : "audit/lever-combinations.json not found — run node scripts/validate-subjects.mjs --json"}</pre>
      {C && (
        <table style={{ borderCollapse: "collapse", marginTop: "var(--ta-space-4)" }}>
          <thead><tr><th style={TD}>subject</th>{(LEVER_OPTIONS.motionChar as readonly string[]).map((m) => <th key={m} style={TD}>{m}</th>)}</tr></thead>
          <tbody>
            {SUBJECTS.map((s) => (
              <tr key={s.id}><td style={TD}>{s.id}</td>{(LEVER_OPTIONS.motionChar as readonly string[]).map((m) => (
                <td key={m} style={TD}><code>{(LEVER_OPTIONS.density as readonly string[]).map((d) => { const r = (C.reports as Array<{ subject: string; levers: { density: string; motionChar: string }; pass: boolean }>).find((x) => x.subject === s.id && x.levers.density === d && x.levers.motionChar === m); return r ? (r.pass ? "✓" : "✗") : "·"; }).join("")}</code></td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ ...NOTE, marginTop: "var(--ta-space-2)" }}>Each cell: sparse · balanced · dense.</p>

      <h2 style={H2}>3 · The surface, three states</h2>
      <div style={{ display: "flex", gap: "var(--ta-space-4)", flexWrap: "wrap", marginTop: "var(--ta-space-4)" }}>
        {keys.map((k) => <Frame key={k} q={`s=${k}`} w={390} h={1100} scale={0.6} title={SPECIMENS[k].label} />)}
        <Frame q="s=mine&failed=1" w={390} h={1100} scale={0.6} title="a save that did not land (?shape=failed)" />
      </div>
      <p style={{ ...NOTE, marginTop: "var(--ta-space-4)" }}>The blast-radius sentence, verbatim, in the form before the save control: <q>{LEVERS_COPY.blastRadius("Physics")}</q></p>
      <p style={NOTE}>The shared note, when another tutor shaped last: <q>{LEVERS_COPY.shapedByOther}</q> — no name, no date.</p>
      <div style={{ display: "flex", gap: "var(--ta-space-4)", flexWrap: "wrap", marginTop: "var(--ta-space-4)" }}>
        <Frame q="s=mine&gray=1" w={390} h={1100} scale={0.5} title="grayscale" />
        <Frame q="s=mine&rm=1" w={390} h={1100} scale={0.5} title="reduced motion" />
        <Frame q="s=mine" w={390} h={1100} scale={0.5} title="JavaScript off (sandboxed frame)" noJs />
        <Frame q="s=mine&theme=light" w={390} h={1100} scale={0.5} title="light" />
        <Frame q="s=mine" w={1280} h={900} scale={0.3} title="1280" />
      </div>

      <h2 style={H2}>4 · The evidence on the real route and the live DB</h2>
      {!B && <p style={NOTE}><code>audit/levers-baseline.json</code> not found — run <code>node audit/levers.cjs --write</code> against the prod build.</p>}
      {B && (
        <table style={{ borderCollapse: "collapse", marginTop: "var(--ta-space-4)" }}>
          <tbody>
            {[
              ["five reader classes, one environment", "five reader classes (visitor · student A · student B · tutor T · tutor U) see a byte-identical environment: same shell-root lever attrs + identical motif markup"],
              ["absence = authored default", "absence = authored default: with no row the motifs are byte-identical to a row holding the authored values; only data-levers-source differs (authored vs shaped)"],
              ["write with JavaScript off", "write (JS off): real form submit → 303 → back on the surface; row = dense/energetic shaped by T; surface shows 'Last shaped by you.' and the values"],
              ["idempotent", "idempotent: saving the same values again → still one row, same values"],
              ["unauthored never lands", "unauthored values ('very-dense', a hex) never land: 303 back, row unchanged"],
              ["GET/HEAD/prefetch write nothing", "GET / HEAD / prefetch on the handler: 405, nothing written"],
              ["revert is real", "revert: POST intent=revert → 303 → row deleted → surface reads 'This environment is as authored.' and the revert form is gone"],
              ["shared note", "shared note: a row shaped by another tutor reads 'Last shaped by another tutor placed in this subject.' (no name, no date)"],
              ["no placement ≡ nonexistent", "route: no placement ≡ nonexistent subject — same 404 status and identical canonical document (6.3's form: echoed subject param tokenised, flight rows sorted) (tutor T)"],
              ["no student-facing notice", "no student-facing notice: no shaping/changelog string on /student, /subjects, the physics room, the mathematics room"],
              ["axe both themes", "axe clean both themes, contrast measured"],
              ["no-JS text parity", "no-JS complete: identical main text without JavaScript"],
            ].map(([label, name]) => (
              <tr key={name}><td style={TD}>{label}</td><td style={TD}><code>{g(name)?.pass ? "PASS" : g(name) ? "FAIL" : "—"}</code></td><td style={{ ...TD, maxWidth: "60ch", wordBreak: "break-word" }}><code style={{ fontSize: "var(--ta-text-2xs)" }}>{String(g(name)?.detail ?? "").slice(0, 400)}</code></td></tr>
            ))}
          </tbody>
        </table>
      )}
      {B && <pre style={PRE}>{"five classes (environment sha):\n" + Object.entries(B.classes as Record<string, { envSha: string; attrs: string }>).map(([k, v]) => `${k.padEnd(9)} ${v.envSha}  ${v.attrs}`).join("\n")}</pre>}

      <h2 style={H2}>5 · Two attacks that fail to compile (permanent gate)</h2>
      <p style={NOTE}>Attack 6 writes settings for a student (and smuggles an identity value as a lever); attack 7 reads settings scoped to a student and asks the shell to render a student&rsquo;s environment. <code>node audit/attacks.cjs</code> requires exactly the declared codes.</p>
      <pre style={PRE}>{A ? A.split("\n\n").filter((b) => /levers-attack/.test(b)).join("\n\n") : "audit/attacks/tsc-output.txt not found"}</pre>

      <h2 style={H2}>6 · What is real and what is not</h2>
      <table style={{ borderCollapse: "collapse", marginTop: "var(--ta-space-4)" }}>
        <tbody>
          {[
            ["/tutor/[subject]/environment", "REAL — tutor with an active placement in the subject; else 404 (same bytes as an unknown subject)"],
            ["POST /tutor/[subject]/environment/shape", "REAL — 303; RLS decides; request-scoped client; no GET"],
            ["environment_settings", "REAL — one row per subject at most; CHECK-constrained values; no student column"],
            ["a way in from the shell", "NOT YET — the 6.2 shell composition and 6.3 surface are untouched; reachable by URL (reported)"],
            ["preview", "NOT BUILT — the environment is the only renderer; the surface links to the room"],
            ["student notice / changelog / history", "DOES NOT EXIST — a decision (P6-R10)"],
            ["atmosphere / motif / accent / mark / type / frame controls", "DO NOT EXIST — identity or inert (P6-R11)"],
          ].map(([a, b]) => <tr key={a}><td style={TD}><code>{a}</code></td><td style={TD}>{b}</td></tr>)}
        </tbody>
      </table>
    </main>
  );
}
