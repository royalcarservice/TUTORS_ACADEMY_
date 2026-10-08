import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Subject } from "../data/subjects";
import { Practice } from "./Practice";
import { MotifGlyph } from "../three/MotifGlyph";

/* ════════════════════════════════════════════════════════════════════════
   SUBJECT DETAIL PANEL

   A modal dialog: `aria-modal`, Escape to close, focus moved in on open and
   restored to the card that opened it on close, Tab trapped inside, and the
   page scroll locked while it is up. The canvas behind it is paused by the
   occlusion signal in App.
   ════════════════════════════════════════════════════════════════════════ */

export function SubjectDialog({
  subject,
  onClose,
}: {
  subject: Subject;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    openerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    // Focus the panel itself first: it is scrollable and labelled, so screen
    // readers announce the dialog rather than landing mid-content.
    panel?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (active === panel || active === null) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && document.contains(opener)) {
        opener.focus();
      }
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-dialog-title"
        aria-describedby="subject-dialog-desc"
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-[46rem] flex-col overflow-hidden rounded-t-[2rem] border border-line-2 bg-paper outline-none sm:rounded-[2rem]"
      >
        {/* header */}
        <div
          className="flex items-start gap-4 border-b border-line p-5 sm:p-7"
          style={{ backgroundColor: subject.accentSoft }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper"
            style={{ color: subject.accentInk }}
          >
            <MotifGlyph motif={subject.motif} className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-ink-muted">{subject.motifLabel}</p>
            <h2
              id="subject-dialog-title"
              className="display mt-2 text-[1.75rem] text-ink sm:text-[2.125rem]"
            >
              {subject.name}
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-ink-soft">{subject.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-2 bg-paper text-ink transition-colors hover:bg-ground"
          >
            <span className="sr-only">Close {subject.name} space</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto p-5 sm:p-7">
          <p
            id="subject-dialog-desc"
            className="max-w-[38rem] text-[1rem] leading-[1.7] text-ink-soft"
          >
            {subject.intro}
          </p>

          <h3 className="eyebrow mt-8 text-ink-muted">Example topics</h3>
          <ol className="mt-4 grid gap-3">
            {subject.topics.map((topic, i) => (
              <li
                key={topic.title}
                className="flex gap-4 rounded-2xl border border-line bg-ground/60 p-4"
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold text-white"
                  style={{ backgroundColor: subject.accentInk }}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-medium text-ink">
                    {topic.title}
                  </span>
                  <span className="mt-1 block text-[0.875rem] leading-relaxed text-ink-soft">
                    {topic.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <h3 className="eyebrow mt-8 text-ink-muted">Try one</h3>
          <div className="mt-4">
            <Practice interaction={subject.interaction} />
          </div>

          <p className="mt-6 rounded-2xl border border-line bg-ground/60 p-4 text-[0.8125rem] leading-relaxed text-ink-muted">
            Preview material. This panel shows how a subject space reads —
            there is no live tutoring, no student account and no saved progress
            behind it.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
