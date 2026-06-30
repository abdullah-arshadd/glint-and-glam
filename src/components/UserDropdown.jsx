"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // 🚀 usePathname import kiya taakay route change par check ho
import { User, LogIn, UserPlus, Settings, LogOut, Package } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname(); // 🔥 Jab bhi user login/signup se home par aayega, ye path change detect karega

  // 📡 Fresh Session Check Function
  const checkSession = async () => {
    try {
      // cache: 'no-store' aur headers strictly ensure karenge ki browser cache use na kare
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
        if (data.user) {
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

  // 🔄 Effect 1: Page load par aur jab bhi URL Pathname badle (Jaise login ke baad home par aana)
  useEffect(() => {
    checkSession();
  }, [pathname]); 

  // 🔄 Effect 2: Jab dropdown khule aur click outside listener
  useEffect(() => {
    if (isOpen) {
      checkSession(); // Khulte hi background mein dobara confirm karlo
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 🚪 Logout Handler
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        setIsOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* USER ICON BUTTON */}
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

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#F7BFB4]/30 rounded-lg shadow-xl py-2 z-[99999] animate-in fade-in slide-in-from-top-5 duration-200">
          {user ? (
            <>
              <div className="px-4 py-2.5 border-b border-gray-50 font-sans normal-case">
                <p className="text-[10px] text-gray-400 font-light uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-medium text-[#2D2524] truncate mt-0.5">{user.name}</p>
                <p className="text-xs text-gray-400 truncate font-light">{user.email}</p>
              </div>

              <div className="py-1 font-sans normal-case">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#F7BFB4]/10 hover:text-[#DB93B0] transition-colors"
                >
                  <Settings size={14} strokeWidth={1.8} />
                  Edit Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#F7BFB4]/10 hover:text-[#DB93B0] transition-colors"
                >
                  <Package size={14} strokeWidth={1.8} />
                  My Orders
                </Link>
              </div>

              <div className="border-t border-gray-50 pt-1 mt-1 font-sans normal-case">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50/50 transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut size={14} strokeWidth={1.8} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="py-1 font-sans normal-case">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#F7BFB4]/10 hover:text-[#DB93B0] transition-colors"
              >
                <LogIn size={14} strokeWidth={1.8} />
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-[#F7BFB4]/10 hover:text-[#DB93B0] transition-colors"
              >
                <UserPlus size={14} strokeWidth={1.8} />
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}