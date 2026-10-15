import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import ServicesMatrix from "@/components/sections/ServicesMatrix";
import ProjectEstimator from "@/components/sections/ProjectEstimator";
import FounderLetter from "@/components/sections/FounderLetter";
import ContactBox from "@/components/sections/ContactBox";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#F8F7F4] text-[#14181F]">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ServicesMatrix />
        <ProjectEstimator />
        <FounderLetter />
        <ContactBox />
      </main>
      <Footer />
    </div>
  );
}
