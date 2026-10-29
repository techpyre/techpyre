import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ServicesMatrix from "@/components/sections/ServicesMatrix";
import ProjectEstimator from "@/components/sections/ProjectEstimator";
import { siteContent } from "@/config/siteContent";

export const metadata: Metadata = {
  title: "Servizi & Tariffe B2B — Configuratore",
  description: siteContent.services.subtitle,
  alternates: { canonical: "/servizi" },
};

/** Listino servizi (#servizi) e simulatore di progetto (#simulatore). */
export default function ServiziPage() {
  return (
    <PageShell>
      <ServicesMatrix />
      <ProjectEstimator />
    </PageShell>
  );
}
