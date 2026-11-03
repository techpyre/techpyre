import type { Metadata, Viewport } from "next";
import { EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteContent } from "@/config/siteContent";

/**
 * =====================================================================
 * CONFIGURAZIONE FONT GLOBALI (EDITORIALE & UMANISTA, ZERO FONT ROBOTICI)
 * - Serif: EB Garamond (tradizione tipografica classica, autorevole e calda)
 * - Sans: Plus Jakarta Sans (umanista, naturale e iper-leggibile, mai freddo)
 * =====================================================================
 */
const serifFont = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
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
    default: "TechPYRE | Studio di Ingegneria ed Ecosistemi Digitali B2B",
    template: "%s | TechPYRE",
  },
  description:
    "TechPYRE progetta ecosistemi digitali proprietari per imprese B2B: infrastrutture web ad alte prestazioni, portali operativi custom, tracciamento Server-Side e automazione CRM.",
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
    title: "TechPYRE | Studio di Ingegneria ed Ecosistemi Digitali B2B",
    description:
      "Infrastrutture web ad alte prestazioni, portali operativi B2B, tracciamento Server-Side e automazione CRM. Codice e dati al 100% di proprietà dell'impresa.",
    siteName: "TechPYRE",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPYRE | Studio di Ingegneria ed Ecosistemi Digitali B2B",
    description:
      "Infrastrutture web ad alte prestazioni, portali operativi B2B, tracciamento Server-Side e automazione CRM. Codice e dati al 100% di proprietà dell'impresa.",
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
      streetAddress: "Via Carrubara Vico III n. 3",
      addressLocality: "Pagliara",
      addressRegion: "ME",
      addressCountry: "IT",
    },
    description: siteContent.hero.subheadline,
    priceRange: "€€€",
  };

  return (
    <html
      lang="it"
      className={`${serifFont.variable} ${sansFont.variable}`}
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
