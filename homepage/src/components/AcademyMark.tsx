import { cn } from "../lib/cn";

/**
 * The Tutors Academy mark: three interlocking frames and a bead — the same
 * structure the 3D sculpture is assembled from, reduced to a signature.
 */
export function AcademyMark({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="16"
        cy="16"
        r="9.4"
        fill="none"
        stroke={invert ? "#faf9f5" : "#0b0b0c"}
        strokeWidth="1.9"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="9.4"
        ry="3.9"
        fill="none"
        stroke="#21a896"
        strokeWidth="1.6"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="3.9"
        ry="9.4"
        fill="none"
        stroke="#c29a45"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="6.6" r="2.1" fill="#c29a45" />
    </svg>
  );
}

export function AcademyWordmark({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2.5",
        invert ? "text-white" : "text-ink",
        className,
      )}
    >
      <AcademyMark invert={invert} />
      <span className="flex flex-col leading-none">
        <span className="text-[0.9375rem] font-semibold tracking-[-0.02em]">
          Tutors Academy
        </span>
        <span
          className={cn(
            "mt-1 hidden text-[0.625rem] font-medium tracking-[0.16em] uppercase sm:block",
            invert ? "text-white/55" : "text-ink-muted",
          )}
        >
          Six subject spaces
        </span>
      </span>
    </span>
  );
}
