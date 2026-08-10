import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora, Syne } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VaultAssistant } from "@/components/VaultAssistant";
import { SITE } from "@/lib/site";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.promise,
  // Impact.com publisher site ownership verification (Freecash partner)
  other: {
    "impact-site-verification": "6c1cfdb4-889e-4703-8c10-f8a4960fb83a",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${sora.variable} ${ibmPlexMono.variable} h-full`}>
      <body className="vq-shell flex min-h-full flex-col antialiased">
        <a href="#main" className="vq-skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <VaultAssistant />
      </body>
    </html>
  );
}
