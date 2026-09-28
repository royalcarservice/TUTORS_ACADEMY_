"use client";

import dynamic from "next/dynamic";

/* Client-only: reads live motion tokens + runs rAF/observer demos. */
const Specimen = dynamic(() => import("./preview"), { ssr: false });

export default function MotionSpecimenLoader() {
  return <Specimen />;
}
