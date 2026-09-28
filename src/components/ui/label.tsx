import { cn } from "@/lib/cn";

export type LabelProps = React.ComponentProps<"label">;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-foreground",
        "peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

/** Optional hint rendered under a field label. */
export function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-1 text-xs text-foreground-subtle", className)}
      {...props}
    />
  );
}
