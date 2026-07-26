'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    }, 4000);

    return () => clearInterval(slideTimer);
  }, [mobileSliderImages.length]);

  return (
    <section className="relative w-full h-[85vh] flex items-center lg:justify-center overflow-hidden bg-[#1C1716]">
      
      {/* 🖥️ LARGE SCREENS: CINEMATIC ZOOM-IN BACKGROUND (pic5.png) */}
      <div className="absolute inset-0 w-full h-full z-0 hidden lg:block overflow-hidden">
        <motion.div
          initial={{ scale: 1.08, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative"
        >
          <Image
            src="/pic5.png"
            alt="Glint and Glam Luxury Storefront Desktop View"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 100vw"
            className="object-cover object-center select-none"
          />
        </motion.div>
      </div>

      {/* 📱 MOBILE & TABLET SCREENS: DYNAMIC SMOOTH ANIMATE PRESENCE CAROUSEL */}
      <div className="absolute inset-0 w-full h-full z-0 lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mobileSliderImages[currentIndex]}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 0.75, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={mobileSliderImages[currentIndex]}
              alt={`Glint and Glam Luxury Mobile Banner ${currentIndex + 1}`}
              fill
              priority={currentIndex === 0}
              sizes="(max-width: 1024px) 100vw, 100vw"
              className="object-cover object-center select-none"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 🌌 AMBIENT OVERLAYS */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[#F5F2EB]/5 rounded-full blur-3xl pointer-events-none z-10"
      />
      <div className="absolute inset-0 bg-black/20 lg:bg-black/15 pointer-events-none z-10" />

      {/* 🎯 CONTENT CONTAINER WITH STAGGERED MOTION */}
      <div className="relative max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-16 z-20 flex flex-col text-left lg:text-center items-start lg:items-center">

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl [font-family:'Cormorant_Garamond',serif] leading-[1.1] mb-6 tracking-tight font-medium drop-shadow-md"
          style={{ color: '#F7F2E6' }}
        >
          Radiance in Every <br />
          <span className="italic font-light opacity-95 text-white">Exquisite</span> Detail
        </motion.h1>

        {/* Subtext description */}
        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 0.95, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="max-w-md md:max-w-xl lg:mx-auto text-xs sm:text-sm md:text-base font-light leading-relaxed mb-10 [font-family:'Plus_Jakarta_Sans',sans-serif] drop-shadow-xs"
          style={{ color: '#F7F2E6' }}
        >
          Discover our curated collection of fine luxury perfumes, where timeless
          craftsmanship meets modern elegance. Crafted to celebrate your essence.
        </motion.p>

        {/* BUTTONS WRAPPER WITH HOVER MOTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-center gap-4"
        >

          {/* Shop Collection */}
          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/shop"
              style={{ backgroundColor: '#f0e8d6', color: '#5a3317', borderColor: '#F5F2EB' }}
              className="group relative px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-[#F5F2EB] transition-colors duration-300 shadow-md flex items-center cursor-pointer"
            >
              Shop Collection
              <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" style={{ color: '#5a3317' }} />
            </Link>
          </motion.div>

          {/* Our Story */}
          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/story"
              style={{ backgroundColor: '#f0e8d6', color: '#5a3317', borderColor: '#F5F2EB' }}
              className="group relative px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-[#F5F2EB] transition-colors duration-300 shadow-md flex items-center cursor-pointer"
            >
              About Us
            </Link>
          </motion.div>

        </motion.div>

      </div>

    </section>
  );
}