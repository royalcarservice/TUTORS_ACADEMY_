import { Hammer } from "lucide-react";

import { Alert, Card } from "@/components/ui";
import { MODULE_STATUS_LABEL, type PlatformModule } from "@/config/modules";

/**
 * Honest placeholder for a surface whose feature work has not started.
 *
 * It never invents data: it states plainly what is missing and lists the real
 * module roadmap entries that will land here, read straight from the registry.
 */
export function NotBuiltYet({
  scope,
  modules,
  note,
}: {
  /** e.g. "Student dashboard" */
  scope: string;
  /** Registry entries declared for this surface (status read from the registry; nothing here is marked built). */
  modules: readonly PlatformModule[];
  /** One true sentence about this surface today — never a promise about a later build (P6-R5). */
  note: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Alert variant="info" title={`${scope} is not built yet`}>
        <p>
          Nothing behind this route is built. No demo data is shown because
          none exists. {note}
        </p>
      </Alert>

      <Card>
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Hammer className="size-4 text-brand-600" aria-hidden />
            Declared for this surface
          </h2>
        </div>

        <ul className="divide-y divide-border">
          {modules.map((m) => (
            <li
              key={m.id}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground-muted">
                  {m.summary}
                </p>
              </div>
              <span className="mt-1 shrink-0 text-xs font-semibold tracking-wide text-foreground-subtle uppercase sm:mt-0">
                {MODULE_STATUS_LABEL[m.status]}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
