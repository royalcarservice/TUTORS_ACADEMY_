import { notFound } from "next/navigation";

import TokenPreviewLoader from "./loader";

/*
 * DEV-ONLY TOKEN PREVIEW  ·  /dev/tokens
 *
 * In a production build this page resolves to notFound(), so the route 404s
 * and cannot ship. In development it renders the client-only preview.
 */
export default function DevTokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <TokenPreviewLoader />;
}
