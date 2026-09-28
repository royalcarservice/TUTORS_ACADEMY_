import { BrandLockup, BrandMark } from "@/components/brand/brand";

/* --------------------------------------------------------------------------
   Logo — thin delegate onto the Step 6 brand components.

   The previous graduation-cap glyph is RETIRED (it is on the brand hard-ban
   list). All surfaces now share "The Unbroken Line" mark + set wordmark, so
   the brand is defined once and identical everywhere (BRAND FRAME RULE).
   ------------------------------------------------------------------------ */
export function Logo({
  className,
  withWordmark = true,
  tone = "default",
}: {
  className?: string;
  withWordmark?: boolean;
  tone?: "default" | "inverse";
}) {
  if (!withWordmark) {
    return (
      <span className={className}>
        <BrandMark size={32} variant={tone === "inverse" ? "ivory" : "brass"} />
      </span>
    );
  }
  return <BrandLockup className={className} variant={tone === "inverse" ? "ivory" : "brass"} tone={tone === "inverse" ? "inverse" : "default"} markSize={30} />;
}
