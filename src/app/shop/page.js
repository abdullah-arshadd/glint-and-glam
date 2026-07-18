'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// 🌟 Added ChevronDown for the dropdown UI
import { SlidersHorizontal, ShoppingBag, ChevronDown } from 'lucide-react';

// 🌟 LUXURY SKELETON LOADERS: Flat structural layout matching the theme guidelines
function SkeletonCard() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Product Image Box Placeholder (Sharp corners, flat design) */}
      <div className="w-full aspect-[4/5] bg-[#3a2e28]/5 rounded-none" />
      
      {/* Product Info Lines Placeholder */}
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

  const [categories, setCategories] = useState([]);
  const [allCategoriesFlat, setAllCategoriesFlat] = useState([]); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Dynamic Cascade State Tracks ---
  const [selectedMain, setSelectedMain] = useState('All');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  
  // 🌟 NEW: Sorting State
  const [sortOption, setSortOption] = useState('default');

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

  // --- Core API Data Synchronization Pipeline ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products")
        ]);
        
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        
        const validatedCategories = Array.isArray(catData) 
          ? catData 
          : (catData && Array.isArray(catData.categories) ? catData.categories : []);
          
        const validatedProducts = Array.isArray(prodData) 
          ? prodData 
          : (prodData && Array.isArray(prodData.products) ? prodData.products : []);

        setCategories(validatedCategories);
        setProducts(validatedProducts);

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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  // 🌟 STEP 1: Filter the products
  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const activeTargetId = selectedChild || selectedSub || selectedMain;
    if (activeTargetId === 'All') return true;

    const validCategoryScopeIds = getChildIdsRecursive(activeTargetId, allCategoriesFlat);
    return validCategoryScopeIds.includes(p.categoryId);
  });

  // 🌟 STEP 2: Sort the filtered products based on the selected option
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
    return 0; // Default order
  });

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
          <div className="w-full overflow-x-auto lg:flex-wrap whitespace-nowrap scrollbar-none flex items-center gap-2 uppercase tracking-widest text-[9px] font-semibold pb-1 scroll-smooth snap-x">
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

          {/* 🌟 REPLACED: Active Items Count & Sort Dropdown */}
          <div className="flex items-center justify-between w-full mt-4 pt-4" style={{ borderTop: '1px solid rgba(58, 46, 40, 0.08)' }}>
            
            {/* Left side: Item Count */}
            <div className="text-[10px] uppercase tracking-widest opacity-70 flex items-center gap-1 shrink-0" style={{ color: '#3a2e28' }}>
              {sortedProducts?.length || 0} Items
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
              
              {/* Custom dropdown arrow for seamless luxury UI */}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-8 gap-y-12">
            {/* 🌟 UPDATED: Mapping sortedProducts instead of filteredProducts */}
            {sortedProducts?.map((product) => (
              <div key={product.id} className="group flex flex-col relative">
                
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-white/40 shadow-2xs border border-transparent group-hover:border-black/5 transition-all duration-300 rounded-none">
                  <img 
                    src={product.images?.[0]?.url || '/placeholder.jpg'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                  />
                  
                  <div className="absolute inset-0 bg-[#3a2e28]/10 backdrop-blur-[1px] flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link 
                      href={`/shop/${product.id}`} 
                      className="w-full text-white py-3 uppercase tracking-widest text-[9px] font-semibold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity rounded-none"
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
                  <h3 className="text-[11px] lg:text-xs font-light tracking-wide mt-1" style={{ color: '#3a2e28' }}>
                    {product.name}
                  </h3>
                  <p className="text-xs lg:text-sm font-semibold mt-1" style={{ color: '#3a2e28' }}>
                    Rs. {product.variants?.length > 0 ? Number(product.variants[0].price).toLocaleString() : "N/A"}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    // 🌟 Next.js dynamic chunks fallback optimization using the same custom skeleton structure
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