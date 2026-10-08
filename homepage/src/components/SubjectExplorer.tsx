import { ArrowUpRight, Layers } from "lucide-react";
import { SUBJECT_EXPLORER } from "../data/copy";
import { SUBJECTS, type Subject } from "../data/subjects";
import { Eyebrow } from "./Primitives";
import { MotifGlyph } from "../three/MotifGlyph";

/* ════════════════════════════════════════════════════════════════════════
   SUBJECT EXPLORER

   Six cards, one per subject, each with its own accent and motif mark. Each
   card is a single button that opens the detail panel — one tab stop, one
   activation key, and focus returns here on close.
   ════════════════════════════════════════════════════════════════════════ */

export function SubjectExplorer({
  onOpen,
  openId,
}: {
  onOpen: (id: string) => void;
  openId: string | null;
}) {
  return (
    <section
      id="subjects"
      aria-labelledby="subjects-heading"
      className="scroll-mt-24 border-y border-line/70 bg-ground/85 px-3 py-20 sm:px-6 lg:px-10 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div
          data-reveal
          className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end lg:gap-16"
        >
          <div>
            <Eyebrow>{SUBJECT_EXPLORER.eyebrow}</Eyebrow>
            <h2
              id="subjects-heading"
              className="display mt-5 text-[2.125rem] text-ink sm:text-5xl lg:text-[3.25rem]"
            >
              {SUBJECT_EXPLORER.heading}
            </h2>
          </div>
          <div className="lg:pb-3">
            <p className="max-w-[38rem] text-[1.0625rem] leading-[1.65] text-ink-soft">
              {SUBJECT_EXPLORER.body}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line-2 bg-paper px-3.5 py-1.5 text-[0.75rem] text-ink-muted">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              {SUBJECT_EXPLORER.previewNote}
            </p>
          </div>
        </div>

        <ul
          data-reveal
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          {SUBJECTS.map((subject) => (
            <li key={subject.id}>
              <SubjectCard
                subject={subject}
                onOpen={onOpen}
                isOpen={openId === subject.id}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SubjectCard({
  subject,
  onOpen,
  isOpen,
}: {
  subject: Subject;
  onOpen: (id: string) => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(subject.id)}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className="group flex h-full w-full flex-col rounded-card border border-line bg-paper p-6 text-left transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-[0_26px_54px_-38px_rgba(11,11,12,0.55)] sm:p-7"
      style={{ borderTopColor: subject.accent, borderTopWidth: 3 }}
    >
      <span className="flex items-start justify-between gap-4">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: subject.accentSoft, color: subject.accentInk }}
        >
          <MotifGlyph motif={subject.motif} className="h-6 w-6" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-line-2 px-2.5 py-1 text-[0.6875rem] tracking-[0.08em] text-ink-muted uppercase">
          {subject.motifLabel}
        </span>
      </span>

      <h3 className="display mt-6 text-[1.625rem] text-ink">{subject.name}</h3>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">{subject.tagline}</p>

      <p className="mt-5 line-clamp-3 text-[0.9375rem] leading-[1.65] text-ink-soft">
        {subject.intro}
      </p>

      <span className="mt-6 flex items-center justify-between border-t border-line pt-5">
        <span className="text-[0.8125rem] text-ink-muted">
          {subject.topics.length} example topics · 1 sample
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium"
          style={{ color: subject.accentInk }}
        >
          {SUBJECT_EXPLORER.cta}
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </span>
    </button>
  );
}
