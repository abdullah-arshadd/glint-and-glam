import Hero from "@/components/Hero";
import FeaturedGrid from "@/components/FeaturedGrid";
import AestheticSection from "@/components/AestheticSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Core Header Banner */}
      <Hero />
      
      {/* 2. Collections & Grid Items */}
      <FeaturedGrid />

      {/* 3. Value Props & Editorial Image Panels */}
      <AestheticSection />

      {/* 4. Complete Brand Footer */}
      <Footer />
    </main>
  );
}