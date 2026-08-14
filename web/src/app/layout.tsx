import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Mono, Sora, Syne } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
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
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Earn Steam Credit with Honest Quests`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.promise,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} | Earn Steam Credit with Honest Quests`,
    description: SITE.promise,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | Earn Steam Credit with Honest Quests`,
    description: SITE.promise,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Impact.com publisher site ownership verification (Freecash partner)
  other: {
    "impact-site-verification": "6c1cfdb4-889e-4703-8c10-f8a4960fb83a",
  },
};

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.promise,
      sameAs: [
        "https://www.youtube.com/@zakai1769",
        "https://www.facebook.com/Freesteamcodes21",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@vaultquest.io",
        contactType: "customer support",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.promise,
      publisher: { "@id": `${SITE.url}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${sora.variable} ${ibmPlexMono.variable} h-full`}>
      <body className="vq-shell flex min-h-full flex-col antialiased">
        <JsonLd data={SITE_JSON_LD} />
        <a href="#main" className="vq-skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <VaultAssistant />
        <Analytics />
      </body>
    </html>
  );
}
