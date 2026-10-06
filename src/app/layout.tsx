import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { siteConfig } from "@/config/site";

import { ThemePrepaint } from "@/components/layout/theme";

import "./globals.css";

/*
 * TYPE — the brand frame (Phase 2 · Step 2).
 *   text    Instrument Sans  (variable wght) — all UI/body.
 *   display Fraunces         (variable opsz+wght) — editorial headlines.
 *   mono    JetBrains Mono   (variable wght) — code/equations/tabular data.
 *
 * SELF-HOSTED FROM COMMITTED FILES (ruling of 2026-10-06): the three latin
 * variable woff2s live in ./fonts and are served by this app — the build
 * makes NO request to fonts.googleapis.com (the sandbox/deploy egress cannot
 * be a build dependency). Variable fonts via next/font/local: same CSS
 * variable names and display modes as the original next/font/google wiring,
 * and next/font still emits metric-matched fallbacks (size-adjust /
 * ascent-override …) so the swap is shift-free. Font files: Fontsource
 * latin subsets (Fraunces "full" axis set, wght-normal for the other two).
 */
const textFace = localFont({
  src: "./fonts/instrument-sans-latin.woff2",
  variable: "--font-instrument-sans",
  display: "swap",
});

const displayFace = localFont({
  src: "./fonts/fraunces-latin.woff2",
  variable: "--font-fraunces",
  display: "optional",
});

const monoFace = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-jetbrains-mono",
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  /* 4.9: browser chrome colour follows the surface tokens (ink-900 / ivory-50);
     the previous value was a pre-Phase-2 blue outside the locked hue. */
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0e12" },
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout — owns <html>/<body>, font loading, global CSS and the skip link.
 * Every surface (public site, auth, portals, classroom) renders inside here,
 * which is what keeps one design system across the whole platform.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${textFace.variable} ${displayFace.variable} ${monoFace.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {/* Applies the stored / preferred theme before first paint (no flash). */}
        <ThemePrepaint />
        <a href="#main" className="sr-only sr-only-focusable">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
