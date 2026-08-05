'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Touch Swipe & Thumbnail Auto-Scroll Refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const thumbnailRefs = useRef([]);

  const imagesList = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    return [{ id: 'placeholder', url: '/placeholder.jpg' }];
  }, [product]);

  // Selected Image URL
  const selectedImage = imagesList[selectedImageIndex]?.url || "/placeholder.jpg";

  // 1. Unique Sizes Extract
  const allSizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  }, [product]);

  useEffect(() => {
    if (allSizes.length > 0 && !selectedSize) {
      setSelectedSize(allSizes[0]);
    }
  }, [allSizes, selectedSize]);

  // 2. Selected Size ke mutabiq available colors
  const availableColorsForSize = useMemo(() => {
    if (!product?.variants) return [];
    
    const filteredVariants = selectedSize 
      ? product.variants.filter((v) => v.size === selectedSize)
      : product.variants;

    return Array.from(new Set(filteredVariants.map((v) => v.color).filter(Boolean)));
  }, [product, selectedSize]);

  useEffect(() => {
    if (availableColorsForSize.length > 0) {
      if (!availableColorsForSize.includes(selectedColor)) {
        setSelectedColor(availableColorsForSize[0]);
      }
    } else {
      setSelectedColor('');
    }
  }, [availableColorsForSize, selectedColor]);

  // 3. Variant Match
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      return { id: 'default', price: 0, originalPrice: null, stock: 0 };
    }
    return product.variants.find((v) => {
      const matchSize = selectedSize ? v.size === selectedSize : true;
      const matchColor = selectedColor ? v.color === selectedColor : true;
      return matchSize && matchColor;
    }) || product.variants[0];
  }, [product, selectedSize, selectedColor]);

  // 🌟 Auto-scroll active thumbnail into view on index change
  useEffect(() => {
    if (thumbnailRefs.current[selectedImageIndex]) {
      thumbnailRefs.current[selectedImageIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedImageIndex]);

  // Image Slide Controls
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      handleNextImage(); // Swiped left -> Next
    } else if (distance < -minSwipeDistance) {
      handlePrevImage(); // Swiped right -> Prev
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!product) {
    return (
      <main className="min-h-screen py-16 text-center flex items-center justify-center" style={{ backgroundColor: '#f5f3ed', color: '#3a2e28' }}>
        <p className="text-sm font-medium tracking-wide">Product details not available.</p>
      </main>
    );
  }

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const sellingPrice = Number(selectedVariant?.price || 0);
  const originalPrice = selectedVariant?.originalPrice ? Number(selectedVariant.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > sellingPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) 
    : 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock!");
      return;
    }
    
    setIsAdding(true);
    try {
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
          
          {/* --- LEFT: Image Slider & Gallery --- */}
          <div className="flex flex-col gap-4">
            
            {/* Main Interactive Slider Box */}
            <div 
              className="relative w-full aspect-[4/5] bg-white/40 overflow-hidden border select-none group"
              style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all duration-300 pointer-events-none" 
              />

              {/* Prev / Next Slide Arrows (ONLY visible on Desktop hover, Hidden on Mobile) */}
              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#3a2e28] p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#3a2e28] p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Next Image"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Image Counter Indicator */}
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] px-2 py-0.5 tracking-widest uppercase font-mono">
                    {selectedImageIndex + 1} / {imagesList.length}
                  </div>
                </>
              )}
            </div>
            
            {/* 🌟 Thumbnails Carousel (Scrollbar-Free + Auto-centering Active Thumb) */}
            {imagesList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth snap-x">
                {imagesList.map((img, idx) => (
                  <button 
                    key={img.id || idx} 
                    ref={(el) => (thumbnailRefs.current[idx] = el)}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className="flex-shrink-0 w-16 h-16 border overflow-hidden bg-white transition-all cursor-pointer snap-center"
                    style={{ 
                      borderColor: selectedImageIndex === idx ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)',
                      opacity: selectedImageIndex === idx ? 1 : 0.5,
                      borderWidth: selectedImageIndex === idx ? '2px' : '1px'
                    }}
                  >
                    <img src={img.url} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Custom CSS to hide scrollbars globally in Chrome, Safari, Firefox */}
            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

          </div>

          {/* --- RIGHT: Product Information --- */}
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
              
              {/* 🏷️ Dynamic Price & Discount Badge */}
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl font-semibold" style={{ color: '#3a2e28' }}>
                  Rs. {sellingPrice.toLocaleString()}
                </span>

                {hasDiscount && (
                  <>
                    <span className="text-sm text-gray-400 line-through font-medium">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-[#C8102E] text-white font-bold px-2 py-0.5 uppercase tracking-wider">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              
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
            <p className="text-xs sm:text-sm font-light leading-relaxed opacity-80 whitespace-pre-line" style={{ color: '#3a2e28' }}>
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

            {/* --- Colors Selector --- */}
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

            {/* --- Add to Cart Button --- */}
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