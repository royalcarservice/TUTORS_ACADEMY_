"use client";

/* The home wears the floating liquid-glass header over its cinematic
   video; every other public page keeps the solid SiteNav so its ivory
   type stays legible on light chrome (DEC-046/049). */

import { usePathname } from "next/navigation";
import { GlassNav } from "./glass-nav";
import { SiteNav } from "./site-nav";

export function PublicNavSwitch() {
  const pathname = usePathname();
  return pathname === "/" ? <GlassNav /> : <SiteNav />;
}
