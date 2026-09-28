import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/* --------------------------------------------------------------------------
   Card / Surface — ONE surface primitive with a COMPOSITION API.
   Skin is token-only in globals.css (`.ta-card`). Padding uses --ta-pad-card
   so it responds to DENSITY automatically; cards are MARGIN-FREE (parents lay
   them out).

   Variants: flat (default) · raised · inset · interactive. NO `stage`
   variant — Stage is LAYOUT, not a card.

   INTERACTIVE-CARD RULE: an `interactive` card is exactly ONE link/button and
   must contain NO nested interactive elements. If a card needs internal
   actions it is NOT interactive — use a plain Card with separate buttons.
   ------------------------------------------------------------------------ */

export type CardVariant = "flat" | "raised" | "inset" | "interactive";

type CardElementProps = React.ComponentProps<"div"> & { variant?: CardVariant };

const CardRoot = forwardRef<HTMLDivElement, CardElementProps>(
  ({ variant = "flat", className, ...props }, ref) => (
    <div ref={ref} className={cn("ta-card", className)} data-variant={variant} {...props} />
  ),
);
CardRoot.displayName = "Card";

const Header = (p: React.ComponentProps<"div">) => <div className={cn("ta-card__header", p.className)} {...p} />;
const Title = (p: React.ComponentProps<"h3">) => (
  <h3 className={cn(p.className)} style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500, fontSize: "var(--ta-text-lg)", ...p.style }} {...p} />
);
const Description = (p: React.ComponentProps<"p">) => (
  <p className={cn(p.className)} style={{ color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", ...p.style }} {...p} />
);
const Body = (p: React.ComponentProps<"div">) => <div className={cn("ta-card__body", p.className)} {...p} />;
const Footer = (p: React.ComponentProps<"div">) => <div className={cn("ta-card__footer", p.className)} {...p} />;
const Media = (p: React.ComponentProps<"div">) => <div className={cn("ta-card__media", p.className)} {...p} />;

export const Card = Object.assign(CardRoot, { Header, Title, Description, Body, Footer, Media });

/* ── Legacy named exports (pre-Step-5) kept so existing consumers compile.  */
export const CardHeader = Header;
export const CardTitle = Title;
export const CardDescription = Description;
export const CardContent = Body;
export const CardFooter = Footer;
