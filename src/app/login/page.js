"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
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

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
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
    // 🌟 FIX: single flex wrapper with items-center for true vertical centering
    // (previously two separate mx-auto blocks stacked with their own margins,
    // which combined with min-h-screen could exceed the viewport on some
    // screens and trigger a phantom scrollbar). min-h-[100dvh] also avoids
    // mobile browsers' address-bar height changes causing a flickering scrollbar.
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 [font-family:'Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#f5f3ed' }}
    >
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-xs transition-colors mb-6 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
          <ArrowLeft size={14} /> Back to store
        </Link>

        <h2 className="text-center text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
          Please enter your details to sign in to your account
        </p>

        <div className="mt-8 bg-white/60 backdrop-blur-md py-8 px-6 border rounded-xl shadow-xs sm:px-10" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>

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
                {/* 🌟 FIX: was href="#", now links to the real forgot-password page */}
                <Link href="/forgot-password" className="font-light opacity-70 hover:opacity-100 transition-opacity" style={{ color: '#3a2e28' }}>
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
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