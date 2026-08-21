"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    if (!token) {
      setStatusMessage({ type: "error", text: "❌ Invalid or missing reset link." });
      return;
    }
    if (password.length < 8) {
      setStatusMessage({ type: "error", text: "❌ Password must be at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage({ type: "error", text: "❌ Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: "success", text: "🎉 Password reset successfully! Redirecting to sign in..." });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
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
    <div className="w-full max-w-md">
      <Link href="/login" className="flex items-center gap-2 text-xs transition-colors mb-6 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
        <ArrowLeft size={14} /> Back to sign in
      </Link>

      <h2 className="text-center text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
        Reset Password
      </h2>
      <p className="mt-2 text-center text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
        Choose a new password for your account
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

        {!token ? (
          <p className="text-xs text-center opacity-70 leading-relaxed" style={{ color: '#3a2e28' }}>
            This reset link is invalid or has expired. Please request a new one from the{" "}
            <Link href="/forgot-password" className="font-semibold underline">forgot password</Link> page.
          </p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>
                New Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>
                Confirm New Password
              </label>
              <div className="mt-1.5">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="••••••••"
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 [font-family:'Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: '#f5f3ed' }}
    >
      <Suspense fallback={<div className="text-xs opacity-60" style={{ color: '#3a2e28' }}>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}