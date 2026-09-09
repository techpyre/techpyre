import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import AmbientCinematicCanvas from "@/components/AmbientCinematicCanvas";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechPyre | Studio di Ingegneria Software & Design — Sicilia",
  description: "Studio digitale fondato da due under 30 tra Catania e Taormina.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased text-[#F5F3EF]">
        <CustomCursor />
        <AmbientCinematicCanvas />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
