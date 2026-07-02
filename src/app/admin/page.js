'use client';
import React, { useEffect, useState } from 'react';
import { ShoppingBag, AlertTriangle, RefreshCw, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    lowStockVariants: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  // Database indicators pull sequence
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // 🚀 Concurrent fetch for both orders and products endpoints
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);

      let calculatedOrdersLength = 0;
      let salesCalculated = 0;
      let lowStockCount = 0;

      // 1️⃣ ORDER VALIDATION PIPELINE (Sales & Status check)
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const activeOrders = Array.isArray(orders) ? orders : (orders?.orders || []);
        calculatedOrdersLength = activeOrders.length;

        salesCalculated = activeOrders.reduce((acc, curr) => {
          // 🔑 UPDATED REVENUE ENGINE: 
          // Kisi bhi method se order aya ho, agar backend se 'FULL_PAID' ho chuka hai, toh revenue mein calculate hoga.
          // Fallback check ke liye aap purani explicit states bhi or (||) ke sath add rakh sakte hain taake backup data break na ho.
          const isFullPaid = curr.paymentStatus === 'FULL_PAID' || curr.paymentStatus === 'PAID';
          const isCodDelivered = curr.paymentMethod === 'COD' && curr.status === 'DELIVERED';

          if (isFullPaid || isCodDelivered) {
            return acc + Number(curr.totalAmount || 0);
          }
          return acc;
        }, 0);
      }

      // 2️⃣ PRODUCTS STOCK EVALUATION PIPELINE
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const activeProducts = Array.isArray(productsData) ? productsData : (productsData?.products || []);

        activeProducts.forEach(product => {
          if (product?.variants && Array.isArray(product.variants)) {
            product.variants.forEach(variant => {
              // Low stock threshold condition
              if (Number(variant.stock || 0) <= 0) {
                lowStockCount++;
              }
            });
          }
        });
      }

      // Fallbacks mapping strictly to layout constraints
      setStats({
        totalOrders: calculatedOrdersLength || 0,
        totalSales: salesCalculated || 0,
        lowStockVariants: lowStockCount
      });

    } catch (error) {
      console.error("Dashboard metrics aggregation error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-8 [font-family:'Plus_Jakarta_Sans',sans-serif]">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time indicators for your business activity.</p>
        </div>
        <button 
          onClick={fetchDashboardStats}
          disabled={loading}
          className="p-2.5 border border-gray-200 text-gray-500 hover:text-[#DB93B0] bg-white transition-all cursor-pointer disabled:opacity-50 rounded-none"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Total Sales */}
        <div className="bg-white border border-gray-100 p-6 shadow-xs flex items-center justify-between relative overflow-hidden group rounded-none">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Total Sales</span>
            <h3 className="text-2xl font-bold text-[#2D2524]">
              {loading ? "..." : `Rs. ${stats.totalSales.toLocaleString()}`}
            </h3>
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <TrendingUp size={10} /> Confirmed Revenue
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-50 text-[#2D2524] group-hover:bg-[#DB93B0]/10 group-hover:text-[#DB93B0] flex items-center justify-center border border-gray-100 transition-colors rounded-none">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white border border-gray-100 p-6 shadow-xs flex items-center justify-between group rounded-none">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Total Orders</span>
            <h3 className="text-2xl font-bold text-[#2D2524]">
              {loading ? "..." : stats.totalOrders}
            </h3>
            <span className="text-[10px] text-gray-400 block">All incoming order streams</span>
          </div>
          <div className="w-12 h-12 bg-gray-50 text-[#2D2524] group-hover:bg-[#DB93B0]/10 group-hover:text-[#DB93B0] flex items-center justify-center border border-gray-100 transition-colors rounded-none">
            <ShoppingBag size={18} />
          </div>
        </div>

        {/* Card 3: Stock Status */}
        <div className="bg-white border border-gray-100 p-6 shadow-xs flex items-center justify-between group rounded-none">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Out of Stock Variants</span>
            <h3 className={`text-2xl font-bold ${stats.lowStockVariants > 0 ? 'text-amber-600' : 'text-[#2D2524]'}`}>
              {loading ? "..." : stats.lowStockVariants}
            </h3>
            <span className="text-[10px] text-gray-400 block">Requires direct inventory restock</span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center border transition-colors rounded-none ${
            stats.lowStockVariants > 0 
              ? 'bg-amber-50 text-amber-600 border-amber-100' 
              : 'bg-gray-50 text-gray-400 border-gray-100 group-hover:bg-red-50 group-hover:text-red-500'
          }`}>
            <AlertTriangle size={18} />
          </div>
        </div>

      </div>

      {/* QUICK OPERATIONS BAR */}
      <div className="bg-white border border-gray-100 p-6 shadow-xs space-y-4 rounded-none">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#2D2524] border-b border-gray-50 pb-3">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <Link href="/admin/orders" className="p-4 border border-gray-100 hover:border-[#DB93B0] bg-gray-50/40 flex items-center justify-between group transition-all rounded-none">
            <div>
              <p className="text-xs font-semibold text-[#2D2524]">Manage Store Orders</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Track live payments, process shipping & customer receipts.</p>
            </div>
            <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#DB93B0] transition-colors" />
          </Link>

          <Link href="/admin/products" className="p-4 border border-gray-100 hover:border-[#DB93B0] bg-gray-50/40 flex items-center justify-between group transition-all rounded-none">
            <div>
              <p className="text-xs font-semibold text-[#2D2524]">Manage Products & Inventory</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Edit variants, change prices, update structural item specs.</p>
            </div>
            <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#DB93B0] transition-colors" />
          </Link>

        </div>
      </div>

    </div>
  );
}