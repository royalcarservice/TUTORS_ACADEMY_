import { cn } from "@/lib/cn";

export type CheckboxProps = React.ComponentProps<"input">;

/**
 * Checkbox with a built-in visible box, so markup stays a single element and
 * styling stays on-brand without a headless-ui dependency.
 */
export function Checkbox({ className, id, ...props }: CheckboxProps) {
  return (
    <input
      id={id}
      type="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer appearance-none rounded-[0.3rem]",
        "border border-border-strong bg-surface",
        "transition-colors duration-150",
        "checked:border-brand-600 checked:bg-brand-600",
        "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222.4%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M3.5 8.5l3 3 6-7%22/></svg>')] checked:bg-center checked:bg-no-repeat",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
