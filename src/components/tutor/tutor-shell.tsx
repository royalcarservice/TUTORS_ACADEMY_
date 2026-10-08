import Link from "next/link";

import { SubjectMark } from "@/components/brand/subject-mark";
import { ArchiveLink } from "@/components/tutor/archive-link";
import { ShapeLink } from "@/components/tutor/shape-link";
import type { ShellSubjectInfo } from "@/components/student/student-shell";
import { TUTOR_REGIONS, type TutorRegion } from "@/config/student-slots";
import type { SubjectId } from "@/lib/student/contract";
import type { SubjectGroup, TutorShellState } from "@/lib/tutor/data";

import type { ResolvedTutorSlot } from "./slots";

/* ════════════════════════════════════════════════════════════════════════
   THE TUTOR SHELL (Phase 6 · Step 2) — the student shell's composition rules
   (5.3), the tutor's facts (6.1). Pure render: everything arrives as props
   from the relationship-scoped reader; this file performs no reads.

   ONE DOMINANT SURFACE. In every state the surface is a statement, because
   today a tutor has NO NEXT ACT (6.1 Part 7: no P6 provider ships; nothing a
   tutor can do here changes anything). P6-R4: when there is no next act the
   surface says so AND why — relationships are set up by the academy, not from
   this page; teaching surfaces are not built. No invented CTA, no disabled
   control, no apology. The three-second test passes when the reader knows
   there is nothing to do here and why.

   SUBJECT GROUPS. The subject is the top-level unit; relationships sit inside
   it (locked decision 1). A row is display name · subject — nothing else
   (locked decision 2). 6.3: a row is ONE link to the relationship's own
   surface (/tutor/[subject]/[relationship]) — named for assistive
   technology with the student and the subject; the row's weight is the
   row's weight (5.3 equal-weight rule), never a second primary. Before 6.3
   the row was a plain <li> with no cursor, hover or focus (no false
   affordance; 6.2's baseline DOM has links:0). Order is the reader's fixed,
   non-evaluative order.

   REGIONS. The third scope of the one slot registry; every region renders
   nothing until a slot resolves to real data for THIS tutor. No counts.
   ════════════════════════════════════════════════════════════════════════ */

export const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

const DRAFT_LABEL = "Environment in draft";

export interface TutorShellProps {
  state: TutorShellState;
  groups: SubjectGroup[];
  subjects: Partial<Record<SubjectId, ShellSubjectInfo>>;
  slots: ResolvedTutorSlot[];
}

/** The copy, as pure data (so the dev page and the harness can read it). Chosen candidate recorded in the 6.2 report. */
export const TUTOR_COPY = {
  A: {
    eyebrow: "Now",
    heading: "No student is placed with you.",
    line: "The academy places a student with a tutor, one subject at a time; it is not done from this page. Teaching surfaces are not built.",
  },
  B: {
    eyebrow: "Now",
    heading: "Nothing to do here.",
    line: "The students placed with you are listed below, by subject. Placing is done by the academy, not from this page. Teaching surfaces are not built.",
  },
} as const;

