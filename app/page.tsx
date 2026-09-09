import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StudioApproach from "@/components/StudioApproach";
import StoryAndCraft from "@/components/StoryAndCraft";
import WarmContact from "@/components/WarmContact";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <Hero />
      <StudioApproach />
      <StoryAndCraft />
      <WarmContact />
    </div>
  );
}
