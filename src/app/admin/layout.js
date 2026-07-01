'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Menu, X, ArrowLeft, LogOut } from 'lucide-react'; // 🚀 Added LogOut icon import

function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 🔒 AUTH STATES
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', href: '/admin/products', icon: Package },
  ];

  // 🔑 REAL-TIME ACCESS PROTECTION PIPELINE
  useEffect(() => {
    async function verifyAdminAuth() {
      // Agar user login screen par hai toh execution bypass karein
      if (pathname === '/admin/login') {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/check-session');
        const data = await res.json();

        if (data.authenticated) {
          setAuthorized(true);
        } else {
          // Cookie missing ya invalid hone par kick-out straight to login page
          router.push('/admin/login');
        }
      } catch (err) {
        console.error("Auth layout verify failed:", err);
        router.push('/admin/login');
      } finally {
        setChecking(false);
      }
    }

    verifyAdminAuth();
  }, [pathname, router]);

  // 🛠️ HANDLER FOR INTEGRATED BACKEND SESSION FLUSH
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (err) {
      console.error("Logout execution crash:", err);
    }
  };

  // 🌟 LUXURY SCREEN CAPTURE LOADING STATE
  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3" style={{ backgroundColor: '#f5f3ed' }}>
        <div className="w-6 h-6 border-2 border-[#3a2e28]/20 border-t-[#3a2e28] animate-spin" />
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium tracking-widest">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  // If on login page, just render the login page without sidebar layout wrapping
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Render original navigation panel structure if clearance authorized is true
  if (authorized) {
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
                <span className="text-sm font-semibold tracking-wider text-white [font-family:'Cormorant_Garamond',serif] text-lg">Glint and Glam</span>
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

          {/* Back to Store Link & System Logout Action Bar */}
          <div className="p-4 border-t border-white/5 space-y-1">
            <Link href="/" className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={14} />
              <span>Back to Store</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer text-left font-medium"
            >
              <LogOut size={14} />
              <span>System Logout</span>
            </button>
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

  return null;
}

export default AdminLayout;