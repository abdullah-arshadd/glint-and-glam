'use client';

import React, { useState } from 'react';
import { Wand2, Truck, Gem, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StoryPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <main className="min-h-screen py-12 lg:py-24 text-[#3a2e28]" style={{ backgroundColor: '#f7f2e6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO HEADER */}
        <div className="text-center mb-20 py-16 lg:py-24 border" style={{ backgroundColor: 'rgba(58, 46, 40, 0.02)', borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] font-semibold block mb-3 opacity-60">
            Our Philosophy
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide max-w-3xl mx-auto leading-tight">
            The Story of <span className="italic">Glint and Glam</span>
          </h1>
          <p className="text-xs sm:text-sm font-light mt-4 max-w-md mx-auto leading-relaxed opacity-70">
            Bringing globally trending, premium jewelry aesthetics straight to your doorstep without the heavy luxury markup.
          </p>
        </div>

        {/* THE CURATION CONCEPT (SPLIT LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-28">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light tracking-wide leading-tight">
              We Don&apos;t Manufacture.<br />We select the best.
            </h2>
            <p className="text-xs sm:text-sm font-light leading-relaxed opacity-80">
              Glint and Glam is a premium retail jewelry boutique. We have meticulously curated a premium collection bringing together globally certified, modern, and elegant designs from around the world.
            </p>
            <p className="text-xs sm:text-sm font-light leading-relaxed opacity-80">
              Our mission is simple: to deliver premium sparkle and high-end fashion trends to every customer who wishes to stay up-to-date, without the overpriced tag of a luxury brand. We are bridging the gap between fine quality and accessible luxury.
            </p>
            <div className="pt-2">
              <Link 
                href="/shop" 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="inline-flex items-center gap-2 text-white text-[10px] uppercase tracking-widest font-semibold px-6 py-3.5 transition-all duration-300"
                style={{ backgroundColor: isHovered ? 'rgba(58, 46, 40, 0.85)' : '#3a2e28' }}
              >
                Explore Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          
          {/* Elegant Display Banner Image (Flat Corners) */}
          <div className="aspect-[4/5] bg-white border overflow-hidden shadow-sm" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
            <img 
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop" 
              alt="Premium Curated Jewelry Showcase" 
              className="w-full h-full object-cover object-center grayscale-[15%] hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>

        {/* CORE VALUE TILES */}
        <div className="border-t pt-20" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          <div className="text-center mb-16">
            <h3 className="text-2xl lg:text-3xl font-serif font-light tracking-wide uppercase">
              Why Shop With Us?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tile 1 */}
            <div className="border p-8 lg:p-10 text-center space-y-5 transition-all duration-300 ease-out hover:-translate-y-1 shadow-[0_4px_20px_rgba(58,46,40,0.02)]" style={{ backgroundColor: 'rgba(58, 46, 40, 0.02)', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <div className="w-12 h-12 flex items-center justify-center mx-auto border" style={{ backgroundColor: '#f0e8d6', borderColor: 'rgba(58, 46, 40, 0.1)' }}>
                <Wand2 size={18} strokeWidth={1.25} />
              </div>
              <h4 className="text-xs font-semibold tracking-widest uppercase">
                Trending Aesthetics
              </h4>
              <p className="text-[11px] sm:text-xs font-light leading-relaxed opacity-75 max-w-xs mx-auto">
                We exclusively retail designs on our store that are currently at the absolute top of global fashion runways and modern trends.
              </p>
            </div>

            {/* Tile 2 */}
            <div className="border p-8 lg:p-10 text-center space-y-5 transition-all duration-300 ease-out hover:-translate-y-1 shadow-[0_4px_20px_rgba(58,46,40,0.02)]" style={{ backgroundColor: 'rgba(58, 46, 40, 0.02)', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <div className="w-12 h-12 flex items-center justify-center mx-auto border" style={{ backgroundColor: '#f0e8d6', borderColor: 'rgba(58, 46, 40, 0.1)' }}>
                <Truck size={18} strokeWidth={1.25} />
              </div>
              <h4 className="text-xs font-semibold tracking-widest uppercase">
                Ready To Ship
              </h4>
              <p className="text-[11px] sm:text-xs font-light leading-relaxed opacity-75 max-w-xs mx-auto">
                No long waiting lists. Our curated stock is always physically ready in our boutique retail warehouse for rapid delivery.
              </p>
            </div>

            {/* Tile 3 */}
            <div className="border p-8 lg:p-10 text-center space-y-5 transition-all duration-300 ease-out hover:-translate-y-1 shadow-[0_4px_20px_rgba(58,46,40,0.02)]" style={{ backgroundColor: 'rgba(58, 46, 40, 0.02)', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <div className="w-12 h-12 flex items-center justify-center mx-auto border" style={{ backgroundColor: '#f0e8d6', borderColor: 'rgba(58, 46, 40, 0.1)' }}>
                <Gem size={18} strokeWidth={1.25} />
              </div>
              <h4 className="text-xs font-semibold tracking-widest uppercase">
                Quality Inspections
              </h4>
              <p className="text-[11px] sm:text-xs font-light leading-relaxed opacity-75 max-w-xs mx-auto">
                As a trusted retailer, our team manually double-checks every single piece before it is safely packed and shipped to ensure absolute brilliance.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}