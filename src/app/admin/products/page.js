'use client';
import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit2, Trash2, X, Trash, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(''); 
  const [images, setImages] = useState([{ url: '' }]);
  const [isFeatured, setIsFeatured] = useState(false);

  // Nested Level State Tracking
  const [selectedMainId, setSelectedMainId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  
  const createEmptyVariant = () => ({
    feId: `fe-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
    id: undefined, 
    size: '',
    price: '',
    stock: ''
  });

  const [variants, setVariants] = useState([createEmptyVariant()]);

  const initDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories') 
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
      } else {
        toast.error("Failed to sync catalogue items.");
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
      }
    } catch (error) {
      console.error("Dashboard architecture sync error:", error);
      toast.error("Network synchronization pipeline error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDashboardData();
  }, []);

  const findCategoryPath = (targetId, currentCategories, path = []) => {
    for (const cat of currentCategories) {
      if (cat.id === targetId) return [...path, cat];
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryPath(targetId, cat.children, [...path, cat]);
        if (found) return found;
      }
    }
    return null;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId('');
    setSelectedMainId('');
    setSelectedSubId('');
    setSelectedChildId('');
    setImages([{ url: '' }]);
    setVariants([createEmptyVariant()]);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setImages(product.images && product.images.length > 0 ? product.images.map(img => ({ url: img.url })) : [{ url: '' }]);
    setIsFeatured(product.isFeatured || false);
    
    if (product.categoryId && categories.length > 0) {
      const path = findCategoryPath(product.categoryId, categories);
      if (path && path.length === 1) {
        setSelectedMainId(path[0].id);
        setSelectedSubId('');
        setSelectedChildId('');
        setCategoryId(path[0].id);
      } else if (path && path.length === 2) {
        setSelectedMainId(path[0].id);
        setSelectedSubId(path[1].id);
        setSelectedChildId('');
        setCategoryId(path[1].id);
      } else if (path && path.length === 3) {
        setSelectedMainId(path[0].id);
        setSelectedSubId(path[1].id);
        setSelectedChildId(path[2].id);
        setCategoryId(path[2].id);
      }
    } else {
      setSelectedMainId('');
      setSelectedSubId('');
      setSelectedChildId('');
      setCategoryId('');
    }

    setVariants(
      product.variants && product.variants.length > 0 
        ? product.variants.map(v => ({ 
            feId: `fe-${v.id || Math.random().toString(36).substr(2, 9)}`,
            id: v.id, 
            size: v.size, 
            price: v.price.toString(), 
            stock: v.stock.toString() 
          })) 
        : [createEmptyVariant()]
    );
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId('');
    setSelectedMainId('');
    setSelectedSubId('');
    setSelectedChildId('');
    setImages([{ url: '' }]);
    setVariants([createEmptyVariant()]);
    setIsFeatured(false);
  };

  const handleMainCategoryChange = (id) => {
    setSelectedMainId(id);
    setSelectedSubId('');
    setSelectedChildId('');
    setCategoryId(id || ''); 
  };

  const handleSubCategoryChange = (id) => {
    setSelectedSubId(id);
    setSelectedChildId('');
    setCategoryId(id || selectedMainId);
  };

  const handleChildCategoryChange = (id) => {
    setSelectedChildId(id);
    setCategoryId(id || selectedSubId);
  };

  const addVariantField = () => setVariants([...variants, createEmptyVariant()]);
  const removeVariantField = (feIdToRemove) => setVariants(variants.filter((v) => v.feId !== feIdToRemove));
  const updateVariant = (feId, field, value) => {
    setVariants(prev => prev.map(v => v.feId === feId ? { ...v, [field]: value } : v));
  };

  const addImageField = () => setImages([...images, { url: '' }]);
  const removeImageField = (index) => setImages(images.filter((_, i) => i !== index));
  const updateImage = (index, value) => {
    const updated = [...images];
    updated[index].url = value;
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!name || !description) {
      toast.error("Please fill in all core fields.");
      return;
    }

    const filteredImages = images.filter(img => img.url && img.url.trim() !== '');
    const filteredVariants = variants
      .filter(v => v.size && v.price && v.stock)
      .map(v => ({
        id: v.id || undefined, 
        size: String(v.size),
        price: Number(v.price),
        stock: Number(v.stock)
      }));

    if (filteredVariants.length === 0) {
      toast.error("At least one valid size variant configuration is required.");
      return;
    }

    const payload = {
      name,
      description,
      categoryId: categoryId || null, 
      images: filteredImages,
      variants: filteredVariants,
      isFeatured: Boolean(isFeatured)
    };

    setIsSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await res.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (res.ok) {
        toast.success(editingProduct ? "Product updated successfully!" : "New product created successfully!");
        closeFormModal();
        initDashboardData(); 
      } else {
        toast.error(data.message || "Failed to save configurations inside Prisma context.");
      }
    } catch (error) {
      console.error("FATAL ERROR TRACE:", error);
      toast.error(`Relational crash: ${error.message || 'Check terminal server log'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to remove this product? It will affect live availability.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        toast.success("Product removed successfully!");
        initDashboardData(); 
      } else {
        toast.error("Delete operation failed.");
      }
    } catch (error) {
      console.error("Frontend HTTP connection crash:", error);
      toast.error("Something went wrong with the request pipeline.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    !p.name?.includes('__ARCHIVED') && 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMainCategory = categories.find(c => c.id === selectedMainId);
  const subCategoryOptions = activeMainCategory?.children || [];
  const activeSubCategory = subCategoryOptions.find(c => c.id === selectedSubId);
  const childCategoryOptions = activeSubCategory?.children || [];

  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const cardEntranceVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.25 } },
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 [font-family:'Plus_Jakarta_Sans',sans-serif] bg-[#FAF9F6] min-h-screen text-[#2D2524]">
      
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-5 sm:pb-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Product Catalogue
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage luxury stock dynamics, bespoke sizes, and price matrices.</p>
        </div>
        
        <motion.button 
          type="button"
          onClick={openAddModal}
          whileHover={{ scale: 1.03, y: -2, boxShadow: '0 12px 24px -8px rgba(45,37,36,0.4)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2D2524] hover:bg-[#4A3E3D] text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Add New Product
        </motion.button>
      </motion.div>

      {/* SEARCH AND BAR COUNTER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center bg-white p-3.5 sm:p-4 border border-gray-100 shadow-xs"
      >
        <div className="w-full sm:max-w-md relative">
          <input 
            type="text" 
            placeholder="Search product configurations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 px-4 py-2.5 text-xs focus:border-[#DB93B0] focus:outline-none focus:ring-2 focus:ring-[#DB93B0]/15 transition-all duration-300 bg-gray-50/30"
          />
        </div>
        <div className="text-xs text-gray-400 font-medium whitespace-nowrap self-end sm:self-auto">
          Total Vault Items:{' '}
          <motion.span
            key={filteredProducts.length}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-[#2D2524] font-bold inline-block"
          >
            {filteredProducts.length}
          </motion.span>
        </div>
      </motion.div>

      {/* PRODUCT LIST GRID */}
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 p-4 sm:p-5 flex flex-row gap-4 sm:gap-5 items-start shadow-xs relative overflow-hidden">
              <div className="w-20 h-24 bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-3.5 w-2/3 bg-gray-100" />
                <div className="h-2.5 w-full bg-gray-100" />
                <div className="h-2.5 w-4/5 bg-gray-100" />
                <div className="flex gap-2 pt-1">
                  <div className="h-6 w-16 bg-gray-100" />
                  <div className="h-6 w-16 bg-gray-100" />
                </div>
              </div>
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(219,147,176,0.14) 50%, transparent 100%)',
                  width: '60%',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '220%' }}
                transition={{ duration: 1.4, ease: 'linear', repeat: Infinity, delay: i * 0.15 }}
              />
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="col-span-full p-12 sm:p-16 text-center text-xs text-gray-400 bg-white border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-3"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
            >
              <Package size={32} strokeWidth={1} className="text-gray-300" />
            </motion.div>
            <p>No architecture entries found. Click "Add New Product" to initialize.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((prod) => {
              const totalStock = prod.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
              const sizeList = prod.variants?.map(v => v.size).join(', ') || 'N/A';
              const basePrice = prod.variants?.[0]?.price || 0;
              const isLowStock = totalStock <= 5;
              const isDeleting = deletingId === prod.id;

              return (
                <motion.div
                  key={prod.id}
                  layout
                  variants={cardEntranceVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ y: -4, boxShadow: '0 16px 32px -12px rgba(45,37,36,0.15)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="bg-white border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start shadow-xs hover:border-[#DB93B0]/40 group relative"
                  style={{ opacity: isDeleting ? 0.5 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}
                >
                  {/* Image & Main Flex wrapper */}
                  <div className="flex flex-row gap-4 items-start w-full min-w-0">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 bg-[#FAF9F6] flex-shrink-0 border border-gray-100 overflow-hidden relative">
                      {prod.images?.[0]?.url ? (
                        <motion.img
                          src={prod.images[0].url}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.12 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                          <Package size={24} strokeWidth={1} />
                        </div>
                      )}
                      {prod.isFeatured && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="absolute top-1 left-1 bg-[#2D2524] text-white p-1 rounded-none shadow-sm flex items-center justify-center"
                        >
                          <Star size={8} fill="currentColor" />
                        </motion.div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <h4 className="text-sm font-semibold text-[#2D2524] truncate group-hover:text-[#DB93B0] transition-colors duration-200">
                            {prod.name}
                          </h4>
                          {prod.isFeatured && (
                            <span className="text-[8px] bg-[#DB93B0]/10 text-[#DB93B0] px-1.5 py-0.5 tracking-wider uppercase font-semibold whitespace-nowrap">
                              Best Seller
                            </span>
                          )}
                        </div>

                        {/* Top-Right Action Buttons for Mobile View */}
                        <div className="flex sm:hidden items-center gap-1 flex-shrink-0">
                          <button 
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 border border-gray-100 text-gray-400 bg-white hover:border-[#DB93B0] hover:text-[#DB93B0]"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            disabled={isDeleting}
                            className="p-1.5 border border-gray-100 text-gray-400 bg-white hover:border-red-500 hover:text-red-500"
                          >
                            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-2 h-8 leading-relaxed">
                        {prod.description || 'No description added'}
                      </p>
                      
                      {/* Responsive Badges */}
                      <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-medium tracking-wide">
                        <span className="px-2.5 py-1 bg-[#FAF9F6] border border-gray-200/60 text-gray-600">Sizes: {sizeList}</span>
                        <span className="px-2.5 py-1 bg-[#FAF9F6] border border-gray-200/60 text-[#2D2524] font-semibold">Rs. {Number(basePrice).toLocaleString()}</span>
                        <motion.span
                          animate={isLowStock ? { opacity: [1, 0.55, 1] } : {}}
                          transition={isLowStock ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
                          className={`px-2.5 py-1 border rounded-none ${isLowStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}
                        >
                          Stock: {totalStock}
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="hidden sm:flex items-center gap-2 self-start ml-auto">
                    <motion.button 
                      type="button"
                      onClick={() => openEditModal(prod)}
                      whileHover={{ scale: 1.1, rotate: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 border border-gray-100 text-gray-400 bg-white hover:border-[#DB93B0] hover:text-[#DB93B0] transition-colors duration-200"
                    >
                      <Edit2 size={13} />
                    </motion.button>
                    <motion.button 
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id)}
                      whileHover={{ scale: 1.1, rotate: 4 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={isDeleting}
                      className="p-2 border border-gray-100 text-gray-400 bg-white hover:border-red-500 hover:text-red-500 transition-colors duration-200"
                    >
                      {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </motion.button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* FORM DRAWER */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeFormModal}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
          >
            <motion.form
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="w-full sm:max-w-xl bg-white h-full shadow-2xl flex flex-col"
            >
              
              <div className="flex justify-between items-center border-b border-gray-100 p-4 sm:p-6 bg-[#FAF9F6]">
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#2D2524]">
                    {editingProduct ? 'Modify Product Structure' : 'Create Architecture Entry'}
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Specify precise asset metrics for live publication.</p>
                </div>
                <motion.button
                  type="button"
                  onClick={closeFormModal}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-200/50 rounded-full"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 text-xs text-[#2D2524]">
                
                {/* Core Info */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Product Title *</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g., Signature Boxy Fit Hoodie"
                      className="w-full border border-gray-200 p-3 text-xs outline-none focus:border-[#DB93B0] focus:ring-2 focus:ring-[#DB93B0]/15 transition-all duration-300 bg-gray-50/20"
                      required
                    />
                  </div>

                  {/* CASCADE SELECT SYSTEM BLOCK */}
                  <div className="space-y-4 border p-3.5 sm:p-4 bg-gray-50/30 border-gray-200/70">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-[#DB93B0]">Category Architecture Linkage</span>
                    
                    {/* Dropdown 1: Main Categories */}
                    <div className="space-y-1.5 mt-2">
                      <label className="text-[10px] uppercase font-medium text-gray-400">Main Category *</label>
                      <select 
                        value={selectedMainId} 
                        onChange={(e) => handleMainCategoryChange(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-xs outline-none focus:border-[#DB93B0] bg-white cursor-pointer"
                      >
                        <option value="">Select Main Category</option>
                        {categories.filter(c => !c.parentId).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dropdown 2: Dynamic Sub Categories */}
                    <AnimatePresence>
                      {subCategoryOptions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <label className="text-[10px] uppercase font-medium text-gray-400">Sub Category *</label>
                          <select 
                            value={selectedSubId} 
                            onChange={(e) => handleSubCategoryChange(e.target.value)}
                            className="w-full border border-gray-200 p-3 text-xs outline-none focus:border-[#DB93B0] bg-white cursor-pointer"
                          >
                            <option value="">Select Sub Category</option>
                            {subCategoryOptions.map((sub) => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Dropdown 3: Deepest Nested Children Map */}
                    <AnimatePresence>
                      {childCategoryOptions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          <label className="text-[10px] uppercase font-medium text-gray-400">Nested Type Specifics *</label>
                          <select 
                            value={selectedChildId} 
                            onChange={(e) => handleChildCategoryChange(e.target.value)}
                            className="w-full border border-gray-200 p-3 text-xs outline-none focus:border-[#DB93B0] bg-white cursor-pointer"
                          >
                            <option value="">Select Deep Classification</option>
                            {childCategoryOptions.map((child) => (
                              <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Detailed Description *</label>
                    <textarea 
                      rows={4}
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Describe aesthetics, material blend, specifications..."
                      className="w-full border border-gray-200 p-3 text-xs outline-none focus:border-[#DB93B0] focus:ring-2 focus:ring-[#DB93B0]/15 transition-all duration-300 resize-none bg-gray-50/20 leading-relaxed"
                      required
                    />
                  </div>

                  {/* BEST SELLER CHECKBOX SELECTION BLOCK */}
                  <motion.div
                    animate={{
                      borderColor: isFeatured ? 'rgba(219,147,176,0.6)' : 'rgba(229,231,235,0.6)',
                      backgroundColor: isFeatured ? 'rgba(219,147,176,0.06)' : '#FAF9F6',
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start sm:items-center gap-3 border p-3.5 sm:p-4"
                  >
                    <input 
                      type="checkbox" 
                      id="isFeatured" 
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 mt-0.5 sm:mt-0 accent-[#2D2524] cursor-pointer"
                    />
                    <label htmlFor="isFeatured" className="flex flex-col cursor-pointer select-none">
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-[#2D2524]">
                        Feature on Landing Page Grid
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                        Marking this sets the configuration inside the premium slider loop under "Our Best Sellers".
                      </span>
                    </label>
                  </motion.div>
                </div>

                {/* Images Block */}
                <div className="space-y-3 border-t border-gray-100 pt-5">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Image Asset Endpoints</label>
                    <motion.button
                      type="button"
                      onClick={addImageField}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[10px] text-[#DB93B0] font-bold flex items-center gap-1 hover:text-[#b87490] cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={2.5} /> Add URL Field
                    </motion.button>
                  </div>
                  
                  <div className="space-y-2">
                    <AnimatePresence>
                      {images.map((img, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-2 items-center"
                        >
                          <input 
                            type="url" 
                            value={img.url} 
                            onChange={(e) => updateImage(index, e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full border border-gray-200 p-2.5 text-xs outline-none focus:border-[#DB93B0] bg-gray-50/20"
                          />
                          {images.length > 1 && (
                            <motion.button
                              type="button"
                              onClick={() => removeImageField(index)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2.5 text-red-400 border border-gray-200 hover:border-red-200 hover:bg-red-50/50 cursor-pointer"
                            >
                              <Trash size={14} />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Variant Matrix */}
                <div className="space-y-3 border-t border-gray-100 pt-5">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Stock Variant Matrix *</label>
                    <motion.button
                      type="button"
                      onClick={addVariantField}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[10px] text-[#DB93B0] font-bold flex items-center gap-1 hover:text-[#b87490] cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={2.5} /> Add Variant Row
                    </motion.button>
                  </div>
                  
                  <div className="space-y-2">
                    <AnimatePresence>
                      {variants.map((v) => (
                        <motion.div
                          key={v.feId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-wrap sm:flex-nowrap gap-2 bg-[#FAF9F6] p-2.5 sm:p-3 border border-gray-200/60 items-center"
                        >
                          <div className="w-[30%] sm:w-1/4">
                            <input 
                              type="text" 
                              placeholder="Size" 
                              value={v.size}
                              onChange={(e) => updateVariant(v.feId, 'size', e.target.value)}
                              className="w-full border border-gray-200 p-2 bg-white outline-none focus:border-[#DB93B0] text-center"
                              required
                            />
                          </div>
                          <div className="w-[36%] sm:w-3/8">
                            <input 
                              type="number" 
                              placeholder="Price" 
                              value={v.price}
                              onChange={(e) => updateVariant(v.feId, 'price', e.target.value)}
                              className="w-full border border-gray-200 p-2 bg-white outline-none focus:border-[#DB93B0]"
                              required
                            />
                          </div>
                          <div className="w-[22%] sm:w-1/4">
                            <input 
                              type="number" 
                              placeholder="Stock" 
                              value={v.stock}
                              onChange={(e) => updateVariant(v.feId, 'stock', e.target.value)}
                              className="w-full border border-gray-200 p-2 bg-white outline-none focus:border-[#DB93B0]"
                              required
                            />
                          </div>
                          <div className="w-[5%] sm:w-[10%] flex justify-center ml-auto">
                            {variants.length > 1 && (
                              <motion.button 
                                type="button" 
                                onClick={() => removeVariantField(v.feId)} 
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                              >
                                <Trash size={14} />
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* Footer buttons */}
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-[#FAF9F6] flex gap-3 sm:gap-4">
                <motion.button 
                  type="button" 
                  onClick={closeFormModal} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-1/2 border border-gray-300 p-3 uppercase tracking-widest font-semibold text-gray-500 hover:bg-gray-100 bg-white text-[10px] cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-1/2 bg-[#2D2524] hover:bg-[#4A3E3D] text-white p-3 uppercase tracking-widest font-semibold text-[10px] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? 'Save Variant Setup' : 'Publish Asset'
                  )}
                </motion.button>
              </div>

            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}