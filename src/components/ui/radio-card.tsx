import { cn } from "@/lib/cn";

/**
 * Selectable card driven by a native radio input.
 * Accessible and keyboard-operable with zero client-side state.
 */
export function RadioCard({
  name,
  value,
  title,
  description,
  defaultChecked,
  className,
}: {
  name: string;
  value: string;
  title: string;
  description?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-lg border border-border-strong bg-surface p-4",
        "transition-colors duration-150",
        "has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:ring-4 has-checked:ring-brand-100",
        "hover:border-brand-300",
        "has-focus-visible:ring-4 has-focus-visible:ring-brand-100",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface",
          "transition-colors duration-150",
          "peer-checked:border-brand-600 peer-checked:bg-brand-600",
        )}
      >
        <span className="size-1.5 rounded-full bg-white opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-foreground-muted">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
