"use client";

/* Client boundary for the shared-canvas layer: Next 16 only permits
   next/dynamic with ssr:false inside Client Components. The cards, copy and
   SVG fallbacks stay server-rendered in subject-gallery-cards.tsx. */

import dynamic from "next/dynamic";

const SubjectGalleryCanvas = dynamic(() => import("./subject-gallery-canvas"), {
  ssr: false,
  loading: () => null,
});

export default function SubjectGalleryLayer() {
  return <SubjectGalleryCanvas />;
}
