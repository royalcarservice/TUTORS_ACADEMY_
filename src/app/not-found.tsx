import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PORTAL_ENTRIES } from "@/config/navigation";
import { ROUTES } from "@/config/routes";

/**
 * Global 404. Deliberately self-contained (it renders inside the root layout
 * only) so it works no matter which segment produced the miss.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <Container className="flex h-[var(--ta-header-h)] items-center">
          <Link href={ROUTES.home} aria-label="Tutors Academy home">
            <Logo />
          </Link>
        </Container>
      </header>

      <main id="main" className="flex flex-1 items-center">
        <Container width="narrow" className="py-16 text-center sm:py-24">
          <p className="font-display text-6xl font-extrabold tracking-tight text-brand-600 sm:text-7xl">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-foreground-muted">
            The link may be out of date, or the page you&apos;re after hasn&apos;t
            been built yet — this is the platform&apos;s foundation release.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={ROUTES.home} className={buttonClass("primary", "md")}>
              Back to home
            </Link>
            <Link href={ROUTES.login} className={buttonClass("outline", "md")}>
              Sign in
            </Link>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <p className="text-xs font-semibold tracking-wide text-foreground-subtle uppercase">
              Available portals
            </p>
            <ul className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
              {PORTAL_ENTRIES.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </main>
    </div>
  );
}
