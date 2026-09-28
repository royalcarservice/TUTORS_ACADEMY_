import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";

import { siteConfig } from "@/config/site";

import { ThemePrepaint } from "@/components/layout/theme";

import "./globals.css";

/*
 * TYPE — the brand frame (Phase 2 · Step 2).
 *   text    Instrument Sans  (variable wght) — all UI/body. Preloaded.
 *   display Fraunces         (variable)      — editorial headlines. NOT preloaded.
 *   mono    JetBrains Mono   (variable)      — code/equations/tabular data. NOT preloaded.
 * Self-hosted by next/font (no CDN). next/font emits metric-matched fallbacks
 * (size-adjust / ascent-override …) so the swap is shift-free.
 */
const textFace = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
  preload: true,
});

const displayFace = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "optional",
  preload: false,
});

const monoFace = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "optional",
  preload: false,
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
