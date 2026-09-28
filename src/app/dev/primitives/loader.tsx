"use client";

import dynamic from "next/dynamic";

/* Client-only: interactive states matrix (hover/focus/loading/reduced/etc.). */
const Specimen = dynamic(() => import("./preview"), { ssr: false });

export default function PrimitivesSpecimenLoader() {
  return <Specimen />;
}
