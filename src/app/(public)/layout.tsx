import { SiteFooter } from "@/components/layout/site-footer";
import { PublicNavSwitch } from "@/components/navigation/public-nav-switch";

/**
 * Public website chrome: the cinematic navigation + main + footer.
 * Route group `(public)` so these URLs stay clean while the marketing site
 * keeps its own layout, separate from auth and the portals.
 * DEC-046: SiteNav supersedes SiteHeader on the public surface; the retired
 * header components remain in the tree, unreferenced, pending owner review.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavSwitch />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
