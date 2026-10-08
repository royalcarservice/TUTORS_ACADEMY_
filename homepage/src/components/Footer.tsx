import { FOOTER_LINKS, FOOTER_NOTE, SITE } from "../data/copy";
import { AcademyWordmark } from "./AcademyMark";
import { scrollToSection } from "../lib/scroll";

/* Compact footer: the academy name, working section links, and an honest
   note about what this page is. No invented contact details, testimonials,
   credentials, prices or results. */

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line px-3 pt-10 pb-14 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <AcademyWordmark />
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.id);
                    }}
                    className="inline-flex min-h-10 items-center text-[0.9375rem] text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-ink-muted">
            © {year} {SITE.name}
          </p>
          <p className="max-w-[42rem] text-[0.8125rem] leading-relaxed text-ink-muted">
            {FOOTER_NOTE}
          </p>
        </div>
      </div>
    </footer>
  );
}
