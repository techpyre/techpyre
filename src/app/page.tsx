import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import CaseStudies from "@/components/sections/CaseStudies";
import ContactBox from "@/components/sections/ContactBox";
import Footer from "@/components/layout/Footer";

/**
 * HOME: introduzione strategica, casi studio reali / social proof e box di contatto.
 * Listino e simulatore → /servizi · Casi studio completi → /progetti · Fondatore → /studio
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F7F4] text-[#14181F]">
        <main id="main-content">
          <Hero />
          <CaseStudies />
          <ContactBox />
        </main>
        <Footer />
      </div>
    </>
  );
}

