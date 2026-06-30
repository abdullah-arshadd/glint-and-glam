"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
// 🚀 Next.js App Router ke tahat redirection ke liye useRouter import kiya
import { useRouter } from "next/navigation"; 

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  
  // Router ko initialize kiya
  const router = useRouter(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      // 📡 Backend Login API ko fetch ke zariye hit kiya
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: `🎉 ${data.message}`,
        });

        // 🔒 SECURITY UPDATE: localStorage yahan se mukammal khatam!
        // Backend khud hi secure httpOnly cookie client par drop karega.

        // ⏱️ 1.5 seconds ke delay ke baad homepage par redirect aur refresh
        setTimeout(() => {
          router.push("/");
          router.refresh(); // Taakay navbar aur layouts naya cookie session instantly catch karein
        }, 1500);

      } else {
        // Validation fails ya ghalat credentials par error handle
        setStatusMessage({
          type: "error",
          text: `❌ ${data.message}`,
        });
      }
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: "❌ Server side error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔑 FIXED: Whole page wrapped inside your premium brand background #f7f2e6
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="sm:mx-auto w-full max-w-md">
        {/* Back to Home Link */}
        <Link href="/" className="flex items-center gap-2 text-xs transition-colors mb-6 justify-center sm:justify-start sm:px-0 px-4 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
          <ArrowLeft size={14} /> Back to store
        </Link>
        {/* 🔑 FIXED: Main heading synced with Cormorant Garamond & proper brand color */}
        <h2 className="text-center text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
          Please enter your details to sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4 sm:px-0">
        <div className="bg-white/60 backdrop-blur-md py-8 px-6 border rounded-xl shadow-xs sm:px-10" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          
          {/* UI Alerts Feedback Banner */}
          {statusMessage.text && (
            <div className={`mb-5 p-3 text-xs rounded-md font-light text-center ${
              statusMessage.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {statusMessage.text}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>
                Email Address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-xs">
                <a href="#" className="font-light opacity-70 hover:opacity-100 transition-opacity" style={{ color: '#3a2e28' }}>
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              {/* 🔑 FIXED: HERE IS YOUR SIGN IN BUTTON - Restyled elegantly to stand out cleanly */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-xs font-semibold uppercase tracking-widest text-white transition-opacity focus:outline-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: '#3a2e28' }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold underline hover:opacity-80" style={{ color: '#3a2e28' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}