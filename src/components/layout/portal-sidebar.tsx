"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutGrid, X } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { StatusBadge } from "@/components/ui/badge";
import { getModulesForSurface, getPlannedModules } from "@/config/modules";
import { PORTAL_META, ROUTES, type PortalId } from "@/config/routes";
import { cn } from "@/lib/cn";

/**
 * Portal navigation rail.
 *
 * Navigation is registry-driven: the "Overview" item is the only real route
 * today, and every other row is a planned module rendered as a non-link so the
 * app never advertises a dead URL. When a module ships, adding its href here
 * turns the row into a link — nothing else changes.
 */
export function PortalSidebar({
  portal,
  open,
  onClose,
}: {
  portal: PortalId;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const meta = PORTAL_META[portal];
  /* Shipped modules (Track 1) become real links; the roadmap below keeps
     only what is not live yet — the app never advertises a dead URL. */
  const shipped = getModulesForSurface(portal).filter(
    (m) => m.status === "live" && m.routePrefix && m.routePrefix !== meta.home,
  );
  const modules = getPlannedModules(portal);

  return (
    <>
      {/* Mobile scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink-950/45 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/*
        Drawer. Visibility is driven by classes, NOT the `hidden` attribute:
        Tailwind's preflight sets `[hidden] { display: none !important }`,
        which would outrank `lg:block` and hide the rail on desktop.
      */}
      <aside
        aria-label={meta.label}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[var(--ta-sidebar-w)] flex-col",
          "border-r border-border bg-surface shadow-lg",
          "transition-transform duration-200 ease-out lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-[var(--ta-header-h)] shrink-0 items-center justify-between border-b border-border px-4">
          <Link href={ROUTES.home} onClick={onClose} className="rounded-md">
            <Logo withWordmark={false} />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-ink-100 lg:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Portal identity */}
          <div className="mb-4 rounded-lg bg-brand-50 px-3 py-2.5">
            <p className="text-sm font-semibold text-brand-900">{meta.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-brand-700/80">
              {meta.blurb}
            </p>
          </div>

          {/* Real routes */}
          <nav aria-label="Sections">
            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href={meta.home}
                  onClick={onClose}
                  aria-current={pathname === meta.home ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === meta.home
                      ? "bg-brand-600 text-white shadow-brand"
                      : "text-foreground-muted hover:bg-ink-100 hover:text-foreground",
                  )}
                >
                  <LayoutGrid className="size-4" aria-hidden />
                  Overview
                </Link>
              </li>
              {shipped.map((m) => (
                <li key={m.id}>
                  <Link
                    href={m.routePrefix as string}
                    onClick={onClose}
                    aria-current={pathname === m.routePrefix ? "page" : undefined}
                    title={m.summary}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === m.routePrefix
                        ? "bg-brand-600 text-white shadow-brand"
                        : "text-foreground-muted hover:bg-ink-100 hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="size-4" aria-hidden />
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Roadmap — not yet navigable */}
          {modules.length > 0 ? (
          <div className="mt-6">
            <p className="px-3 text-[0.6875rem] font-semibold tracking-wide text-foreground-subtle uppercase">
              Coming to this portal
            </p>
            <ul className="mt-2 flex flex-col gap-0.5">
              {modules.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                >
                  <span
                    className="text-sm text-foreground-subtle"
                    title={m.summary}
                  >
                    {m.name}
                  </span>
                  <StatusBadge status={m.status} className="scale-90" />
                </li>
              ))}
            </ul>
          </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-3">
          <Link
            href={ROUTES.home}
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-ink-100 hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to website
          </Link>
        </div>
      </aside>
    </>
  );
}
