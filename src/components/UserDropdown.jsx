"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogIn, UserPlus, Settings, LogOut, Package } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session", { 
        method: "GET",
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch (err) {
      console.error("Session check failed:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    checkSession();
  }, [pathname]); 

  useEffect(() => {
    if (isOpen) {
      checkSession();
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 🌟 Clean Logout: Clears memory & hard-redirects to Homepage
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setIsOpen(false);

      if (typeof window !== "undefined") {
        localStorage.removeItem("glam_guest_cart");
      }

      // 🚀 Hard Browser Redirect to Homepage
      // React state, SWR cache aur Cart context bilkul clean guest mode par reset ho jaye ga
      window.location.href = "/";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-[#DB93B0] text-[#2D2524] transition-colors cursor-pointer p-2 flex items-center gap-1 focus:outline-none normal-case font-sans text-xs tracking-normal"
      >
        <User size={18} strokeWidth={1.5} className={user ? "text-[#DB93B0]" : "text-[#2D2524]"} />
        {user && (
          <span className="hidden sm:inline-block text-gray-500 hover:text-[#DB93B0] font-light">
            hi, {user.name ? user.name.split(" ")[0] : "Customer"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#3a2e28]/10 rounded-md py-2 animate-in fade-in slide-in-from-top-5 duration-200">
          {user ? (
            <>
              <div className="px-4 py-2.5 border-b border-gray-100 font-sans normal-case">
                <p className="text-[10px] text-gray-400 font-light uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-medium text-[#3a2e28] truncate mt-0.5">{user.name}</p>
                <p className="text-xs text-gray-400 truncate font-light">{user.email}</p>
              </div>

              <div className="py-1 font-sans normal-case">
                <Link
                  href="/profile/edit"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#f5f3ed] hover:text-[#3a2e28] transition-colors"
                >
                  <Settings size={14} strokeWidth={1.6} />
                  Edit Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#f5f3ed] hover:text-[#3a2e28] transition-colors"
                >
                  <Package size={14} strokeWidth={1.6} />
                  My Orders
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1 mt-1 font-sans normal-case">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50/60 transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut size={14} strokeWidth={1.6} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="py-1 font-sans normal-case">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#f5f3ed] hover:text-[#3a2e28] transition-colors"
              >
                <LogIn size={14} strokeWidth={1.6} />
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#f5f3ed] hover:text-[#3a2e28] transition-colors"
              >
                <UserPlus size={14} strokeWidth={1.6} />
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}