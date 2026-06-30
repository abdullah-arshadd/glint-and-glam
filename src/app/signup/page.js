"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // 🚀 Redirection ke liye

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  
  const router = useRouter(); // Initialize router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "🎉 Registration successful! Redirecting...",
        });

        // 🚀 SUCCESS: Backend cookie set kar chuka hai, ab bas redirect karo
        setTimeout(() => {
          router.push("/");
          router.refresh(); // Crucial: Navbar/Dropdown ko force refresh karega
        }, 1500);

      } else {
        setStatusMessage({
          type: "error",
          text: `❌ ${data.message || "Something went wrong"}`,
        });
      }
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: "❌ Server issue. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔑 FIXED: Background set to your custom requirement '#f7f2e6' with brand styling
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="sm:mx-auto w-full max-w-md">
        {/* Back to Home Link */}
        <Link href="/" className="flex items-center gap-2 text-xs transition-colors mb-6 justify-center sm:justify-start sm:px-0 px-4 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
          <ArrowLeft size={14} /> Back to store
        </Link>
        {/* 🔑 FIXED: Heading styles synchronized with the store concept */}
        <h2 className="text-center text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
          Create Account
        </h2>
        <p className="mt-2 text-center text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
          Join us to track orders and experience flawless shopping
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4 sm:px-0">
        {/* 🔑 FIXED: Card overlay blending beautifully over the custom light background */}
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
              <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>
                Full Name
              </label>
              <div className="mt-1.5">
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="Ahmad Khan"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              {/* 🔑 FIXED: Core Register button styled beautifully with dynamic brand accent (#3a2e28) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-xs font-semibold uppercase tracking-widest text-white transition-opacity focus:outline-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: '#3a2e28' }}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold underline hover:opacity-80" style={{ color: '#3a2e28' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}