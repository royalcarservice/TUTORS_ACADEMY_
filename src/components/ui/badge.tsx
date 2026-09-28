import { cn } from "@/lib/cn";
import { MODULE_STATUS_LABEL, type ModuleStatus } from "@/config/modules";

const tones = {
  neutral: "bg-ink-100 text-ink-700 ring-ink-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  accent: "bg-accent-50 text-accent-700 ring-accent-200",
  success: "bg-success-50 text-success-700 ring-success-500/25",
  warning: "bg-warning-50 text-warning-700 ring-warning-500/25",
  danger: "bg-danger-50 text-danger-700 ring-danger-500/25",
  outline: "bg-transparent text-foreground-muted ring-border-strong",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const statusTone: Record<ModuleStatus, BadgeTone> = {
  planned: "neutral",
  "in-progress": "warning",
  live: "success",
};

/** Status pill driven by the platform module registry. */
export function StatusBadge({
  status,
  className,
}: {
  status: ModuleStatus;
  className?: string;
}) {
  return (
    <Badge tone={statusTone[status]} className={className}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "live" && "bg-success-500",
          status === "in-progress" && "bg-warning-500",
          status === "planned" && "bg-ink-400",
        )}
      />
      {MODULE_STATUS_LABEL[status]}
    </Badge>
  );
}
