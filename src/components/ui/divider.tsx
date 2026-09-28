import { cn } from "@/lib/cn";

/** Horizontal rule with an optional centred label ("or"). */
export function Divider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <hr className={cn("border-t border-border", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium tracking-wide text-foreground-subtle uppercase">
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}
