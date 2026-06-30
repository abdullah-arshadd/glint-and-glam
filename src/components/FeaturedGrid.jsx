'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart, Loader2 } from 'lucide-react';

export default function FeaturedGrid() {
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products")
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        // Safety validations array checking
        const validatedCategories = Array.isArray(catData) 
          ? catData 
          : (catData && Array.isArray(catData.categories) ? catData.categories : []);
          
        const validatedProducts = Array.isArray(prodData) 
          ? prodData 
          : (prodData && Array.isArray(prodData.products) ? prodData.products : []);

        // Sirf top 3 categories dynamic render karne ke liye slicing
        setCategories(validatedCategories.slice(0, 3));
        
        // Best sellers ke liye pehle 4 products render kar letay hain
        setBestSellers(validatedProducts.slice(0, 4));

      } catch (error) {
        console.error("Error loading featured layout elements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedData();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-32 flex justify-center items-center" style={{ backgroundColor: '#f7f2e6' }}>
        <Loader2 className="animate-spin" style={{ color: '#3a2e28' }} size={32} />
      </div>
    );
  }

  return (
    <section className="w-full py-20 lg:py-32" style={{ backgroundColor: '#f7f2e6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- SECTION 1: CATEGORIES BLOCKS --- */}
        <div className="text-center mb-16">
          <span 
            className="text-[10px] lg:text-xs uppercase tracking-[0.3em] font-semibold block mb-3"
            style={{ color: '#3a2e28' }}
          >
            The Collections
          </span>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide"
            style={{ color: '#3a2e28' }}
          >
            Shop by <span className="italic">Category</span>
          </h2>
        </div>

        {/* 3 Column Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28">
          {categories.map((cat) => (
            <Link
              href={`/shop?category=${cat.id}`}
              key={cat.id} 
              className="group relative h-[400px] lg:h-[500px] w-full overflow-hidden bg-[#F7BFB4]/10 cursor-pointer border border-[#F7BFB4]/20 block"
            >
              {/* Dynamic image check fallback wrapper */}
              {cat.image ? (
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
              ) : (
                <div className="absolute inset-0 bg-[#3a2e28]/[0.02] group-hover:bg-[#3a2e28]/[0.05] transition-colors duration-500" />
              )}

              <div className="absolute inset-0 bg-[#2D2524]/5 group-hover:bg-[#2D2524]/20 transition-colors duration-500 z-10" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-center z-20 flex flex-col items-center">
                {/* 🔑 FIXED: Text size scaled down to text-xs/sm and letter spacing stretched out */}
                <h3 className="text-xs lg:text-sm text-[#2D2524] [font-family:'Cormorant_Garamond',serif] tracking-[0.2em] mb-2 bg-white/90 backdrop-blur-md px-4 py-2.5 border border-[#F7BFB4]/30 w-full max-w-[180px] uppercase font-semibold">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>


        {/* --- SECTION 2: DYNAMIC BEST SELLERS --- */}
        <div className="text-center mb-16">
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-[#3A2E28] font-semibold block mb-3">
            Twinkles Signature
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Our Best Sellers
          </h2>
        </div>

        {/* Responsive Grid (2 Columns Mobile, 4 Columns Large Screen) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-10 gap-y-16">
          {bestSellers.map((product) => (
            <div key={product.id} className="group flex flex-col justify-between relative">
              
              {/* Image Canvas with Premium Actions Hover */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F7BFB4]/5 border border-[#F7BFB4]/20 transition-all duration-300">
                <img 
                  src={product.images?.[0]?.url || '/placeholder.jpg'} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
                />

                {/* Elegant Glassmorphism Interactions Panel */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2">
                    <button className="bg-white p-3 shadow-xs hover:bg-[#F7BFB4] text-[#2D2524] transition-colors duration-300 rounded-full cursor-pointer">
                      <Heart size={16} strokeWidth={1.5} />
                    </button>
                    <Link 
                      href={`/shop/${product.id}`}
                      className="bg-white p-3 shadow-xs hover:bg-[#F7BFB4] text-[#2D2524] transition-colors duration-300 rounded-full cursor-pointer flex items-center justify-center"
                    >
                      <Eye size={16} strokeWidth={1.5} />
                    </Link>
                  </div>
                  
                  {/* Backend Ready Button */}
                  <Link 
                    href={`/shop/${product.id}`}
                    className="w-full bg-[#DB93B0] text-white py-3 uppercase tracking-widest text-[9px] lg:text-[10px] font-semibold hover:bg-[#DB93B0]/90 transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    View Product
                  </Link>
                </div>
              </div>

              {/* Product Description */}
              <div className="mt-6 text-center flex flex-col items-center">
                <span className="text-[8px] lg:text-[9px] uppercase tracking-widest text-gray-400 mb-1">
                  {product.category?.name || "Fine Jewelry"}
                </span>
                <Link href={`/shop/${product.id}`} className="block">
                  <h3 className="text-xs md:text-sm lg:text-base text-[#2D2524] font-light tracking-wide [font-family:'Plus_Jakarta_Sans',sans-serif] hover:text-[#DB93B0] transition-colors duration-200 cursor-pointer line-clamp-1 max-w-xs px-2">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs md:text-sm lg:text-base text-[#2D2524] font-semibold mt-1.5 tracking-wide">
                  Rs. {product.variants?.length > 0 ? Number(product.variants[0].price).toLocaleString() : "N/A"}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}