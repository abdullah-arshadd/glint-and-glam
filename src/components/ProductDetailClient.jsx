'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext'; 
import { toast } from 'sonner'; 
import useSWR from 'swr';
import { getOptimizedUrl } from '@/lib/cloudinary';

const fetcher = (url) => fetch(url).then((res) => res.json());

// Distance between two touch points (for pinch)
const getDistance = (t1, t2) => {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export default function ProductDetailClient({ productId, initialProduct }) {
  const { addToCart } = useCart();

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

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Slider drag/animation state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isOverArrow, setIsOverArrow] = useState(false); // 🌟 fix: arrow hover shouldn't zoom
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [mounted, setMounted] = useState(false);

  // 🌟 Pinch-to-zoom state (mobile)
  const [pinchScale, setPinchScale] = useState(1);
  const [pinchOrigin, setPinchOrigin] = useState({ x: 50, y: 50 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPinchActive, setIsPinchActive] = useState(false);

  const touchStartX = useRef(0);
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);
  const isPinching = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const imagesList = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    return [{ id: 'placeholder', url: '/placeholder.jpg' }];
  }, [product]);

  const allSizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  }, [product]);

  useEffect(() => {
    if (allSizes.length > 0 && !selectedSize) {
      setSelectedSize(allSizes[0]);
    }
  }, [allSizes, selectedSize]);

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

  useEffect(() => {
    if (thumbnailRefs.current[selectedImageIndex]) {
      thumbnailRefs.current[selectedImageIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedImageIndex]);

  // 🌟 Reset pinch/pan whenever image changes
  useEffect(() => {
    setPinchScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [selectedImageIndex]);

  const goTo = (idx) => {
    const len = imagesList.length;
    setSelectedImageIndex(((idx % len) + len) % len);
  };

  const handlePrevImage = () => goTo(selectedImageIndex - 1);
  const handleNextImage = () => goTo(selectedImageIndex + 1);

  // --- Touch handlers: swipe + pinch-zoom + pan (when zoomed) ---
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      isPinching.current = true;
      setIsPinchActive(true);
      pinchStartDist.current = getDistance(e.touches[0], e.touches[1]);
      pinchStartScale.current = pinchScale;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        setPinchOrigin({
          x: ((midX - rect.left) / rect.width) * 100,
          y: ((midY - rect.top) / rect.height) * 100,
        });
      }
    } else if (e.touches.length === 1) {
      if (pinchScale > 1.02) {
        // Panning inside a zoomed image
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastPan.current = { ...panOffset };
      } else {
        touchStartX.current = e.targetTouches[0].clientX;
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && isPinching.current) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const rawScale = (dist / pinchStartDist.current) * pinchStartScale.current;
      setPinchScale(Math.min(Math.max(rawScale, 1), 3));
      return;
    }

    if (e.touches.length === 1) {
      if (pinchScale > 1.02) {
        e.preventDefault();
        const dx = e.touches[0].clientX - panStart.current.x;
        const dy = e.touches[0].clientY - panStart.current.y;
        setPanOffset({ x: lastPan.current.x + dx, y: lastPan.current.y + dy });
        return;
      }

      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const delta = e.targetTouches[0].clientX - touchStartX.current;
      const atStart = selectedImageIndex === 0 && delta > 0;
      const atEnd = selectedImageIndex === imagesList.length - 1 && delta < 0;
      const resisted = (atStart || atEnd) ? delta * 0.35 : delta;
      setDragOffset((resisted / width) * 100);
    }
  };

  const handleTouchEnd = () => {
    if (isPinching.current) {
      isPinching.current = false;
      setIsPinchActive(false);
      if (pinchScale <= 1.05) {
        setPinchScale(1);
        setPanOffset({ x: 0, y: 0 });
      }
      return;
    }

    if (pinchScale > 1.02) {
      return; // was panning a zoomed image, nothing else to do
    }

    const threshold = 12;
    if (dragOffset <= -threshold) {
      handleNextImage();
    } else if (dragOffset >= threshold) {
      handlePrevImage();
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  // --- Desktop hover zoom (cursor-follow) ---
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
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
          <div
            className="flex flex-col gap-4 transition-all duration-700 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            
            {/* Main Interactive Slider Box */}
            <div 
              ref={containerRef}
              className="relative w-full aspect-[4/5] bg-white/40 overflow-hidden border select-none group cursor-grab active:cursor-grabbing"
              style={{ borderColor: 'rgba(58, 46, 40, 0.08)', touchAction: isPinchActive || pinchScale > 1 ? 'none' : 'pan-y' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <div
                ref={trackRef}
                className="flex h-full"
                style={{
                  width: `${imagesList.length * 100}%`,
                  transform: `translateX(calc(${-selectedImageIndex * (100 / imagesList.length)}% + ${dragOffset * (1 / imagesList.length)}%))`,
                  transition: isDragging ? 'none' : 'transform 550ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {imagesList.map((img, idx) => {
                  const isActive = idx === selectedImageIndex;

                  let imgStyle = { transform: 'scale(1)', transformOrigin: 'center', transitionDuration: '500ms' };

                  if (isActive && pinchScale > 1) {
                    // Pinch-zoomed state
                    imgStyle = {
                      transform: `scale(${pinchScale}) translate(${panOffset.x / pinchScale}px, ${panOffset.y / pinchScale}px)`,
                      transformOrigin: `${pinchOrigin.x}% ${pinchOrigin.y}%`,
                      transitionDuration: isPinching.current ? '0ms' : '200ms',
                    };
                  } else if (isActive && isZooming && !isDragging && !isOverArrow) {
                    // Desktop cursor-follow zoom (skips when hovering arrows)
                    imgStyle = {
                      transform: 'scale(1.22)',
                      transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                      transitionDuration: '300ms',
                    };
                  }

                  return (
                    <div
                      key={img.id || idx}
                      className="h-full overflow-hidden"
                      style={{ width: `${100 / imagesList.length}%`, flexShrink: 0 }}
                    >
                      <img 
                        src={getOptimizedUrl(img.url, 900, { aspect: '4:5' })} 
                        alt={product.name} 
                        draggable={false}
                        loading={isActive ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full h-full object-cover pointer-events-none transition-transform ease-out"
                        style={imgStyle}
                      />
                    </div>
                  );
                })}
              </div>

              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    onMouseEnter={() => setIsOverArrow(true)}
                    onMouseLeave={() => setIsOverArrow(false)}
                    className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-[#3a2e28] p-2 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    onMouseEnter={() => setIsOverArrow(true)}
                    onMouseLeave={() => setIsOverArrow(false)}
                    className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-[#3a2e28] p-2 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Next Image"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] px-2 py-0.5 tracking-widest uppercase font-mono transition-opacity duration-300">
                    {selectedImageIndex + 1} / {imagesList.length}
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imagesList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className="h-1.5 rounded-full transition-all duration-400 ease-out cursor-pointer"
                        style={{
                          width: idx === selectedImageIndex ? '18px' : '6px',
                          backgroundColor: idx === selectedImageIndex ? '#3a2e28' : 'rgba(58,46,40,0.35)',
                        }}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnails — 🌟 fix: padding added + overflow-y visible so active-scale doesn't clip */}
            {imagesList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto overflow-y-visible pb-1 pt-1 px-1 no-scrollbar scroll-smooth snap-x">
                {imagesList.map((img, idx) => {
                  const isActive = selectedImageIndex === idx;
                  return (
                    <button 
                      key={img.id || idx} 
                      ref={(el) => (thumbnailRefs.current[idx] = el)}
                      type="button"
                      onClick={() => goTo(idx)}
                      className="flex-shrink-0 w-16 h-16 border overflow-hidden bg-white transition-all duration-300 ease-out cursor-pointer snap-center"
                      style={{ 
                        borderColor: isActive ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)',
                        opacity: isActive ? 1 : 0.5,
                        borderWidth: isActive ? '2px' : '1px',
                        transform: isActive ? 'scale(1.06)' : 'scale(1)',
                        boxShadow: isActive ? '0 4px 14px rgba(58,46,40,0.18)' : 'none',
                      }}
                    >
                      <img 
                        src={getOptimizedUrl(img.url, 150, { aspect: '1:1' })} 
                        alt={`thumbnail-${idx}`} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

          </div>

          {/* --- RIGHT: Product Information --- */}
          <div
            className="flex flex-col space-y-6 lg:pt-2 transition-all duration-700 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '120ms',
            }}
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] opacity-60 font-semibold" style={{ color: '#3a2e28' }}>
                {product.category?.name || "General"}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-light tracking-wide mt-1 [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl font-semibold" style={{ color: '#3a2e28' }}>
                  Rs. {sellingPrice.toLocaleString()}
                </span>

                {hasDiscount && (
                  <>
                    <span className="text-sm text-gray-400 line-through font-medium">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-[#3a2e28] text-white font-bold px-2 py-0.5 uppercase tracking-wider">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              
              <div className="mt-4 inline-block transition-all duration-300">
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

            <p className="text-xs sm:text-sm font-light leading-relaxed opacity-80 whitespace-pre-line" style={{ color: '#3a2e28' }}>
              {product.description}
            </p>

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
                        className="px-4 py-2 text-xs font-medium border transition-all duration-250 ease-out cursor-pointer hover:scale-105 active:scale-95"
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
                        className="px-5 py-2 text-xs font-medium border transition-all duration-250 ease-out cursor-pointer hover:scale-105 active:scale-95"
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

            <div className="pt-4">
              <button 
                onClick={handleAddToCart}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                disabled={isOutOfStock || isAdding} 
                className="w-full py-4 uppercase tracking-[0.15em] text-xs font-semibold shadow-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#3a2e28]/80 disabled:cursor-not-allowed active:scale-[0.98]"
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