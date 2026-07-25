'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react'; // Loader2 hata diya hai

// 🌟 THE FIX: Ab yeh component data props se receive karega
export default function FeaturedGrid({ bestSellers = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  // Dynamic Item Track Settings
  const [itemsPerPage, setItemsPerPage] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsPerPage(2); // Mobile/Tablet par 2 cards
      } else {
        setItemsPerPage(4); // Desktop screens par 4 cards
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Total steps tracking for indicators
  const totalDots = Math.ceil(bestSellers.length / itemsPerPage);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index < totalDots) {
        setCurrentIndex(index);
      }
    }
  };

  const scrollToSlide = (index) => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      sliderRef.current.scrollTo({
        left: index * clientWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  // Agar data nahi hai toh khali screen na dikhaye
  if (bestSellers.length === 0) return null;

  return (
    <section className="w-full py-20 lg:py-32 overflow-hidden" style={{ backgroundColor: '#f7f2e6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- SECTION TITLE --- */}
        <div className="text-center mb-16">
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-[#3A2E28] font-semibold block mb-3">
            Glint & Glam Signature
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Our Best Sellers
          </h2>
        </div>

        {/* --- CAROUSEL TRACK --- */}
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-x-4 lg:gap-x-6 pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bestSellers.map((product) => (
            <div 
              key={product.id} 
              className="group flex flex-col justify-between relative min-w-[calc(50%-8px)] lg:min-w-[calc(25%-18px)] max-w-[calc(50%-8px)] lg:max-w-[calc(25%-18px)] snap-start flex-shrink-0"
            >
              
              {/* Image Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F7BFB4]/5 border border-[#F7BFB4]/20 transition-all duration-300">
                <img 
                  src={product.images?.[0]?.url || '/placeholder.jpg'} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Hover Glassmorphic Effect Panel */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/shop/${product.id}`}
                      className="bg-white p-2.5 shadow-xs hover:bg-[#f7f2e6] text-[#2D2524] transition-colors duration-300 rounded-full cursor-pointer flex items-center justify-center"
                    >
                      <Eye size={15} strokeWidth={1.5} />
                    </Link>
                  </div>
                  
                  <Link 
                    href={`/shop/${product.id}`}
                    className="w-full bg-[#3a2e28] text-white py-2.5 uppercase tracking-widest text-[9px] font-semibold hover:bg-[#3a2f29]/90 transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag size={12} />
                    View Product
                  </Link>
                </div>
              </div>

              {/* Product Info Description */}
              <div className="mt-4 text-center flex flex-col items-center">
                <span className="text-[8px] lg:text-[9px] uppercase tracking-widest text-gray-400 mb-1">
                  {product.category?.name || "Fine Fragrance"}
                </span>
                <Link href={`/shop/${product.id}`} className="block w-full">
                  <h3 className="text-xs lg:text-sm text-[#2D2524] font-light tracking-wide [font-family:'Plus_Jakarta_Sans',sans-serif] hover:text-[#DB93B0] transition-colors duration-200 cursor-pointer line-clamp-1 px-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs lg:text-sm text-[#2D2524] font-semibold mt-1 tracking-wide">
                  Rs. {product.variants?.length > 0 ? Number(product.variants[0].price).toLocaleString() : "N/A"}
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* --- PREMIUM DYNAMIC INDICATORS LINE --- */}
        {totalDots > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {[...Array(totalDots)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                className={`h-[3px] transition-all duration-500 rounded-full cursor-pointer ${
                  currentIndex === idx 
                    ? 'w-8 bg-[#3a2e28]' 
                    : 'w-2 bg-[#3a2e28]/25 hover:bg-[#3a2e28]/45'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}