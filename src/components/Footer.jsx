'use client';
import Link from 'next/link';
import React from 'react';

export default function Footer() {
    return (
        <footer 
            className="w-full pt-24 pb-12" 
            style={{ 
                backgroundColor: '#f0e8d6', 
                color: '#3a2e28' 
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Footer Layout Links Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 [font-family:'Plus_Jakarta_Sans',sans-serif]">

                    {/* Col 1: About Brand */}
                    <div className="space-y-5 text-center sm:text-left">
                        <h4 className="text-sm font-semibold [font-family:'Cormorant_Garamond',serif] tracking-[0.2em] uppercase" style={{ color: '#3a2e28' }}>
                            Glint & Glam
                        </h4>
                        <p className="text-xs font-light leading-relaxed max-w-xs mx-auto sm:mx-0 opacity-75" style={{ color: '#3a2e28' }}>
                            Timeless fine jewelry designed to bring spark and elegance into your everyday life.
                        </p>
                    </div>

                    {/* Col 2: Shop Links */}
                    <div className="space-y-6 text-center sm:text-left">
                        {/* 🔑 FIXED: Heading letter-spacing increased for premium editorial feel */}
                        <span className="text-[10px] uppercase tracking-[0.25em] font-bold block" style={{ color: '#3a2e28' }}>
                            Collections
                        </span>
                        {/* 🔑 FIXED: Custom luxury underline transition effect on hover */}
                        <div className="flex flex-col space-y-3.5 text-xs font-light tracking-wider">
                            <Link href="/shop" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Shop All
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/shop?category=rings" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Rings Collection
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/shop?category=necklaces" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Necklaces & Pendants
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/shop?category=earrings" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Earrings
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                        </div>
                    </div>

                    {/* Col 3: Legal/Customer Care */}
                    <div className="space-y-6 text-center sm:text-left">
                        <span className="text-[10px] uppercase tracking-[0.25em] font-bold block" style={{ color: '#3a2e28' }}>
                            Customer Care
                        </span>
                        <div className="flex flex-col space-y-3.5 text-xs font-light tracking-wider">
                            <Link href="/shipping-returns" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Shipping & Returns
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/jewelry-care" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Jewelry Care Guide
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/privacy-policy" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Privacy Policy
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/contact" className="group relative w-fit mx-auto sm:mx-0 transition-opacity opacity-80 hover:opacity-100" style={{ color: '#3a2e28' }}>
                                Support & Care
                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#3a2e28] transition-all duration-300 group-hover:w-full" />
                            </Link>
                        </div>
                    </div>

                    {/* Col 4: Newsletter Input */}
                    <div className="space-y-5 text-center sm:text-left">
                        <span className="text-[10px] uppercase tracking-[0.25em] font-bold block" style={{ color: '#3a2e28' }}>
                            Stay Updated
                        </span>
                        <p className="text-xs font-light opacity-75 leading-relaxed" style={{ color: '#3a2e28' }}>
                            Subscribe to receive launch updates and premium offers.
                        </p>
                        {/* 🔑 FIXED: Newsletter items spaced perfectly with modern luxury input look */}
                        <div className="flex flex-col gap-3 max-w-xs mx-auto sm:mx-0 mt-1">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full bg-white/20 border px-4 py-3 text-xs font-light tracking-wide focus:outline-hidden focus:bg-white/40 focus:border-[#3a2e28]/70 transition-all duration-300 placeholder:text-gray-500 rounded-none"
                                style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                            />
                            <button 
                                className="w-full text-white py-3.5 text-[10px] uppercase tracking-widest font-semibold hover:opacity-90 transition-all duration-300 cursor-pointer shadow-xs rounded-none"
                                style={{ backgroundColor: '#3a2e28' }}
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom copyright line */}
                <div className="border-t pt-8 text-center text-[10px] font-light tracking-widest opacity-50" style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }}>
                    <p>© {new Date().getFullYear()} Glint & Glam. All Rights Reserved.</p>
                </div>

            </div>
        </footer>
    );
}