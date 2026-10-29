import type { Metadata, Viewport } from "next";
import { EB_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteContent } from "@/config/siteContent";

/**
 * =====================================================================
 * CONFIGURAZIONE FONT GLOBALI
 * - Serif: EB Garamond (organico, scultoreo, tradizione tipografica italiana)
 * - Sans: Inter (sobrio, iper-leggibile su schermi mobile e desktop)
 * - Mono: JetBrains Mono (dati tecnici, prezzi e codici)
 * =====================================================================
 */
const serifFont = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * =====================================================================
 * VIEWPORT & RESPONSIVE SETTINGS
 * Garantisce un rendering impeccabile su tutti i dispositivi (mobile, tablet, desktop)
 * senza zoom automatico indesiderato sui campi input in iOS Safari.
 * =====================================================================
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F8F7F4",
  viewportFit: "cover",
};

/**
 * =====================================================================
 * METADATA SEO & SOCIAL SHARING (Open Graph / Twitter Card)
 * Generati dinamicamente dalla Single Source of Truth (siteContent.ts).
 * =====================================================================
 */
export const metadata: Metadata = {
  title: {
    default: "TechPYRE — Ingegneria del Software & Landing Page ad Alte Prestazioni",
    template: "%s | TechPYRE",
  },
  description: siteContent.hero.subheadline,
  authors: [{ name: siteContent.brand.founder }],
  creator: siteContent.brand.name,
  metadataBase: new URL("https://www.techpyre.eu"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "TechPYRE — Ingegneria del Software & Landing Page ad Alte Prestazioni",
    description: siteContent.hero.subheadline,
    siteName: "TechPYRE",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPYRE — Ingegneria del Software & Landing Page ad Alte Prestazioni",
    description: siteContent.hero.subheadline,
  },
};

/**
 * =====================================================================
 * ROOT LAYOUT
 * Inietta le variabili CSS dei font, Schema.org e applica lo sfondo pergamena istituzionale.
 * =====================================================================
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteContent.brand.name,
    founder: {
      "@type": "Person",
      name: siteContent.brand.founder,
    },
    url: "https://www.techpyre.eu",
    email: siteContent.brand.contactEmail,
    telephone: siteContent.brand.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Milano",
      addressCountry: "IT",
    },
    description: siteContent.hero.subheadline,
    priceRange: "€€€",
  };

  return (
    <html
      lang="it"
      className={`${serifFont.variable} ${sansFont.variable} ${monoFont.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#F8F7F4] text-[#14181F] selection:bg-[#B8860B]/20 selection:text-[#0B1E36]">
        {children}
      </body>
    </html>
  );
}
