"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // 🔒 Always show the same generic message whether the email exists
      // or not — the API is designed the same way. This stops anyone from
      // using this form to check which emails are registered.
      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "✅ If an account exists with this email, a password reset link has been sent.",
        });
      } else {
        setStatusMessage({ type: "error", text: `❌ ${data.message || "Something went wrong."}` });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "❌ Server side error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 [font-family:'Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#f5f3ed' }}
    >
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-2 text-xs transition-colors mb-6 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <h2 className="text-center text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-xs font-light opacity-70 max-w-xs mx-auto" style={{ color: '#3a2e28' }}>
          Enter the email linked to your account and we'll send you a link to reset your password.
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-xs font-semibold uppercase tracking-widest text-white transition-opacity focus:outline-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: '#3a2e28' }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}