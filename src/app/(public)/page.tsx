import HeroSection from "@/components/sections/HeroSection";
import ServicesPreview from "@/components/sections/ServicesPreview";
import WhyUs from "@/components/sections/WhyUs";
import ArtistSpotlight from "@/components/sections/ArtistSpotlight";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesPreview />
      <WhyUs />
      <ArtistSpotlight />
    </main>
  );
}