'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {

    return (
        <section
            className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: '#bd977a' }} // Light Brown Background
        >

            {/* Ambient Inner Luxury Light Glows */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[#F5F2EB]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">

                {/* 🔑 FORCE FIX: Directly forcing Creamy Milk Beige via Inline Style to override any global black text classes */}
                <h1 
                    className="text-5xl md:text-7xl lg:text-8xl [font-family:'Cormorant_Garamond',serif] leading-[1.1] mb-8 tracking-tight font-medium"
                    style={{ color: '#3a2e28' }}
                >
                    Radiance in Every <br />
                    <span className="italic font-light opacity-90" style={{ color: '#F7F2E6' }}>Exquisite</span> Detail
                </h1>

                {/* 🔑 FORCE FIX: Subtext color forced to Creamy Milk Beige with 80% opacity via Inline Style */}
                <p 
                    className="max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed mb-10 [font-family:'Plus_Jakarta_Sans',sans-serif]"
                    style={{ color: '#F7F2E6' }}
                >
                    Discover our curated collection of fine jewellery, where timeless
                    craftsmanship meets modern elegance. Crafted to celebrate your joy.
                </p>

                {/* 🔑 UNTOUCHED ORIGINAL BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

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