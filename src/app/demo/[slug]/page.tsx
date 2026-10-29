import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { LeadConfig } from "@/types/lead";
import DiagnosticBanner from "@/components/DiagnosticBanner";
import DemoTracker from "@/components/DemoTracker";
import LocalLeadGen from "@/components/templates/LocalLeadGen";
import MedicalClinic from "@/components/templates/MedicalClinic";
import B2BAuthority from "@/components/templates/B2BAuthority";

const jakartaFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const loraFont = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

function getLeadData(slug: string): LeadConfig | null {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  const filePath = path.join(process.cwd(), "src", "data", "leads", `${safeSlug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as LeadConfig;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const leadsDir = path.join(process.cwd(), "src", "data", "leads");
  if (!fs.existsSync(leadsDir)) return [];
  const files = fs.readdirSync(leadsDir).filter((f) => f.endsWith(".json"));
  return files.map((file) => ({
    slug: file.replace(/\.json$/, ""),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getLeadData(slug);
  if (!data) {
    return {
      title: "Demo Non Trovata",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${data.meta.companyName} - Proposta Architetturale CRO`,
    description: data.content.heroSubheadline,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getLeadData(slug);

  if (!data) return notFound();

  return (
    <div
      style={
        {
          "--primary": data.theme.primaryHex,
          "--accent": data.theme.accentHex,
          "--secondary": data.theme.secondaryHex || data.theme.accentHex,
          "--dark-bg": data.theme.darkBgHex,
          "--radius": data.theme.borderRadius,
        } as React.CSSProperties
      }
      className={`${jakartaFont.variable} ${loraFont.variable} min-h-screen font-sans antialiased`}
    >
      {/* Tracker Visite Demo in Tempo Reale */}
      <DemoTracker slug={data.slug} companyName={data.meta.companyName} />

      {/* Barra Diagnostica Tecnica in alto */}
      <DiagnosticBanner data={data} />

      {/* Renderizza il template in base all'archetipo */}
      {data.archetype === "medical-clinic" ? (
        <MedicalClinic data={data} />
      ) : data.archetype === "b2b-authority" ? (
        <B2BAuthority data={data} />
      ) : (
        <LocalLeadGen data={data} />
      )}
    </div>
  );
}
