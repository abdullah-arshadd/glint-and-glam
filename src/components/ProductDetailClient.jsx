'use client';
import React, { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext'; 
import { toast } from 'sonner'; 

export default function ProductDetailClient({ product }) {
  const { addToCart } = useCart();
  
  // Safe defaults
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || { id: 'default', price: 0, size: 'N/A', stock: 0 });
  const [selectedImage, setSelectedImage] = useState(product.images?.[0]?.url || "/placeholder.jpg");
  const [isHovered, setIsHovered] = useState(false);
  
  // Loading state for instant button feedback
  const [isAdding, setIsAdding] = useState(false);

  // Stock logic
  const isOutOfStock = selectedVariant.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock!");
      return;
    }
    
    // 1. Asal loading state shuru (Button ab "Adding..." dikhayega)
    setIsAdding(true);
    
    try {
      // 2. Context function ko await karein (Jab tak asal mein add nahi hota, yeh wait karega)
      await addToCart(selectedVariant.id, selectedVariant.stock);
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      // 3. Data add hote hi (chahe success ho ya fail) button foran normal ho jayega
      setIsAdding(false);
    }
  };

  return (
    // Main layout with background #f5f3ed
    <main className="min-h-screen py-8 lg:py-16 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          
          {/* --- LEFT: Image Section --- */}
          <div className="flex flex-col gap-4">
            {/* Squared, sharp corners */}
            <div className="w-full aspect-[4/5] bg-white/40 overflow-hidden border" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Thumbnails Row */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images?.map((img) => (
                <button 
                  key={img.id} 
                  onClick={() => setSelectedImage(img.url)}
                  className="flex-shrink-0 w-16 h-16 border overflow-hidden bg-white transition-all cursor-pointer"
                  style={{ 
                    borderColor: selectedImage === img.url ? '#3a2e28' : 'rgba(58, 46, 40, 0.1)' 
                  }}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT: Content Section --- */}
          <div className="flex flex-col space-y-6 lg:pt-2">
            <div>
              {/* Category */}
              <span className="text-[10px] uppercase tracking-[0.25em] opacity-60 font-semibold" style={{ color: '#3a2e28' }}>
                {product.category?.name || "General"}
              </span>
              
              {/* Main Heading */}
              <h1 className="text-3xl md:text-4xl font-light tracking-wide mt-1 [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                {product.name}
              </h1>
              
              {/* Price */}
              <p className="text-xl font-semibold mt-2" style={{ color: '#3a2e28' }}>
                Rs. {Number(selectedVariant.price || 0).toLocaleString()}
              </p>
              
              {/* Stock Status Indicator */}
              <div className="mt-4 inline-block">
                {isOutOfStock ? (
                  <span className="text-[10px] text-red-700 bg-red-50/60 border border-red-200 px-3 py-1.5 font-semibold uppercase tracking-wider">
                    Out of Stock
                  </span>
                ) : selectedVariant.stock <= 5 ? (
                  <span className="text-xs text-orange-800 font-medium italic bg-orange-50/80 border border-orange-200 px-3 py-2">
                    Only {selectedVariant.stock} left in stock!
                  </span>
                ) : (
                  <span className="text-[10px] text-green-700 bg-green-50/60 border border-green-200 px-3 py-1.5 font-semibold uppercase tracking-wider">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            <hr style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }} />

            {/* Description */}
            <p className="text-xs sm:text-sm font-light leading-relaxed opacity-80" style={{ color: '#3a2e28' }}>
              {product.description}
            </p>

            {/* --- Sizes Selector --- */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest opacity-70 font-semibold" style={{ color: '#3a2e28' }}>
                Select Size
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map((v) => {
                  const isCurrentVariant = selectedVariant.id === v.id;
                  const isVariantOutOfStock = v.stock <= 0;
                  
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      disabled={isVariantOutOfStock}
                      className="px-4 py-2 text-xs font-medium border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: isCurrentVariant ? '#3a2e28' : 'rgba(255, 255, 255, 0.6)',
                        borderColor: isCurrentVariant ? '#3a2e28' : 'rgba(58, 46, 40, 0.15)',
                        color: isCurrentVariant ? '#ffffff' : '#3a2e28'
                      }}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- Add to Cart Primary Button --- */}
            <div className="pt-4">
              <button 
                onClick={handleAddToCart}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                disabled={isOutOfStock || isAdding} 
                className="w-full py-4 uppercase tracking-[0.15em] text-xs font-semibold shadow-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#3a2e28]/80 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isOutOfStock ? '#d1d5db' : (isHovered ? '#bd977a' : '#3a2e28'), 
                  color: '#ffffff'
                }}
              >
                {isAdding ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingBag size={13} /> 
                    {isOutOfStock ? "Out of Stock" : "Add To Shopping Bag"}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}