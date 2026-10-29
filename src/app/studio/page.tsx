import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import FounderLetter from "@/components/sections/FounderLetter";
import { siteContent } from "@/config/siteContent";

export const metadata: Metadata = {
  title: "Lo Studio & Metodo di Lavoro",
  description: siteContent.founder.subtitle,
  alternates: { canonical: "/studio" },
};

/** Lo studio e il fondatore (#storia). */
export default function StudioPage() {
  return (
    <PageShell>
      <FounderLetter />
    </PageShell>
  );
}
