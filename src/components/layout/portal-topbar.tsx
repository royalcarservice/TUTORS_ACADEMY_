import Link from "next/link";
import { ChevronRight, Globe, LogIn, Menu } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { PORTAL_META, ROUTES, type PortalId } from "@/config/routes";

/**
 * Portal top bar: drawer trigger on mobile, breadcrumb trail, and the escape
 * hatches back to the public site / authentication.
 */
export function PortalTopbar({
  portal,
  section = "Overview",
  onMenuClick,
}: {
  portal: PortalId;
  section?: string;
  onMenuClick: () => void;
}) {
  const meta = PORTAL_META[portal];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="flex h-[var(--ta-header-h)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-strong text-foreground transition-colors hover:bg-ink-100 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1.5 text-sm">
              <li className="truncate font-semibold text-foreground">
                {meta.label}
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-ink-400" />
              </li>
              <li className="truncate text-foreground-muted">{section}</li>
            </ol>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={ROUTES.home}
            aria-label="Go to the public website"
            className="inline-flex size-10 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-ink-100 hover:text-foreground sm:hidden"
          >
            <Globe className="size-5" aria-hidden />
          </Link>
          <Link
            href={ROUTES.home}
            className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}
          >
            <Globe className="size-4" aria-hidden />
            Website
          </Link>
          <Link href={ROUTES.login} className={buttonClass("outline", "sm")}>
            <LogIn className="size-4" aria-hidden />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
