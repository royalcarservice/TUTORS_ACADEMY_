"use client";

import dynamic from "next/dynamic";

const Specimen = dynamic(() => import("./preview"), { ssr: false });

export default function BrandSpecimenLoader() {
  return <Specimen />;
}
