'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Menu, X, ArrowLeft } from 'lucide-react';

function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', href: '/admin/products', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 flex [font-family:'Plus_Jakarta_Sans',sans-serif]">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#2D2524] text-gray-300 transform lg:transform-none lg:opacity-100 transition-all duration-300 flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wider text-white [font-family:'Cormorant_Garamond',serif] text-lg">Twinkles of Joy</span>
              <span className="text-[10px] text-[#DB93B0] tracking-widest uppercase font-medium">Admin Panel</span>
            </div>
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-medium tracking-wide transition-all ${
                    isActive 
                      ? 'bg-[#DB93B0] text-white shadow-xs' 
                      : 'hover:bg-white/5 hover:text-white text-gray-400'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to Store Link */}
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <button className="text-[#2D2524] lg:hidden p-2 hover:bg-gray-50 rounded-md" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#2D2524]">Admin User</p>
              <p className="text-[10px] text-gray-400">Store Manager</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#DB93B0]/10 border border-[#DB93B0]/20 flex items-center justify-center text-xs font-bold text-[#DB93B0]">
              A
            </div>
          </div>
        </header>

        {/* Injection of Children Components */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;