import { cn } from "@/lib/cn";
import { Badge } from "./badge";

/**
 * Standard section title block for the marketing site and portal pages.
 * Keeps eyebrow / heading / lede hierarchy identical everywhere.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Badge tone="brand" className="self-start">
          {eyebrow}
        </Badge>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2.125rem] lg:leading-[1.15]">
        {title}
      </h2>
      {lede ? (
        <p className="text-base leading-relaxed text-foreground-muted sm:text-lg">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
