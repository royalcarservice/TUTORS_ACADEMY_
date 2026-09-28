"use client";

import dynamic from "next/dynamic";

/* Client-only: reads live spatial tokens + viewport and runs the demos. */
const Specimen = dynamic(() => import("./preview"), { ssr: false });

export default function SpatialSpecimenLoader() {
  return <Specimen />;
}
