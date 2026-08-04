'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext'; 
import { toast } from 'sonner'; 
import useSWR from 'swr';

// 🌟 SWR Fetcher Utility Function
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProductDetailClient({ productId, initialProduct }) {
  const { addToCart } = useCart();

  // 🌟 SWR Memory-Caching Layer
  const { data: swrData } = useSWR(
    productId ? `/api/products/${productId}` : null,
    fetcher,
    {
      fallbackData: initialProduct,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const product = swrData?.product || swrData || initialProduct;

  // Selection States
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0]?.url || "/placeholder.jpg"
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // 1. Unique Sizes Extract Karo
  const allSizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  }, [product]);

  // Auto-select First Available Size
  useEffect(() => {
    if (allSizes.length > 0 && !selectedSize) {
      setSelectedSize(allSizes[0]);
    }
  }, [allSizes, selectedSize]);

  // 2. Selected Size ke mutabiq available colors filter karo
  const availableColorsForSize = useMemo(() => {
    if (!product?.variants) return [];
    
    const filteredVariants = selectedSize 
      ? product.variants.filter((v) => v.size === selectedSize)
      : product.variants;

    return Array.from(new Set(filteredVariants.map((v) => v.color).filter(Boolean)));
  }, [product, selectedSize]);

  // Auto-select First Available Color jab Size badle
  useEffect(() => {
    if (availableColorsForSize.length > 0) {
      if (!availableColorsForSize.includes(selectedColor)) {
        setSelectedColor(availableColorsForSize[0]);
      }
    } else {
      setSelectedColor('');
    }
  }, [availableColorsForSize, selectedColor]);

  // 3. Size + Color dono ka exact variant match find karo
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      return { id: 'default', price: 0, stock: 0 };
    }
    return product.variants.find((v) => {
      const matchSize = selectedSize ? v.size === selectedSize : true;
      const matchColor = selectedColor ? v.color === selectedColor : true;
      return matchSize && matchColor;
    }) || product.variants[0];
  }, [product, selectedSize, selectedColor]);

  // Sync main image if cached product updates
  useEffect(() => {
    if (product?.images?.length > 0 && selectedImage === "/placeholder.jpg") {
      setSelectedImage(product.images[0].url);
    }
  }, [product, selectedImage]);

  if (!product) {
    return (
      <main className="min-h-screen py-16 text-center flex items-center justify-center" style={{ backgroundColor: '#f5f3ed', color: '#3a2e28' }}>
        <p className="text-sm font-medium tracking-wide">Product details not available.</p>
      </main>
    );
  }

  // Stock logic
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock!");
      return;
    }
    
    setIsAdding(true);
    try {
      // 🔑 FIX: Context ke `addToCart(variantId, stockAvailable)` ke mutabiq call kiya gaya hai
      await addToCart(selectedVariant.id, selectedVariant.stock);
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <main className="min-h-screen py-8 lg:py-16 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          
          {/* --- LEFT: Image Section --- */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[4/5] bg-white/40 overflow-hidden border" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Thumbnails Row */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images?.map((img) => (
                <button 
                  key={img.id} 
                  type="button"
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
                Rs. {Number(selectedVariant?.price || 0).toLocaleString()}
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
            {allSizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest opacity-70 font-semibold" style={{ color: '#3a2e28' }}>
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className="px-4 py-2 text-xs font-medium border transition-all cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? '#3a2e28' : 'rgba(255, 255, 255, 0.6)',
                          borderColor: isSelected ? '#3a2e28' : 'rgba(58, 46, 40, 0.15)',
                          color: isSelected ? '#ffffff' : '#3a2e28'
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- Colors Selector (Dynamically Filtered by Size) --- */}
            {availableColorsForSize.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest opacity-70 font-semibold" style={{ color: '#3a2e28' }}>
                  Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableColorsForSize.map((col) => {
                    const isSelected = selectedColor === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className="px-5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? '#3a2e28' : 'rgba(255, 255, 255, 0.6)',
                          borderColor: isSelected ? '#3a2e28' : 'rgba(58, 46, 40, 0.15)',
                          color: isSelected ? '#ffffff' : '#3a2e28'
                        }}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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