"use client";

import dynamic from "next/dynamic";

/* Client-only: the specimen reads live computed font metrics (browser-only). */
const Specimen = dynamic(() => import("./preview"), { ssr: false });

export default function TypeSpecimenLoader() {
  return <Specimen />;
}
