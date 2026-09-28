import { cn } from "@/lib/cn";

interface ContainerProps extends React.ComponentProps<"div"> {
  /** `wide` lifts the max width for data-dense portal screens. */
  width?: "default" | "wide" | "narrow";
}

const widths = {
  narrow: "max-w-3xl",
  default: "max-w-[var(--ta-content-max)]",
  wide: "max-w-[96rem]",
} as const;

/**
 * Centred page gutter. Used by the marketing site, the auth screens and every
 * portal, so horizontal rhythm is identical platform-wide.
 */
export function Container({
  className,
  width = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        widths[width],
        className,
      )}
      {...props}
    />
  );
}
