import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CaseStudies from "@/components/sections/CaseStudies";
import { siteContent } from "@/config/siteContent";

export const metadata: Metadata = {
  title: "TechPYRE",
  description: siteContent.caseStudies.subtitle,
  alternates: { canonical: "/progetti" },
};

/** Architetture reference e casi studio (#progetti) con Live Demo e GitHub. */
export default function ProgettiPage() {
  return (
    <PageShell>
      <CaseStudies />
    </PageShell>
  );
}
