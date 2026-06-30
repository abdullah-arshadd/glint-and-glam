'use client';
import React, { useState } from 'react';
import { Wand2, Truck, Gem, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StoryPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // Global background set to premium #f5f3ed with standardized typography
    <main className="min-h-screen py-12 lg:py-24 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- SECTION 1: HERO HEADER --- */}
        <div className="text-center mb-20 py-16 lg:py-24 border" style={{ backgroundColor: 'rgba(58, 46, 40, 0.015)', borderColor: 'rgba(58, 46, 40, 0.06)' }}>
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] font-semibold block mb-3" style={{ color: '#3a2e28' }}>
            Our Philosophy
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl [font-family:'Cormorant_Garamond',serif] font-light tracking-wide max-w-3xl mx-auto leading-tight" style={{ color: '#3a2e28' }}>
            The Story of <span className="italic">Twinkles of Joy</span>
          </h1>
          <p className="text-xs sm:text-sm font-light mt-4 max-w-md mx-auto leading-relaxed opacity-70" style={{ color: '#3a2e28' }}>
            Bringing globally trending, premium jewelry aesthetics straight to your doorstep without the heavy luxury markup.
          </p>
        </div>

        {/* --- SECTION 2: THE CURATION CONCEPT (SPLIT LAYOUT) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl [font-family:'Cormorant_Garamond',serif] font-light tracking-wide leading-tight" style={{ color: '#3a2e28' }}>
              We Don&apos;t Manufacture.<br />We select the best.
            </h2>
            {/* 🔑 FIXED: Roman Urdu paragraphs translated into high-end professional English */}
            <p className="text-xs sm:text-sm font-light leading-relaxed opacity-80" style={{ color: '#3a2e28' }}>
              Twinkles of Joy is a premium retail jewelry boutique. We have meticulously curated a premium collection bringing together globally certified, modern, and elegant designs from around the world.
            </p>
            <p className="text-xs sm:text-sm font-light leading-relaxed opacity-80" style={{ color: '#3a2e28' }}>
              Our mission is simple: to deliver premium sparkle and high-end fashion trends to every customer who wishes to stay up-to-date, without the overpriced tag of a luxury brand. We are bridging the gap between fine quality and accessible luxury.
            </p>
            <div className="pt-2">
              <Link 
                href="/shop" 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="inline-flex items-center gap-2 text-white text-[10px] uppercase tracking-widest font-semibold px-6 py-3.5 transition-all duration-300"
                style={{ backgroundColor: isHovered ? '#c2859d' : '#3a2e28' }}
              >
                Explore Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          
          {/* Elegant Display Banner Image */}
          <div className="aspect-[4/5] bg-white border overflow-hidden shadow-[0_12px_40px_rgba(58,46,40,0.03)]" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
            <img 
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop" 
              alt="Premium Curated Jewelry Showcase" 
              className="w-full h-full object-cover object-center grayscale-[15%] hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>

        {/* --- SECTION 3: CORE VALUE TILES --- */}
        <div className="border-t pt-20" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
          <div className="text-center mb-16">
            <h3 className="text-2xl lg:text-3xl [font-family:'Cormorant_Garamond',serif] font-light tracking-wide uppercase" style={{ color: '#3a2e28', letterSpacing: '0.05em' }}>
              Why Shop With Us?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8">
            
            {/* Tile 1 */}
            <div className="backdrop-blur-xl bg-white/45 border p-8 lg:p-10 text-center space-y-5 transition-all duration-500 ease-out hover:-translate-y-1 shadow-[0_8px_30px_rgb(58,46,40,0.03)] hover:shadow-[0_20px_50px_rgba(58,46,40,0.06)]" style={{ borderColor: 'rgba(58, 46, 40, 0.07)' }}>
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center mx-auto border shadow-xs" style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.06)' }}>
                <Wand2 size={18} strokeWidth={1.25} />
              </div>
              <h4 className="text-xs font-semibold tracking-widest uppercase [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28', letterSpacing: '0.15em' }}>
                Trending Aesthetics
              </h4>
              {/* 🔑 FIXED: Card description converted to English */}
              <p className="text-[11px] sm:text-xs font-light leading-relaxed opacity-75 max-w-xs mx-auto" style={{ color: '#3a2e28' }}>
                We exclusively retail designs on our store that are currently at the absolute top of global fashion runways and modern trends.
              </p>
            </div>

            {/* Tile 2 */}
            <div className="backdrop-blur-xl bg-white/45 border p-8 lg:p-10 text-center space-y-5 transition-all duration-500 ease-out hover:-translate-y-1 shadow-[0_8px_30px_rgb(58,46,40,0.03)] hover:shadow-[0_20px_50px_rgba(58,46,40,0.06)]" style={{ borderColor: 'rgba(58, 46, 40, 0.07)' }}>
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center mx-auto border shadow-xs" style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.06)' }}>
                <Truck size={18} strokeWidth={1.25} />
              </div>
              <h4 className="text-xs font-semibold tracking-widest uppercase [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28', letterSpacing: '0.15em' }}>
                Ready To Ship
              </h4>
              {/* 🔑 FIXED: Card description converted to English */}
              <p className="text-[11px] sm:text-xs font-light leading-relaxed opacity-75 max-w-xs mx-auto" style={{ color: '#3a2e28' }}>
                No long waiting lists. Our curated stock is always physically ready in our boutique retail warehouse for rapid delivery.
              </p>
            </div>

            {/* Tile 3 */}
            <div className="backdrop-blur-xl bg-white/45 border p-8 lg:p-10 text-center space-y-5 transition-all duration-500 ease-out hover:-translate-y-1 shadow-[0_8px_30px_rgb(58,46,40,0.03)] hover:shadow-[0_20px_50px_rgba(58,46,40,0.06)]" style={{ borderColor: 'rgba(58, 46, 40, 0.07)' }}>
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center mx-auto border shadow-xs" style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.06)' }}>
                <Gem size={18} strokeWidth={1.25} />
              </div>
              <h4 className="text-xs font-semibold tracking-widest uppercase [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28', letterSpacing: '0.15em' }}>
                Quality Inspections
              </h4>
              {/* 🔑 FIXED: Card description converted to English */}
              <p className="text-[11px] sm:text-xs font-light leading-relaxed opacity-75 max-w-xs mx-auto" style={{ color: '#3a2e28' }}>
                As a trusted retailer, our team manually double-checks every single piece before it is safely packed and shipped to ensure absolute brilliance.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}