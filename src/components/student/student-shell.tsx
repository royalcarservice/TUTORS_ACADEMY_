import Link from "next/link";

import { SubjectMark } from "@/components/brand/subject-mark";
import { Room } from "@/components/motif/stage";
import { STUDENT_SLOT_REGIONS, type StudentSlotRegion } from "@/config/student-slots";
import type { Candidate } from "@/lib/next-action";
import { whenPhrase } from "@/lib/next-action/when";
import type { Enrolment, EnvironmentState, ShellState, SubjectId } from "@/lib/student/contract";

import type { ResolvedSlot } from "./slots";

/* ════════════════════════════════════════════════════════════════════════
   THE STUDENT SHELL (Phase 5 · Step 3)

   ORIENTATION, not a dashboard. Reading order, fixed:
     1. PRIMARY SURFACE — the one answer to WHAT NOW. Since 5.4 it renders
        ONE Candidate from the next-action engine ({eyebrow, title, detail,
        cta, href} + subject identity when subjectId is present). It does
        not branch per feature: a new kind changes what it SAYS, never
        where it is, how big it is, or what it looks like.
     2. TODAY region     — slots only; absent until Phase 7/8 data exists.
     3. SUBJECT ROWS     — quiet rows, equal weight, one link each.
     4. LIBRARY / PROGRESS / TOOLS regions — slots only; absent today.

   Pure render: everything arrives as props from the page (identity, contract
   state, resolved subject display info, resolved slots). The shell imports no
   subject config and performs no fetch — it cannot invent data it was not
   given. Rooms only: contained, compact density, vector motif at the edge,
   no substrate, no canvas.

   RESUME HONESTY RULE (Decision 5) — stated here, next to the render:
   the resume surface renders ONLY populated fields of environment_state.
   `lastEnteredAt` is populated → WHEN may be said. `entryCount` is populated
   but is a count with no action → NEVER rendered (P5-R2 FIX 1).
   `position` is NULL today → nothing about a place inside the environment is
   said. The action is therefore OPEN THE ENVIRONMENT, because that is the
   only real action. When 5.5+ populates `position`, a line may be added
   below `resumeLine` that reads from it — never before.
   ════════════════════════════════════════════════════════════════════════ */

export interface ShellSubjectInfo {
  id: SubjectId;
  name: string;
  /** e.g. "The Field" — the first clause of the config tagline, not invented. */
  environmentName: string;
  motif: "lattice" | "field" | "bonds" | "living" | "typographic" | "strata";
  density: "sparse" | "balanced" | "dense";
  status: "draft" | "ready" | "locked";
}

export interface StudentShellProps {
  state: ShellState;
  /** The engine's one answer (src/lib/next-action). Server-resolved. */
  candidate: Candidate;
  enrolments: Enrolment[];
  environmentStates: EnvironmentState[];
  subjects: Partial<Record<SubjectId, ShellSubjectInfo>>;
  slots: ResolvedSlot[];
  /** Server "now", so relative dates are computed once, server-side. */
  now: string;
  /** Where the subject rows link and the primary action opens. */
  subjectHref?: (id: SubjectId) => string;
  chooseHref?: string;
  /**
   * 5.5: when the answer OPENS an environment the student is already enrolled
   * in (kind begin | resume), the action is a form POST to this endpoint —
   * the act records an entry (recency = last explicit entry). Same element
   * size, position and hierarchy; different element semantics. Absent → link.
   */
  entryAction?: (id: SubjectId) => string;
}

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

const DRAFT_LABEL = "Environment in draft";

export { whenPhrase };

/* ── primary surface copy, derived from the contract ───────────────────── */
export interface PrimaryCopy {
  eyebrow: string;
  heading: string;
  line: string;
  action: string;
  href: string;
  subject: ShellSubjectInfo | null;
}

/**
 * THE BINDING (5.4): the surface's strings come from the Candidate, verbatim.
 * The shell adds nothing — no count, no time sentence, no place inside the
 * environment. `subject` is looked up only so the Room can carry the 3.3
 * identity (mark, accent, environment name, draft label).
 */
export function primaryCopy(p: StudentShellProps): PrimaryCopy {
  const c = p.candidate;
  const s = c.subjectId ? p.subjects[c.subjectId as SubjectId] : undefined;
  return {
    eyebrow: c.eyebrow,
    heading: c.title,
    line: c.detail ?? "",
    action: c.cta,
    href: c.href,
    subject: s ?? null,
  };
}

