import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * =====================================================================
 * GUSCIO DELLE PAGINE INTERNE (/servizi, /progetti, /studio)
 * Stessa Navbar e stesso Footer della home. Le sezioni vengono riutilizzate
 * invariate: il guscio aggiunge solo lo spazio sotto la navbar fissa e
 * rimuove il filetto superiore della prima sezione (non serve in testa pagina).
 * =====================================================================
 */
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F7F4] text-[#14181F]">
        <main
          id="main-content"
          className="pt-16 sm:pt-20 lg:pt-16 [&>section:first-child]:border-t-0"
        >
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
