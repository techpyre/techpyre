import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import ContactBox from "@/components/sections/ContactBox";
import Footer from "@/components/layout/Footer";

/**
 * HOME: solo introduzione con patto di fiducia e collegamenti sintetici, seguito dal box di contatto.
 * Listino e simulatore → /servizi · Casi studio → /progetti · Fondatore → /studio
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F7F4] text-[#14181F]">
        <main id="main-content">
          <Hero />
          <ContactBox />
        </main>
        <Footer />
      </div>
    </>
  );
}

