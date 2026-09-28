import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const variants = {
  info: {
    wrap: "border-brand-200 bg-brand-50 text-brand-900",
    icon: Info,
    iconClass: "text-brand-600",
  },
  success: {
    wrap: "border-success-500/25 bg-success-50 text-success-700",
    icon: CheckCircle2,
    iconClass: "text-success-500",
  },
  warning: {
    wrap: "border-warning-500/30 bg-warning-50 text-warning-700",
    icon: TriangleAlert,
    iconClass: "text-warning-500",
  },
  danger: {
    wrap: "border-danger-500/25 bg-danger-50 text-danger-700",
    icon: AlertCircle,
    iconClass: "text-danger-500",
  },
} as const;

export type AlertVariant = keyof typeof variants;

/**
 * Inline notice. Used for honest, non-decorative messaging — e.g. telling the
 * reviewer that a service is not wired up yet.
 */
export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: AlertVariant;
  title?: string;
}) {
  const { wrap, icon: Icon, iconClass } = variants[variant];

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm leading-relaxed",
        wrap,
        className,
      )}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-[1.125rem] shrink-0", iconClass)} />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className={cn("opacity-90", title && "mt-0.5")}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}
