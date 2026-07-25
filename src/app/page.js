import Hero from "@/components/Hero";
import FeaturedGrid from "@/components/FeaturedGrid";
import ReviewSlider from "@/components/ReviewSlider";
import AestheticSection from "@/components/AestheticSection";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma"; // 🌟 Prisma import kiya

// 🌟 MAGIC LINE: Next.js ko bataya ke is page ko har 1 ghante baad background mein update kare
// Is se user ko zero delay milega aur database par load nahi aayega
export const revalidate = 3600;

export default async function Home() {
  
  // 1. Database se Featured/Best Seller products mangwayen
  // (Note: 'isFeatured: true' ko apni Prisma schema ki condition ke mutabiq adjust kar liyega)
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true }, // Agar aapki koi aur condition hai toh yahan badal lein
    include: { variants: true, images: true, category: true },
    take: 8 // Maximum kitne products dikhane hain (Optional)
  });

  // 2. Decimal prices ko normal Number mein convert karein taake error na aaye
  const formattedProducts = featuredProducts.map((product) => ({
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price)
    }))
  }));

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Core Header Banner */}
      <Hero />
      
      {/* 2. Collections & Grid Items (🌟 Ab loader ki zaroorat nahi, data direct yahan se jayega) */}
      <FeaturedGrid bestSellers={formattedProducts} />

      <ReviewSlider />

      {/* 3. Value Props & Editorial Image Panels */}
      <AestheticSection />

      {/* 4. Complete Brand Footer */}
      <Footer />
    </main>
  );
}