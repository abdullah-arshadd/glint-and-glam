'use client';
import React, { useState, useEffect } from 'react';
import UserDropdown from "./UserDropdown";
import SearchBar from "./SearchBar";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Plus, Minus, Phone, Mail, User, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Dynamic Backend Categories State Engine ---
    const [categories, setCategories] = useState([]); 
    const [allCategoriesFlat, setAllCategoriesFlat] = useState([]);

    // Accordions local tracking states
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(true);
    const [openCategories, setOpenCategories] = useState({});
    const [openSubCategories, setOpenSubCategories] = useState({});

    const { cartCount } = useCart();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    // --- Core API Data Synchronization Pipeline ---
    useEffect(() => {
        async function fetchNavbarCategories() {
            try {
                const catRes = await fetch("/api/categories");
                const catData = await catRes.json();
                
                const validatedCategories = Array.isArray(catData) 
                  ? catData 
                  : (catData && Array.isArray(catData.categories) ? catData.categories : []);

                setCategories(validatedCategories);

                // Exact match flattening mechanism used inside your shop engine
                const flatten = (items) => {
                  if (!Array.isArray(items)) return [];
                  let flat = [];
                  items.forEach(item => {
                    if (item) {
                      flat.push(item);
                      if (item.children) flat = [...flat, ...flatten(item.children)];
                    }
                  });
                  return flat;
                };
                
                setAllCategoriesFlat(flatten(validatedCategories));
            } catch (error) {
                console.error("Error fetching navbar categories:", error);
            }
        }
        fetchNavbarCategories();
    }, []);

    const toggleCategory = (catId) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const toggleSubCategory = (subId) => {
        setOpenSubCategories(prev => ({ ...prev, [subId]: !prev[subId] }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log("Searching for:", searchQuery);
            setIsSearchOpen(false);
        }
    };

    // Route dispatcher ensures parameters cleanly target the shop view state
    const handleCategoryRedirect = (id) => {
        setIsOpen(false);
        router.push(`/shop?category=${id}`);
    };

    // Filters down Level 1 categories dynamically
    const mainCategories = categories.filter(c => !c.parentId);

    return (
        <>
            {/* 🖥️ DESKTOP NAVBAR VIEW CHASSIS */}
            <nav
                className="sticky top-0 z-40 backdrop-blur-md border-none uppercase tracking-widest text-[10px] font-medium w-full"
                style={{ backgroundColor: '#f0e8d6', color: '#3a2e28' }}
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .nav-link-item, .nav-icon-item { color: #3a2e28 !important; transition: opacity 0.3s ease; }
                    .nav-link-item:hover, .nav-icon-item:hover { color: #3a2e28 !important; opacity: 0.6 !important; }
                    .user-dropdown-wrapper * { color: #3a2e28 !important; }
                    .user-dropdown-wrapper *:hover { opacity: 0.9 !important; }
                `}} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 relative">

                        {/* Left Control Cluster */}
                        <div className="flex items-center">
                            <div className="flex md:hidden z-50">
                                <button 
                                    onClick={() => setIsOpen(true)} 
                                    className="nav-icon-item focus:outline-none cursor-pointer p-1"
                                >
                                    <Menu size={22} />
                                </button>
                            </div>

                            <div className="hidden md:flex space-x-8">
                                <Link href="/shop" className="nav-link-item">Shop All</Link>
                                <Link href="/shop?category=rings" className="nav-link-item">Rings</Link>
                                <Link href="/shop?category=necklaces" className="nav-link-item">Necklaces</Link>
                            </div>
                        </div>

                        {/* Center Branding Axis */}
                        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 text-center z-10 max-w-[50%] sm:max-w-none truncate">
                            <Link
                                href="/"
                                className="normal-case text-lg sm:text-2xl font-semibold tracking-wide hover:opacity-80 transition-all duration-300 [font-family:'Cormorant_Garamond',serif]"
                                style={{ color: '#3a2e28' }}
                            >
                                Glint & Glam
                            </Link>
                        </div>

                        {/* Right Interactive Nodes */}
                        <div className="flex items-center space-x-3 sm:space-x-6 z-50">
                            <SearchBar />

                            <div className="user-dropdown-wrapper inline-flex items-center">
                                <UserDropdown />
                            </div>

                            <Link href="/cart" className="nav-icon-item relative p-1.5 block">
                                <ShoppingBag size={18} strokeWidth={1.5} />
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
            </nav>

            {/* 📱 🔑 OVERLAY FIXED FULL DESK DRAWER MODULE */}
            <div className={`fixed inset-0 w-full h-screen z-[99999] md:hidden flex transition-all duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'}`}>
                
                {/* Backdrop Interceptor Layer */}
                <div 
                    className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-xs transition-opacity duration-300" 
                    onClick={() => setIsOpen(false)} 
                />

                {/* Left Sliding Menu Core Deck */}
                <div 
                    className={`relative w-[85%] max-w-[340px] h-full shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out z-10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ backgroundColor: '#F7F2E6', color: '#3a2e28' }}
                >
                    {/* Upper Exit Controls Anchor */}
                    <div className="flex items-center justify-end px-5 pt-6 pb-2">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:opacity-60 transition-opacity cursor-pointer"
                        >
                            <X size={22} style={{ color: '#3a2e28' }} />
                        </button>
                    </div>

                    {/* Navigation Stream Matrix */}
                    <div className="px-5 pb-6 flex-1 space-y-5 [font-family:'Plus_Jakarta_Sans',sans-serif] tracking-[0.12em]">
                        
                        {/* HOME BLOCK */}
                        <div className="text-[12px] uppercase font-bold border-b border-[#3a2e28]/10 pb-3">
                            <Link href="/" onClick={() => setIsOpen(false)} className="block">Home</Link>
                        </div>

                        {/* ABOUT US NEST BLOCK */}
                        <div className="border-b border-[#3a2e28]/10 pb-3">
                            <button 
                                onClick={() => setIsAboutOpen(!isAboutOpen)}
                                className="w-full flex items-center justify-between text-[12px] uppercase font-bold text-left cursor-pointer"
                            >
                                <span>About Us</span>
                                {isAboutOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                            <div className={`mt-2 pl-2 overflow-hidden transition-all duration-300 ${isAboutOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <Link href="/story" onClick={() => setIsOpen(false)} className="block text-[12px] normal-case tracking-normal font-light text-[#5a3317]/80 py-1">
                                    Our Story
                                </Link>
                            </div>
                        </div>

                        {/* CATALOG NEST LAYER (COMPLETELY DYNAMIC WITH THE SHOP ARCHITECTURE) */}
                        <div className="border-b border-[#3a2e28]/10 pb-3">
                            <button 
                                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                                className="w-full flex items-center justify-between text-[12px] uppercase font-bold text-left cursor-pointer"
                            >
                                <span>Catalog</span>
                                {isCatalogOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                            
                            {/* LEVEL 1: DYNAMIC MAIN CATEGORIES ENGINE */}
                            <div className={`mt-3 pl-2 space-y-3 overflow-hidden transition-all duration-300 ${isCatalogOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {mainCategories.map((cat) => {
                                    const hasChildren = cat.children && cat.children.length > 0;
                                    const isCatOpen = !!openCategories[cat.id];

                                    return (
                                        <div key={cat.id} className="space-y-2.5 py-0.5">
                                            {hasChildren ? (
                                                <button
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className="w-full flex items-center justify-between text-[12px] text-[#3a2e28] font-semibold tracking-wide text-left cursor-pointer hover:opacity-80"
                                                >
                                                    <span>{cat.name}</span>
                                                    {isCatOpen ? <Minus className="w-3 h-3 text-[#5a3317]/60" /> : <Plus className="w-3 h-3 text-[#5a3317]/60" />}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleCategoryRedirect(cat.id)}
                                                    className="block text-[12px] text-[#3a2e28]/90 font-medium tracking-wide hover:opacity-70 text-left w-full cursor-pointer"
                                                >
                                                    {cat.name}
                                                </button>
                                            )}

                                            {/* LEVEL 2: DYNAMIC SUB-CATEGORIES ENGINE */}
                                            {hasChildren && (
                                                <div className={`pl-3 space-y-2.5 overflow-hidden transition-all duration-300 ${isCatOpen ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                                    {cat.children.map((child) => {
                                                        const hasGrandChildren = child.children && child.children.length > 0;
                                                        const isSubOpen = !!openSubCategories[child.id];

                                                        return (
                                                            <div key={child.id} className="space-y-2">
                                                                {hasGrandChildren ? (
                                                                    <button
                                                                        onClick={() => toggleSubCategory(child.id)}
                                                                        className="w-full flex items-center justify-between text-[12px] text-[#5a3317]/90 normal-case tracking-normal font-semibold text-left cursor-pointer hover:opacity-80"
                                                                    >
                                                                        <span className="flex items-center gap-1"><ChevronRight className="w-2.5 h-2.5 opacity-40" />{child.name}</span>
                                                                        {isSubOpen ? <Minus className="w-2.5 h-2.5 opacity-50" /> : <Plus className="w-2.5 h-2.5 opacity-50" />}
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleCategoryRedirect(child.id)}
                                                                        className="block text-[12px] text-[#5a3317]/80 normal-case tracking-normal font-normal hover:text-black pl-3.5 text-left w-full cursor-pointer"
                                                                    >
                                                                        {child.name}
                                                                    </button>
                                                                )}

                                                                {/* LEVEL 3: DYNAMIC GRANDCHILDREN PIPELINE */}
                                                                {hasGrandChildren && (
                                                                    <div className={`pl-6 space-y-2 overflow-hidden transition-all duration-300 ${isSubOpen ? 'max-h-[400px] opacity-100 mt-2 mb-1' : 'max-h-0 opacity-0'}`}>
                                                                        {child.children.map((grandChild) => (
                                                                            <button
                                                                                key={grandChild.id}
                                                                                onClick={() => handleCategoryRedirect(grandChild.id)}
                                                                                className="block text-[12px] text-[#5a3317]/70 normal-case tracking-normal font-light hover:text-black text-left w-full cursor-pointer"
                                                                            >
                                                                                • {grandChild.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* FAQ BLOCK */}
                        <div className="text-[12px] uppercase font-bold border-b border-[#3a2e28]/10 pb-3">
                            <Link href="/faqs" onClick={() => setIsOpen(false)} className="block">FAQ's</Link>
                        </div>
                    </div>

                    {/* BASE PANEL FOOTER STACK */}
                    <div className="px-5 py-5 border-t border-[#3a2e28]/10 space-y-3.5 bg-black/[0.01] [font-family:'Plus_Jakarta_Sans',sans-serif] tracking-normal normal-case">
                        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#3a2e28]/50">
                            Contact
                        </div>
                        
                        <a href="tel:+923001202706" className="flex items-center gap-3 text-xs text-[#5a3317]/90 font-light hover:text-black">
                            <Phone className="w-3.5 h-3.5 opacity-70" />
                            <span>+92 300 1202706</span>
                        </a>

                        <a href="mailto:bloomstone.pk@gmail.com" className="flex items-center gap-3 text-xs text-[#5a3317]/90 font-light hover:text-black break-all">
                            <Mail className="w-3.5 h-3.5 opacity-70" />
                            <span>bloomstone.pk@gmail.com</span>
                        </a>

                        <div className="pt-2.5 border-t border-[#3a2e28]/10">
                            <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-xs text-[#5a3317]/90 font-light hover:text-black">
                                <User className="w-3.5 h-3.5 opacity-70" />
                                <span>Login / Register</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Overlay Area */}
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
        </>
    );
}