export function TutorShell({ state, groups, subjects, slots }: TutorShellProps) {
  const copy = state.kind === "A-no-relationships" ? TUTOR_COPY.A : TUTOR_COPY.B;
  const regionSlots = (r: TutorRegion) => slots.filter((s) => s.region === r);

  return (
    <div data-tutor-shell data-state={state.kind} data-density="compact" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-8)" }}>
      {/* 1 · PRIMARY SURFACE — a statement, never a control (P6-R4). Brass frame: no subject is "the answer". */}
      <section aria-labelledby="tutor-primary-heading" data-primary-surface>
        <div
          data-spatial="room"
          style={{
            background: "var(--ta-surface-raised)",
            border: "1px solid var(--ta-border-subtle)",
            borderRadius: "var(--ta-radius-3)",
            padding: "clamp(1.25rem, 1rem + 2vw, 2.5rem)",
            boxShadow: "inset 3px 0 0 var(--ta-brand)",
          }}
        >
          <p style={MONO}>{copy.eyebrow}</p>
          <h1
            id="tutor-primary-heading"
            style={{
              margin: "var(--ta-space-2) 0 0",
              fontFamily: "var(--ta-font-display)",
              fontSize: "var(--ta-display-md)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: "var(--ta-text-primary)",
              textWrap: "balance",
            }}
          >
            {copy.heading}
          </h1>
          <p style={{ margin: "var(--ta-space-4) 0 0", fontSize: "var(--ta-text-base)", lineHeight: 1.55, color: "var(--ta-text-secondary)", maxWidth: "36rem" }}>
            {copy.line}
          </p>
        </div>
      </section>

      {/* 2 · TODAY — slots only (absent today) */}
      <SlotRegion region="today" items={regionSlots("today")} />

      {/* 3 · SUBJECT GROUPS — omitted entirely in state A; never a count. */}
      {groups.length > 0 && (
        <section aria-labelledby="tutor-relationships-heading" data-subject-groups>
          <h2 id="tutor-relationships-heading" style={{ ...MONO, marginBottom: "var(--ta-space-4)" }}>
            {TUTOR_REGIONS.relationships.title}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-6)" }}>
            {groups.map((g) => {
              const s = subjects[g.subjectId];
              const name = s?.name ?? g.subjectId;
              const hid = `tutor-subject-${g.subjectId}`;
              return (
                <section key={g.subjectId} aria-labelledby={hid} data-subject={g.subjectId}>
                  <h3 id={hid} style={{ margin: 0, display: "flex", alignItems: "center", gap: "var(--ta-space-3)", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-lg)", fontWeight: 500, color: "var(--ta-text-primary)" }}>
                    <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden>
                      <SubjectMark subject={g.subjectId} size={24} />
                    </span>
                    <span>{name}</span>
                    {s?.environmentName && <span style={{ fontSize: "var(--ta-text-sm)", fontWeight: 400, color: "var(--ta-text-secondary)" }}>{s.environmentName}</span>}
                    {s?.status === "draft" && <span style={{ ...MONO, marginLeft: "auto" }}>{DRAFT_LABEL}</span>}
                  </h3>
                  <ul style={{ listStyle: "none", margin: "var(--ta-space-3) 0 0", padding: 0, borderTop: "1px solid var(--ta-border-subtle)" }}>
                    {g.rows.map((r) => (
                      <li key={r.studentId} data-relationship-row style={{ borderBottom: "1px solid var(--ta-border-subtle)" }}>
                        <Link
                          href={`/tutor/${g.subjectId}/${r.relationshipId}`}
                          aria-label={`${r.displayName} — ${name}`}
                          style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "var(--ta-space-3)", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-3) var(--ta-space-2)", color: "var(--ta-text-primary)", textDecoration: "none", borderRadius: "var(--ta-radius-2)" }}
                        >
                          <span style={{ fontSize: "var(--ta-text-base)", fontWeight: 500 }}>{r.displayName}</span>
                          <span style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>{name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {/* 6.5 · P6-R17: the way in to the levers — one quiet link per subject group, below the rows' weight, never a primary.
                      8.2 · DEC-030: the way in to the ARCHIVE joins it — same grammar, same weight, still never a primary. */}
                  <p style={{ margin: "var(--ta-space-1) 0 0", paddingInline: "var(--ta-space-2)", display: "flex", flexWrap: "wrap", columnGap: "var(--ta-space-6)" }}>
                    <ShapeLink subjectId={g.subjectId} subjectName={name} />
                    <ArchiveLink subjectId={g.subjectId} subjectName={name} />
                  </p>
                </section>
              );
            })}
          </div>
        </section>
      )}

      {/* 4 · WORK · LIBRARY · TOOLS — slots only (absent today) */}
      <SlotRegion region="work" items={regionSlots("work")} />
      <SlotRegion region="library" items={regionSlots("library")} />
      <SlotRegion region="tools" items={regionSlots("tools")} />
    </div>
  );
}

/** A region renders ONLY when at least one slot resolved to real data. Otherwise: no DOM at all. */
function SlotRegion({ region, items }: { region: TutorRegion; items: ResolvedTutorSlot[] }) {
  if (items.length === 0) return null;
  const meta = TUTOR_REGIONS[region];
  const hid = `tutor-region-${region}`;
  return (
    <section aria-labelledby={hid} data-slot-region={region}>
      <h2 id={hid} style={{ ...MONO, marginBottom: "var(--ta-space-3)" }}>{meta.title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
        {items.map((x) => <div key={x.id} data-slot={x.id}>{x.element}</div>)}
      </div>
    </section>
  );
}
