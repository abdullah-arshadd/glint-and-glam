'use client';
import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit2, Trash2, X, Trash } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Will hold the hierarchical tree from API
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states matching Prisma schema relations
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(''); 
  const [images, setImages] = useState([{ url: '' }]);

  // 🔑 NESTED LEVEL STATE TRACKING
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
      // 🔑 FIXED: Changed loading(false) to setLoading(false)
      setLoading(false);
    }
  };

  useEffect(() => {
    initDashboardData();
  }, []);

  // Helper to reverse track parent IDs when editing a product
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
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setImages(product.images && product.images.length > 0 ? product.images.map(img => ({ url: img.url })) : [{ url: '' }]);
    
    // Reverse trace category dynamic hierarchy paths
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
  };

  // Dynamic state handler updates
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
      variants: filteredVariants
    };

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
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to remove this product? It will affect live availability.")) return;
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
    }
  };

  const filteredProducts = products.filter(p => 
    !p.name?.includes('__ARCHIVED') && 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute active arrays for dynamic nested options
  const activeMainCategory = categories.find(c => c.id === selectedMainId);
  const subCategoryOptions = activeMainCategory?.children || [];
  const activeSubCategory = subCategoryOptions.find(c => c.id === selectedSubId);
  const childCategoryOptions = activeSubCategory?.children || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 [font-family:'Plus_Jakarta_Sans',sans-serif] bg-[#FAF9F6] min-h-screen text-[#2D2524]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-3xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Product Catalogue
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage luxury stock dynamics, bespoke sizes, and price matrices.</p>
        </div>
        
        <button 
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-[#2D2524] hover:bg-[#4A3E3D] text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold transition-all duration-200 shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* SEARCH AND BAR COUNTER */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-gray-100 shadow-xs">
        <div className="w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search product configurations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 px-4 py-2.5 text-xs focus:border-[#DB93B0] focus:outline-none transition-all bg-gray-50/30"
          />
        </div>
        <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
          Total Vault Items: <span className="text-[#2D2524] font-bold">{filteredProducts.length}</span>
        </div>
      </div>

      {/* PRODUCT LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full p-16 text-center text-xs text-gray-400 tracking-wider bg-white border border-gray-100">Loading dynamic configurations...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full p-16 text-center text-xs text-gray-400 bg-white border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-3">
            <Package size={32} strokeWidth={1} className="text-gray-300" />
            <p>No architecture entries found. Click "Add New Product" to initialize.</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const totalStock = prod.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
            const sizeList = prod.variants?.map(v => v.size).join(', ') || 'N/A';
            const basePrice = prod.variants?.[0]?.price || 0;

            return (
              <div key={prod.id} className="bg-white border border-gray-100 p-5 flex gap-5 items-start shadow-xs hover:border-[#DB93B0]/40 transition-all duration-300 group relative">
                
                <div className="w-20 h-24 bg-[#FAF9F6] flex-shrink-0 border border-gray-100 overflow-hidden relative">
                  {prod.images?.[0]?.url ? (
                    <img src={prod.images[0].url} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                      <Package size={24} strokeWidth={1} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 min-w-0 pr-20">
                  <h4 className="text-sm font-semibold text-[#2D2524] truncate group-hover:text-[#DB93B0] transition-colors duration-200">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 h-8 leading-relaxed">{prod.description || 'No description added'}</p>
                  
                  <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-medium tracking-wide">
                    <span className="px-3 py-1.5 bg-[#FAF9F6] border border-gray-200/60 text-gray-600">Sizes: {sizeList}</span>
                    <span className="px-3 py-1.5 bg-[#FAF9F6] border border-gray-200/60 text-[#2D2524] font-semibold">Rs. {Number(basePrice).toLocaleString()}</span>
                    <span className={`px-3 py-1.5 border rounded-none ${totalStock <= 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                      Stock: {totalStock}
                    </span>
                  </div>
                </div>

                <div className="absolute right-4 top-5 flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => openEditModal(prod)}
                    className="p-2 border border-gray-100 text-gray-400 bg-white hover:border-[#DB93B0] hover:text-[#DB93B0] transition-all duration-200"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 border border-gray-100 text-gray-400 bg-white hover:border-red-500 hover:text-red-500 transition-all duration-200"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* FORM DRAWER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            
            <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-[#FAF9F6]">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[#2D2524]">
                  {editingProduct ? 'Modify Product Structure' : 'Create Architecture Entry'}
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Specify precise asset metrics for live publication.</p>
              </div>
              <button type="button" onClick={closeFormModal} className="p-2 text-gray-400 hover:text-black hover:bg-gray-200/50 transition-colors rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#2D2524]">
              
              {/* Core Info */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Product Title *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g., Signature Boxy Fit Hoodie"
                    className="w-full border border-gray-200 p-3 text-xs outline-none focus:border-[#DB93B0] bg-gray-50/20"
                    required
                  />
                </div>

                {/* CASCADE SELECT SYSTEM BLOCK */}
                <div className="space-y-4 border p-4 bg-gray-50/30 border-gray-200/70">
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
                  {subCategoryOptions.length > 0 && (
                    <div className="space-y-1.5 animate-fade-in">
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
                    </div>
                  )}

                  {/* Dropdown 3: Deepest Nested Children Map */}
                  {childCategoryOptions.length > 0 && (
                    <div className="space-y-1.5 animate-fade-in">
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
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Detailed Description *</label>
                  <textarea 
                    rows={4}
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Describe aesthetics, material blend, specifications..."
                    className="w-full border border-gray-200 p-3 text-xs outline-none focus:border-[#DB93B0] resize-none bg-gray-50/20 leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Images Block */}
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Image Asset Endpoints</label>
                  <button type="button" onClick={addImageField} className="text-[10px] text-[#DB93B0] font-bold flex items-center gap-1 hover:text-[#b87490] transition-colors cursor-pointer">
                    <Plus size={12} strokeWidth={2.5} /> Add URL Field
                  </button>
                </div>
                
                <div className="space-y-2">
                  {images.map((img, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        type="url" 
                        value={img.url} 
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full border border-gray-200 p-2.5 text-xs outline-none focus:border-[#DB93B0] bg-gray-50/20"
                      />
                      {images.length > 1 && (
                        <button type="button" onClick={() => removeImageField(index)} className="p-2.5 text-red-400 border border-gray-200 hover:border-red-200 hover:bg-red-50/50 transition-colors cursor-pointer">
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant Matrix */}
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Stock Variant Matrix *</label>
                  <button type="button" onClick={addVariantField} className="text-[10px] text-[#DB93B0] font-bold flex items-center gap-1 hover:text-[#b87490] transition-colors cursor-pointer">
                    <Plus size={12} strokeWidth={2.5} /> Add Variant Row
                  </button>
                </div>
                
                <div className="space-y-2">
                  {variants.map((v) => (
                    <div key={v.feId} className="flex gap-2 bg-[#FAF9F6] p-3 border border-gray-200/60 items-center">
                      <div className="w-1/4">
                        <input 
                          type="text" 
                          placeholder="Size (e.g. M)" 
                          value={v.size}
                          onChange={(e) => updateVariant(v.feId, 'size', e.target.value)}
                          className="w-full border border-gray-200 p-2 bg-white outline-none focus:border-[#DB93B0] text-center"
                          required
                        />
                      </div>
                      <div className="w-3/8">
                        <input 
                          type="number" 
                          placeholder="Price (Rs)" 
                          value={v.price}
                          onChange={(e) => updateVariant(v.feId, 'price', e.target.value)}
                          className="w-full border border-gray-200 p-2 bg-white outline-none focus:border-[#DB93B0]"
                          required
                        />
                      </div>
                      <div className="w-1/4">
                        <input 
                          type="number" 
                          placeholder="Stock Qty" 
                          value={v.stock}
                          onChange={(e) => updateVariant(v.feId, 'stock', e.target.value)}
                          className="w-full border border-gray-200 p-2 bg-white outline-none focus:border-[#DB93B0]"
                          required
                        />
                      </div>
                      <div className="w-[10%] flex justify-center">
                        {variants.length > 1 ? (
                          <button 
                            type="button" 
                            onClick={() => removeVariantField(v.feId)} 
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        ) : (
                          <div className="w-5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-gray-100 bg-[#FAF9F6] flex gap-4">
              <button 
                type="button" 
                onClick={closeFormModal} 
                className="w-1/2 border border-gray-300 p-3 uppercase tracking-widest font-semibold text-gray-500 hover:bg-gray-100 bg-white transition-colors text-[10px] cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-1/2 bg-[#2D2524] hover:bg-[#4A3E3D] text-white p-3 uppercase tracking-widest font-semibold transition-colors text-[10px] cursor-pointer"
              >
                {editingProduct ? 'Save Variant Setup' : 'Publish Asset'}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}