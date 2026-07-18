"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X, ArrowRight, Image as ImageIcon } from "lucide-react";

export default function SearchBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Database sync tracking failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Toggle Trigger Icon Button */}
      <button
        type="button"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="text-[#3a2e28] opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer p-2 flex items-center justify-center focus:outline-none z-[100000] relative"
      >
        {isSearchOpen ? (
          <X size={18} strokeWidth={1.5} className="rotate-0 transition-transform duration-300" />
        ) : (
          <Search size={18} strokeWidth={1.5} className="hover:scale-105 transition-transform duration-300" />
        )}
      </button>

      {/* 🌟 1. LIGHTER FULL PAGE BACKDROP OVERLAY */}
      <div 
        className={`fixed inset-0 top-0 bg-black/20 backdrop-blur-[6px] z-[9999] transition-opacity duration-500 ease-in-out ${
          isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* 🌟 2. FLAT THEME-BASED DROPDOWN CONTAINER WITH SMOOTH LUXURY TRANSITIONS */}
      <div 
        className={`fixed top-[75px] left-4 right-4 md:absolute md:top-auto md:left-auto md:right-0 mt-3 w-auto md:w-96 bg-[#3a2e28]/95 backdrop-blur-xl border border-white/10 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-5 z-[99999] transform origin-top transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isSearchOpen 
            ? "opacity-100 scale-100 translate-y-0 visible" 
            : "opacity-0 scale-95 -translate-y-4 invisible"
        }`}
      >
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center justify-center border-b pb-2 border-white/20">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search premium curation..."
            className="w-full bg-transparent text-xs font-light focus:outline-none tracking-widest text-[#fdfbf7] placeholder:text-[#fdfbf7]/40 font-sans text-center placeholder:text-center uppercase"
          />
          {searchQuery && (
            <button type="submit" className="absolute right-1 text-[#fdfbf7] opacity-60 hover:opacity-100 transition-opacity p-1">
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          )}
        </form>

        {/* Dynamic Results Menu */}
        {searchQuery.trim() && (
          <div className="mt-4 max-h-72 overflow-y-auto space-y-1 font-sans divide-y divide-white/5 pt-1 scrollbar-thin scrollbar-thumb-white/10">
            {isSearching ? (
              <p className="text-[10px] text-[#fdfbf7]/50 tracking-wider uppercase font-light py-3 text-center">Searching curation...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => {
                // Safely extract the first image URL or provide a fallback
                const imageUrl = product.images?.[0]?.url || product.imageUrl;

                return (
                  <div 
                    key={product.id}
                    onClick={() => {
                      router.push(`/shop/${product.id}`);
                      setIsSearchOpen(false);
                    }}
                    className="group pt-2.5 pb-2 text-left cursor-pointer flex justify-between items-center hover:bg-white/5 px-3 rounded-none transition-all duration-300 gap-3"
                  >
                    {/* 🌟 NEW: Product Image Container */}
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 shrink-0 bg-white/5 overflow-hidden flex items-center justify-center border border-white/10">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <ImageIcon size={14} className="text-white/30" />
                        )}
                      </div>

                      {/* Text Data */}
                      <div className="max-w-[70%]">
                        <p className="text-xs font-medium text-[#fdfbf7] tracking-wide truncate group-hover:translate-x-1 transition-transform duration-300">
                          {product.name}
                        </p>
                        {product.category && (
                          <span className="text-[9px] text-[#fdfbf7]/40 font-light block uppercase tracking-widest mt-0.5">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-[#fdfbf7]/80 tracking-wider whitespace-nowrap">
                      {product.price ? `Rs. ${product.price.toLocaleString()}` : "N/A"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-5 text-center">
                <p className="text-xs font-medium text-[#fdfbf7]/70 tracking-wide">Product not found</p>
                <p className="text-[10px] text-[#fdfbf7]/40 font-light mt-0.5 tracking-wide">Try searching different tags or styles</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}