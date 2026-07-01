'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const mobileSliderImages = [
    '/pic1.jpg',
    '/pic2.jpg',
    '/pic3.jpg',
    '/pic4.jpg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === mobileSliderImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500);

    return () => clearInterval(slideTimer);
  }, [mobileSliderImages.length]);

  return (
    <section className="relative w-full h-[85vh] flex items-center lg:justify-center overflow-hidden bg-[#1C1716]">
      
      {/* 🖥️ LARGE SCREENS: STATIC CLEAN BACKGROUND (pic5.jpg) */}
      <div className="absolute inset-0 w-full h-full z-0 hidden lg:block">
        <Image
          src="/pic5.png"
          alt="Glint and Glam Luxury Storefront Desktop View"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 100vw" // 🔥 Performance adjustment fix
          className="object-cover object-center select-none"
        />
      </div>

      {/* 📱 MOBILE & TABLET SCREENS: DYNAMIC 4-IMAGE CAROUSEL SLIDER */}
      <div className="absolute inset-0 w-full h-full z-0 lg:hidden">
        {mobileSliderImages.map((imgUrl, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={imgUrl}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform ${
                isActive 
                  ? 'opacity-70 scale-100' 
                  : 'opacity-0 scale-102 pointer-events-none'
              }`}
            >
              <Image
                src={imgUrl}
                alt={`Glint and Glam Luxury Mobile Banner ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 100vw" // 🔥 Performance adjustment fix
                className="object-cover object-center select-none"
              />
            </div>
          );
        })}
      </div>

      {/* 🌌 AMBIENT OVERLAYS */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[#F5F2EB]/5 rounded-full blur-3xl pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-black/20 lg:bg-black/15 pointer-events-none z-10" />

      {/* 🎯 CONTENT CONTAINER */}
      <div className="relative max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 z-20 flex flex-col text-left lg:text-center items-start lg:items-center">

        {/* Heading */}
        <h1 
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl [font-family:'Cormorant_Garamond',serif] leading-[1.1] mb-6 tracking-tight font-medium drop-shadow-md"
          style={{ color: '#F7F2E6' }}
        >
          Radiance in Every <br />
          <span className="italic font-light opacity-95 text-white">Exquisite</span> Detail
        </h1>

        {/* Subtext description */}
        <p 
          className="max-w-md md:max-w-xl lg:mx-auto text-xs sm:text-sm md:text-base font-light leading-relaxed mb-10 [font-family:'Plus_Jakarta_Sans',sans-serif] drop-shadow-xs"
          style={{ color: '#F7F2E6', opacity: 0.95 }}
        >
          Discover our curated collection of fine jewellery, where timeless
          craftsmanship meets modern elegance. Crafted to celebrate your joy.
        </p>

        {/* BUTTONS WRAPPER */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-center gap-4">

          {/* Shop Collection */}
          <Link href="/shop"
            style={{ backgroundColor: '#f0e8d6', color: '#5a3317', borderColor: '#F5F2EB' }}
            className="group relative px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-[#F5F2EB]/90 transition-all duration-300 shadow-md flex items-center cursor-pointer"
          >
            Shop Collection
            <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" style={{ color: '#5a3317' }} />
          </Link>

          {/* Our Story */}
          <Link href="/story"
            style={{ backgroundColor: '#f0e8d6', color: '#5a3317', borderColor: '#F5F2EB' }}
            className="group relative px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-[#F5F2EB]/90 transition-all duration-300 shadow-md flex items-center cursor-pointer"
          >
            Our Story
          </Link>
        </div>

      </div>

    </section>
  );
}