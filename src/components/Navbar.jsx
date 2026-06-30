'use client';
import React, { useState } from 'react';
import UserDropdown from "./UserDropdown";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { cartCount } = useCart();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
            setIsSearchOpen(false);
        }
    };

    return (
        // 🔑 FIXED: No borders, explicit text alignment using #3a2e28 base color
        <nav
            className="sticky top-0 z-50 backdrop-blur-md border-none uppercase tracking-widest text-[10px] font-medium"
            style={{ backgroundColor: '#f0e8d6', color: '#3a2e28' }}
        >
            {/* Injecting CSS styles to guarantee hover transition color matches #3a2e28 directly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .nav-link-item, .nav-icon-item { color: #3a2e28 !important; transition: opacity 0.3s ease; }
                .nav-link-item:hover, .nav-icon-item:hover { color: #3a2e28 !important; opacity: 0.6 !important; }
                /* Forced wrapper override to clean any internal pink assets inside dropdown */
                .user-dropdown-wrapper * { color: #3a2e28 !important; }
                .user-dropdown-wrapper *:hover { opacity: 0.9 !important; }
            `}} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 relative">

                    {/* Left: Navigation Links */}
                    <div className="flex items-center">
                        <div className="flex md:hidden z-50">
                            <button onClick={() => setIsOpen(!isOpen)} className="nav-icon-item focus:outline-none cursor-pointer p-1">
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>

                        <div className="hidden md:flex space-x-8">
                            <Link href="/shop" className="nav-link-item">Shop All</Link>
                            <Link href="/shop" className="nav-link-item">Rings</Link>
                            <Link href="/shop" className="nav-link-item">Necklaces</Link>
                        </div>
                    </div>

                    {/* Center: Brand Name */}
                    <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 text-center z-10 max-w-[50%] sm:max-w-none truncate">
                        <Link
                            href="/"
                            className="normal-case text-lg sm:text-2xl font-semibold tracking-wide hover:opacity-80 transition-all duration-300 [font-family:'Cormorant_Garamond',serif]"
                            style={{ color: '#3a2e28' }} // 🔑 FIXED: Inline CSS applied directly here
                        >
                            Glint & Glam
                        </Link>
                    </div>

                    {/* Right: Icons */}
                    <div className="flex items-center space-x-3 sm:space-x-6 z-50">
                        <button onClick={() => setIsSearchOpen(true)} className="nav-icon-item cursor-pointer p-1.5">
                            <Search size={18} strokeWidth={1.5} />
                        </button>

                        {/* 🔑 FIXED: User Dropdown wrapped in direct control layout to force turn off pink */}
                        <div className="user-dropdown-wrapper inline-flex items-center">
                            <UserDropdown />
                        </div>

                        <Link href="/cart" className="nav-icon-item relative p-1.5 block">
                            <ShoppingBag size={18} strokeWidth={1.5} />
                            {/* Dynamic Cart Badge */}
                            {cartCount > 0 && (
                                <span
                                    className="absolute top-0 right-0 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white"
                                    style={{ backgroundColor: '#5a3317' }}
                                >
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-none animate-in fade-in slide-in-from-top-5 duration-200" style={{ backgroundColor: '#f0e8d6' }}>
                    <div className="px-4 pt-2 pb-6 space-y-4 text-center flex flex-col">
                        <Link href="/shop" onClick={() => setIsOpen(false)} className="nav-link-item py-2">Shop All</Link>
                        <Link href="/shop" onClick={() => setIsOpen(false)} className="nav-link-item py-2">Rings</Link>
                        <Link href="/shop" onClick={() => setIsOpen(false)} className="nav-link-item py-2">Necklaces</Link>
                    </div>
                </div>
            )}

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center pt-24">
                    <div className="bg-white w-full max-w-3xl mx-4 p-6 border shadow-2xl relative rounded-md">
                        <button onClick={() => setIsSearchOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[#2D2524] p-2">
                            <X size={20} />
                        </button>
                        <form onSubmit={handleSearchSubmit} className="space-y-4 pt-4">
                            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold">What are you looking for?</h3>
                            <div className="relative flex items-center border-b border-gray-200 focus-within:border-[#3a2e28] pb-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search rings, necklaces, earrings..."
                                    className="w-full bg-transparent text-sm focus:outline-none"
                                    style={{ color: '#3a2e28' }}
                                />
                                <button type="submit" className="p-1" style={{ color: '#3a2e28' }}><Search size={18} /></button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </nav>
    );
}