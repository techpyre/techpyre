import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import HomePreviews from "@/components/sections/HomePreviews";
import ContactBox from "@/components/sections/ContactBox";
import Footer from "@/components/layout/Footer";

/**
 * HOME: solo introduzione, accenni brevi alle pagine dedicate e modulo di contatto.
 * Listino e simulatore → /servizi · Casi studio → /progetti · Fondatore → /studio
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F7F4] text-[#14181F]">
        <main id="main-content">
          <Hero />
          <HomePreviews />
          <ContactBox />
        </main>
        <Footer />
      </div>
    </>
  );
}
