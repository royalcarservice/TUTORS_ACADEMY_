"use client";

import dynamic from "next/dynamic";

/*
 * Client-only loader. `ssr:false` keeps the preview out of server rendering —
 * it reads live CSS custom properties, which only exist in a browser.
 * Hoisted to module scope (react-hooks/static-components).
 */
const Preview = dynamic(() => import("./preview"), { ssr: false });

export default function TokenPreviewLoader() {
  return <Preview />;
}