/* ── render ────────────────────────────────────────────────────────────── */
export function StudentShell(props: StudentShellProps) {
  const { state, enrolments, environmentStates, subjects, slots, now } = props;
  const subjectHref = props.subjectHref ?? ((id: SubjectId) => `/subjects/${id}`);
  const copy = primaryCopy(props);
  const c = props.candidate;
  const entryPost = props.entryAction && c.subjectId && (c.kind === "begin" || c.kind === "resume") ? props.entryAction(c.subjectId as SubjectId) : null;
  const activeEnrolments = enrolments.filter((e) => e.status === "active");
  const regionSlots = (r: StudentSlotRegion) => slots.filter((s) => s.region === r);

  const primaryInner = (
    <>
      <p style={MONO}>{copy.eyebrow}</p>
      <h1
        id="student-primary-heading"
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
      {copy.subject?.status === "draft" && (
        <p style={{ ...MONO, marginTop: "var(--ta-space-2)" }}>{DRAFT_LABEL}</p>
      )}
      {copy.line && (
        <p style={{ margin: "var(--ta-space-4) 0 0", fontSize: "var(--ta-text-base)", lineHeight: 1.55, color: "var(--ta-text-secondary)", maxWidth: "36rem" }}>
          {copy.line}
        </p>
      )}
      <div style={{ marginTop: "var(--ta-space-6)" }}>
        {entryPost ? (
          /* POST, not GET: opening is an explicit entry and is recorded. A form
             button cannot be opened in a new tab like a link; on the target
             surface (390, the one primary action) that affordance is not one
             the student uses — the subject rows below remain plain links. */
          <form method="post" action={entryPost} style={{ margin: 0 }}>
            <button type="submit" className="ta-btn" data-variant="primary" data-size="lg" data-primary-action style={{ minWidth: "12rem" }}>
              {copy.action}
            </button>
          </form>
        ) : (
          <Link href={copy.href} className="ta-btn" data-variant="primary" data-size="lg" data-primary-action style={{ minWidth: "12rem" }}>
            {copy.action}
          </Link>
        )}
      </div>
    </>
  );

  return (
    <div data-student-shell data-state={state.kind} data-density="compact" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-8)" }}>
      {/* 1 · PRIMARY SURFACE — the one answer. Subject-scoped Room when a subject is the answer; brass frame when it is not. */}
      <section aria-labelledby="student-primary-heading" data-primary-surface>
        {copy.subject ? (
          <Room
            subject={copy.subject.id}
            motif={copy.subject.motif}
            density={copy.subject.density}
            role="edge"
            purpose="student-primary"
            style={{ padding: "clamp(1.25rem, 1rem + 2vw, 2.5rem)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-3)", color: "var(--ta-accent-1)" }}>
              <SubjectMark subject={copy.subject.id} size={32} />
            </div>
            {primaryInner}
          </Room>
        ) : (
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
            {primaryInner}
          </div>
        )}
      </section>

      {/* 2 · TODAY — slots only (absent today) */}
      <SlotRegion region="today" items={regionSlots("today")} />

      {/* 3 · SUBJECT ROWS — equal weight, one link each. Omitted when there is nothing to list (state A). */}
      {activeEnrolments.length > 0 && (
        <section aria-labelledby="student-subjects-heading" data-subject-rows>
          <h2 id="student-subjects-heading" style={{ ...MONO, marginBottom: "var(--ta-space-3)" }}>
            {STUDENT_SLOT_REGIONS.subjects.title}
          </h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--ta-border-subtle)" }}>
            {activeEnrolments.map((e) => {
              const s = subjects[e.subjectId];
              const st = environmentStates.find((x) => x.subjectId === e.subjectId);
              const name = s?.name ?? e.subjectId;
              const env = s?.environmentName;
              const rowSlots = slots.filter((x) => x.region === "subjects");
              return (
                <li key={e.subjectId} data-subject={e.subjectId} style={{ borderBottom: "1px solid var(--ta-border-subtle)", paddingBlock: "var(--ta-space-1)" /* ≥8px between adjacent row targets */ }}>
                  <Link
                    href={subjectHref(e.subjectId)}
                    aria-label={env ? `Open ${name} — ${env}` : `Open ${name}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      columnGap: "var(--ta-space-3)",
                      alignItems: "center",
                      minHeight: "var(--ta-target-primary)",
                      padding: "var(--ta-space-3) var(--ta-space-2)",
                      borderRadius: "var(--ta-radius-2)",
                      color: "var(--ta-text-primary)",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden>
                      <SubjectMark subject={e.subjectId} size={24} />
                    </span>
                    <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: "var(--ta-space-3)", rowGap: "2px", minWidth: 0 }}>
                      <span style={{ fontSize: "var(--ta-text-base)", fontWeight: 500 }}>{name}</span>
                      {env && <span style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>{env}</span>}
                      <span style={{ fontSize: "var(--ta-text-xs)", color: "var(--ta-text-muted)", marginLeft: "auto" }}>
                        {st ? `Last opened ${whenPhrase(st.lastEnteredAt, now)}` : "Not opened yet"}
                      </span>
                      {s?.status === "draft" && (
                        <span style={{ ...MONO, flexBasis: "100%" }}>{DRAFT_LABEL}</span>
                      )}
                    </span>
                  </Link>
                  {rowSlots.length > 0 && (
                    <div data-slot-row style={{ padding: "0 var(--ta-space-2) var(--ta-space-3) calc(24px + var(--ta-space-3) + var(--ta-space-2))" }}>
                      {rowSlots.map((x) => <div key={x.id} data-slot={x.id}>{x.element}</div>)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 4 · LIBRARY · PROGRESS · TOOLS — slots only (absent today) */}
      <SlotRegion region="library" items={regionSlots("library")} />
      <SlotRegion region="reflection" items={regionSlots("reflection")} />
      <SlotRegion region="tools" items={regionSlots("tools")} />
    </div>
  );
}

/** A region renders ONLY when at least one slot resolved to real data. Otherwise: no DOM at all. */
function SlotRegion({ region, items }: { region: StudentSlotRegion; items: ResolvedSlot[] }) {
  if (items.length === 0) return null;
  const meta = STUDENT_SLOT_REGIONS[region];
  const hid = `student-region-${region}`;
  return (
    <section aria-labelledby={hid} data-slot-region={region}>
      <h2 id={hid} style={{ ...MONO, marginBottom: "var(--ta-space-3)" }}>{meta.title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
        {items.map((x) => <div key={x.id} data-slot={x.id}>{x.element}</div>)}
      </div>
    </section>
  );
}
