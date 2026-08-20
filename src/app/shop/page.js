'use client';
import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { getOptimizedUrl } from '@/lib/cloudinary';

// 🌟 SWR Fetcher Utility Function
const fetcher = (url) => fetch(url).then((res) => res.json());

// 🌟 ITEMS PER PAGE CONFIGURATION
const ITEMS_PER_PAGE = 12;

// 🌟 LUXURY SKELETON LOADERS
function SkeletonCard() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="w-full aspect-[4/5] bg-[#3a2e28]/5 rounded-none" />
      <div className="space-y-2 flex flex-col items-center pt-1">
        <div className="h-2 bg-[#3a2e28]/10 w-1/4 rounded-none" />
        <div className="h-2.5 bg-[#3a2e28]/10 w-2/3 rounded-none" />
        <div className="h-3 bg-[#3a2e28]/5 w-1/3 rounded-none mt-1" />
      </div>
    </div>
  );
}

function ShopSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-8 gap-y-12">
      {[...Array(8)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL parameter extraction
  const categoryFromUrl = searchParams.get('category');

  // --- Dynamic Cascade State Tracks ---
  const [selectedMain, setSelectedMain] = useState('All');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  
  // Sorting State
  const [sortOption, setSortOption] = useState('default');

  // 🌟 Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // 🌟 Mobile category row: fade-edge scroll affordance
  const mainCatScrollRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFadeState = () => {
    const el = mainCatScrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // 🌟 SWR DATA CACHING PIPELINE
  const { data: catData, isLoading: isCatLoading } = useSWR("/api/categories", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: prodData, isLoading: isProdLoading } = useSWR("/api/products", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  // Validated Collections
  const categories = useMemo(() => {
    if (Array.isArray(catData)) return catData;
    if (catData && Array.isArray(catData.categories)) return catData.categories;
    return [];
  }, [catData]);

  // 🌟 Fade edges + one-time "peek and settle" nudge for the mobile category row —
  // runs after `categories` is available since the row's content depends on it.
  useEffect(() => {
    const el = mainCatScrollRef.current;
    if (!el) return;

    updateFadeState();
    el.addEventListener('scroll', updateFadeState, { passive: true });
    window.addEventListener('resize', updateFadeState);

    const nudgeTimer = setTimeout(() => {
      if (!el || el.scrollWidth <= el.clientWidth) return; // nothing to scroll
      el.scrollTo({ left: 46, behavior: 'smooth' });
      setTimeout(() => {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      }, 500);
    }, 600);

    return () => {
      el.removeEventListener('scroll', updateFadeState);
      window.removeEventListener('resize', updateFadeState);
      clearTimeout(nudgeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  const products = useMemo(() => {
    if (Array.isArray(prodData)) return prodData;
    if (prodData && Array.isArray(prodData.products)) return prodData.products;
    return [];
  }, [prodData]);

  // Flattened Categories Tree Generator
  const allCategoriesFlat = useMemo(() => {
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
    return flatten(categories);
  }, [categories]);

  const loading = (isCatLoading && categories.length === 0) || (isProdLoading && products.length === 0);

  // 🔑 URL Dynamic Sync Pipeline
  useEffect(() => {
    if (categoryFromUrl && allCategoriesFlat.length > 0) {
      const currentCat = allCategoriesFlat.find(c => c.id === categoryFromUrl);
      if (currentCat) {
        if (!currentCat.parentId) {
          setSelectedMain(currentCat.id);
          setSelectedSub('');
          setSelectedChild('');
        } else {
          const parent = allCategoriesFlat.find(c => c.id === currentCat.parentId);
          if (parent && !parent.parentId) {
            setSelectedMain(parent.id);
            setSelectedSub(currentCat.id);
            setSelectedChild('');
          } else if (parent && parent.parentId) {
            setSelectedMain(parent.parentId);
            setSelectedSub(parent.id);
            setSelectedChild(currentCat.id);
          }
        }
      }
    } else if (!categoryFromUrl) {
      setSelectedMain('All');
      setSelectedSub('');
      setSelectedChild('');
    }
  }, [categoryFromUrl, allCategoriesFlat]);

  // 🌟 RESET PAGINATION ON FILTER / SORT CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMain, selectedSub, selectedChild, sortOption]);

  // --- Navigation & State Mutators ---
  const handleMainClick = (id) => {
    if (id === 'All') {
      router.push('/shop');
    } else {
      router.push(`/shop?category=${id}`);
    }
  };

  const handleSubClick = (id) => {
    if (id === '') {
      router.push(`/shop?category=${selectedMain}`);
    } else {
      router.push(`/shop?category=${id}`);
    }
  };

  const handleChildClick = (id) => {
    if (id === '') {
      router.push(`/shop?category=${selectedSub}`);
    } else {
      router.push(`/shop?category=${id}`);
    }
  };

  // --- Deep Tree Recursive Filtering Logic ---
  const getChildIdsRecursive = (catId, flatList) => {
    let ids = [catId];
    const children = flatList.filter(c => c.parentId === catId);
    children.forEach(child => {
      ids = [...ids, [...getChildIdsRecursive(child.id, flatList)]].flat();
    });
    return ids;
  };

  // STEP 1: Filter the products
  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const activeTargetId = selectedChild || selectedSub || selectedMain;
    if (activeTargetId === 'All') return true;

    const validCategoryScopeIds = getChildIdsRecursive(activeTargetId, allCategoriesFlat);
    return validCategoryScopeIds.includes(p.categoryId);
  });

  // STEP 2: Sort the filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-asc') {
      const priceA = a.variants?.length > 0 ? Number(a.variants[0].price) : 0;
      const priceB = b.variants?.length > 0 ? Number(b.variants[0].price) : 0;
      return priceA - priceB;
    }
    if (sortOption === 'price-desc') {
      const priceA = a.variants?.length > 0 ? Number(a.variants[0].price) : 0;
      const priceB = b.variants?.length > 0 ? Number(b.variants[0].price) : 0;
      return priceB - priceA;
    }
    if (sortOption === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  // 🌟 STEP 3: PAGINATION SLICING LOGIC
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const mainCategories = categories.filter(c => !c.parentId);
  const activeMainObj = mainCategories.find(c => c.id === selectedMain);
  const subCategoryOptions = activeMainObj?.children || [];
  
  const activeSubObj = subCategoryOptions.find(c => c.id === selectedSub);
  const childCategoryOptions = activeSubObj?.children || [];

  return (
    <main className="min-h-screen py-12 lg:py-16 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
            The <span className="italic">Entire</span> Collection
          </h1>
        </div>

        {/* --- Filters & Utility Bar --- */}
        <div className="flex flex-col pb-4 mb-12 gap-5 select-none">
          
          {/* Level 1: Main Categories */}
          <div className="relative w-full">
            <div
              ref={mainCatScrollRef}
              className="w-full overflow-x-auto lg:flex-wrap whitespace-nowrap scrollbar-none flex items-center gap-2 uppercase tracking-widest text-[9px] font-semibold pb-1 scroll-smooth snap-x"
            >
              <button
                onClick={() => handleMainClick('All')}
                className="px-5 py-2 border transition-all duration-200 cursor-pointer layout-btn inline-block shrink-0 snap-start rounded-none"
                style={{
                  backgroundColor: selectedMain === 'All' ? '#3a2e28' : 'transparent',
                  borderColor: selectedMain === 'All' ? '#3a2e28' : 'rgba(58, 46, 40, 0.15)',
                  color: selectedMain === 'All' ? '#ffffff' : '#3a2e28'
                }}
              >
                All
              </button>

              {mainCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleMainClick(cat.id)}
                  className="px-5 py-2 border transition-all duration-200 cursor-pointer layout-btn inline-block shrink-0 snap-start rounded-none"
                  style={{
                    backgroundColor: selectedMain === cat.id ? '#3a2e28' : 'transparent',
                    borderColor: selectedMain === cat.id ? '#3a2e28' : 'rgba(58, 46, 40, 0.15)',
                    color: selectedMain === cat.id ? '#ffffff' : '#3a2e28'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* 🌟 Edge fades — signal "more categories this way" without arrows, mobile-only */}
            <div
              className="pointer-events-none absolute top-0 left-0 h-full w-8 lg:hidden transition-opacity duration-300"
              style={{
                opacity: showLeftFade ? 1 : 0,
                background: 'linear-gradient(to right, #f5f3ed, transparent)',
              }}
            />
            <div
              className="pointer-events-none absolute top-0 right-0 h-full w-10 lg:hidden transition-opacity duration-300"
              style={{
                opacity: showRightFade ? 1 : 0,
                background: 'linear-gradient(to left, #f5f3ed, transparent)',
              }}
            />
          </div>

          {/* Level 2: Sub Categories */}
          {selectedMain !== 'All' && subCategoryOptions.length > 0 && (
            <div className="w-full pt-2 border-t border-dashed border-black/5">
              <div className="w-full overflow-x-auto lg:flex-wrap whitespace-nowrap scrollbar-none flex items-center gap-2 uppercase tracking-widest text-[9px] font-semibold pb-1 scroll-smooth snap-x">
                <button
                  onClick={() => handleSubClick('')}
                  className="px-4 py-1.5 border transition-all duration-200 cursor-pointer inline-block shrink-0 snap-start rounded-none"
                  style={{
                    backgroundColor: selectedSub === '' ? '#3a2e28' : 'transparent',
                    borderColor: selectedSub === '' ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)',
                    color: selectedSub === '' ? '#ffffff' : '#3a2e28'
                  }}
                >
                  All {activeMainObj?.name}
                </button>
                {subCategoryOptions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubClick(sub.id)}
                    className="px-4 py-1.5 border transition-all duration-200 cursor-pointer inline-block shrink-0 snap-start rounded-none"
                    style={{
                      backgroundColor: selectedSub === sub.id ? '#3a2e28' : 'transparent',
                      borderColor: selectedSub === sub.id ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)',
                      color: selectedSub === sub.id ? '#ffffff' : '#3a2e28'
                    }}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Level 3: Deepest Child Categories */}
          {selectedSub !== '' && childCategoryOptions.length > 0 && (
            <div className="w-full pt-1">
              <div className="w-full overflow-x-auto lg:flex-wrap whitespace-nowrap scrollbar-none flex items-center gap-5 uppercase tracking-widest text-[9px] font-semibold pb-1 scroll-smooth snap-x">
                <button
                  onClick={() => handleChildClick('')}
                  className="py-1 transition-all duration-200 cursor-pointer inline-block shrink-0 snap-start"
                  style={{
                    color: '#3a2e28',
                    opacity: selectedChild === '' ? 1 : 0.5,
                    borderBottom: selectedChild === '' ? '1px solid #3a2e28' : '1px solid transparent'
                  }}
                >
                  All {activeSubObj?.name}
                </button>
                {childCategoryOptions.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleChildClick(child.id)}
                    className="py-1 transition-all duration-200 cursor-pointer inline-block shrink-0 snap-start"
                    style={{
                      color: '#3a2e28',
                      opacity: selectedChild === child.id ? 1 : 0.5,
                      borderBottom: selectedChild === child.id ? '1px solid #3a2e28' : '1px solid transparent'
                    }}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Items Count & Sort Dropdown */}
          <div className="flex items-center justify-between w-full mt-4 pt-4" style={{ borderTop: '1px solid rgba(58, 46, 40, 0.08)' }}>
            
            {/* Left side: Item Count */}
            <div className="text-[10px] uppercase tracking-widest opacity-70 flex items-center gap-1 shrink-0" style={{ color: '#3a2e28' }}>
              Showing {sortedProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)} of {sortedProducts.length} Items
            </div>
            
            {/* Right side: Functional Sort Dropdown */}
            <div className="relative flex items-center gap-2 text-[10px] uppercase tracking-widest bg-transparent" style={{ color: '#3a2e28' }}>
              <SlidersHorizontal size={12} className="opacity-70" />
              
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity appearance-none pr-4 pl-1 z-10"
                style={{ color: '#3a2e28' }}
              >
                <option value="default">Sort By</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetically: A-Z</option>
                <option value="name-desc">Alphabetically: Z-A</option>
              </select>
              
              <div className="absolute right-0 pointer-events-none opacity-70 z-0">
                <ChevronDown size={12} />
              </div>
            </div>

          </div>
        </div>

        {/* --- Products Grid with Shimmer Loader State Sync --- */}
        {loading ? (
          <ShopSkeletonGrid />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-8 gap-y-12">
              {paginatedProducts?.map((product) => {
                const baseVariant = product.variants?.[0];
                const price = baseVariant?.price ? Number(baseVariant.price) : 0;
                const originalPrice = baseVariant?.originalPrice ? Number(baseVariant.originalPrice) : null;
                const hasDiscount = originalPrice && originalPrice > price;
                const discountPercent = hasDiscount 
                  ? Math.round(((originalPrice - price) / originalPrice) * 100) 
                  : 0;

                return (
                  <div key={product.id} className="group flex flex-col relative">
                    
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-white/40 shadow-2xs border border-transparent group-hover:border-black/5 transition-all duration-300 rounded-none">
                      
                      <Link href={`/shop/${product.id}`} className="block w-full h-full cursor-pointer">
                        <img 
                          src={getOptimizedUrl(product.images?.[0]?.url, 500, { aspect: '4:5' }) || '/placeholder.jpg'} 
                          alt={product.name} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                        />
                      </Link>
                      
                      {/* 🏷️ Theme-matched discount badge — gentle bell-swing every ~3s to grab attention */}
                      {hasDiscount && (
                        <motion.div
                          className="absolute top-2.5 left-2.5 z-10 text-white text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest shadow-md origin-top"
                          style={{ backgroundColor: '#3a2e28' }}
                          animate={{ rotate: [0, -10, 8, -6, 4, 0] }}
                          transition={{
                            duration: 0.8,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatDelay: 2.4,
                          }}
                        >
                          {discountPercent}% OFF
                        </motion.div>
                      )}

                      <div className="absolute inset-0 pointer-events-none bg-[#3a2e28]/10 backdrop-blur-[1px] flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex">
                        <Link 
                          href={`/shop/${product.id}`} 
                          className="w-full text-white py-3 uppercase tracking-widest text-[9px] font-semibold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity rounded-none pointer-events-auto"
                          style={{ backgroundColor: '#3a2e28' }}
                        >
                          <ShoppingBag size={12} /> View Item
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="text-[8px] uppercase tracking-widest opacity-60 font-medium" style={{ color: '#3a2e28' }}>
                        {allCategoriesFlat.find(c => c.id === product.categoryId)?.name || "Fine Jewelry"}
                      </span>
                      
                      <Link href={`/shop/${product.id}`} className="block cursor-pointer">
                        <h3 className="text-[11px] lg:text-xs font-light tracking-wide mt-1 hover:text-[#DB93B0] transition-colors duration-200 line-clamp-1" style={{ color: '#3a2e28' }}>
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* 🏷️ Price & High Contrast Strikethrough Display */}
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs lg:text-sm font-semibold" style={{ color: '#3a2e28' }}>
                          Rs. {price.toLocaleString()}
                        </span>

                        {hasDiscount && (
                          <span className="text-[10px] lg:text-xs text-gray-400 line-through font-medium">
                            Rs. {originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* 🌟 LUXURY PAGINATION BAR */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 pt-8 border-t border-[#3a2e28]/10 select-none">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-[#3a2e28]/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a2e28] hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#3a2e28] text-white border border-[#3a2e28]'
                          : 'bg-transparent text-[#3a2e28] border border-[#3a2e28]/20 hover:border-[#3a2e28]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-[#3a2e28]/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a2e28] hover:text-white transition-colors cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-32" style={{ backgroundColor: '#f5f3ed' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ShopSkeletonGrid />
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}