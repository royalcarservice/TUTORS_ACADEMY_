import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/ui/container";
import { PORTAL_ENTRIES } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { siteConfig } from "@/config/site";

/**
 * Auth chrome.
 * Stacked on mobile; split into form + brand panel from `lg` upwards.
 * The brand panel is config-driven so portal names never drift from routes.ts.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* ------------------------- Form column ------------------------- */}
      {/* 5.8 gate fix: `min-w-0` — a grid item's min-width:auto let the form's intrinsic input width (≈322 px)
          widen this column to 354 px at 320 px viewports → horizontal scroll on the sign-in page. */}
      <div className="flex min-w-0 flex-col bg-background">
        <header className="border-b border-border">
          <Container className="flex h-[var(--ta-header-h)] items-center justify-between">
            <Link href={ROUTES.home} aria-label="Tutors Academy home" className="inline-flex min-w-0 items-center">
              {/* 5.8 gate fix: at <640 px the lockup (252 px) + "Back" (70 px) exceed the 288 px content width → overflow.
                  Below `sm` the mark alone stands, exactly as the nav shell's own mobile frame does. */}
              <span className="sm:hidden"><Logo withWordmark={false} /></span>
              <span className="hidden sm:inline-flex"><Logo /></span>
            </Link>
            <Link
              href={ROUTES.home}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              <span className="hidden sm:inline">Back to website</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Container>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* ------------------------- Brand panel ------------------------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-10 text-white lg:flex xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 size-[34rem] rounded-full bg-brand-600/35 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-20 size-[30rem] rounded-full bg-accent-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <Logo tone="inverse" />
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight xl:text-4xl">
            {siteConfig.tagline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            One account gives you access to every surface of the platform.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {PORTAL_ENTRIES.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-white">
                  {entry.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">
                  {entry.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/45">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </aside>
    </div>
  );
}
