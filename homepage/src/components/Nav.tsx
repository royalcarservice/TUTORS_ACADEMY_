import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { AcademyWordmark } from "./AcademyMark";
import { NAV_LINKS } from "../data/copy";
import { scrollToSection, scrollToTop } from "../lib/scroll";
import { cn } from "../lib/cn";

/* ════════════════════════════════════════════════════════════════════════
   NAVIGATION

   A floating pill bar (Halo's device): logo left, three links, one black
   pill action. Below `lg` the links collapse into a disclosure panel that is
   keyboard operable — Escape closes, Tab is trapped, focus is restored to the
   toggle on close.
   ════════════════════════════════════════════════════════════════════════ */

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 12);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const go = useCallback((id: string) => {
    setOpen(false);
    // Let the disclosure unmount before the smooth scroll measures layout.
    requestAnimationFrame(() => scrollToSection(id));
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-[1440px] px-3 pt-3 sm:px-6 sm:pt-5">
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-full border px-3 py-2 sm:px-4",
            "transition-[background-color,border-color,box-shadow] duration-300",
            scrolled
              ? "border-line-2 bg-paper/90 shadow-[0_10px_36px_-24px_rgba(11,11,12,0.6)] backdrop-blur-md"
              : "border-line bg-paper/70 backdrop-blur-sm",
          )}
        >
          <button
            type="button"
            onClick={scrollToTop}
            className="rounded-full pr-2 pl-1 text-left"
            aria-label="Tutors Academy — back to top"
          >
            <AcademyWordmark />
          </button>

          <nav aria-label="Primary" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(link.id);
                    }}
                    className="inline-flex min-h-10 items-center rounded-full px-4 text-[0.9375rem] text-ink-soft transition-colors hover:bg-ground hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => go("subjects")}
            className={cn(
              // Hidden below `sm`: at 320px the logo, this pill and the menu
              // toggle cannot share one row. The disclosure menu carries it.
              "ml-auto hidden min-h-11 items-center gap-2 rounded-full bg-ink px-5",
              "text-[0.875rem] font-medium text-white transition-colors",
              "hover:bg-ink-2 sm:inline-flex lg:ml-3",
            )}
          >
            Explore subjects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="ta-mobile-menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-paper text-ink lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {open && (
          <div
            id="ta-mobile-menu"
            ref={panelRef}
            className="pointer-events-auto mt-2 rounded-3xl border border-line-2 bg-paper/95 p-3 shadow-[0_24px_60px_-30px_rgba(11,11,12,0.7)] backdrop-blur-md lg:hidden"
          >
            <nav aria-label="Mobile">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      data-autofocus={i === 0 ? "" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        go(link.id);
                      }}
                      className="flex min-h-12 items-center justify-between rounded-2xl px-4 text-base text-ink transition-colors hover:bg-ground"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <button
              type="button"
              onClick={() => go("subjects")}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 text-[0.9375rem] font-medium text-white"
            >
              Explore subjects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
