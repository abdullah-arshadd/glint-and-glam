"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  
  const router = useRouter();

  // Handle Form Submission (Phase 1: Request OTP / Phase 2: Final Verify)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    const payload = otpSent 
      ? { ...formData, otp: otpCode } 
      : formData;

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.otpSent) {
          setOtpSent(true);
          setStatusMessage({ type: "success", text: `📩 ${data.message}` });
        } else {
          setStatusMessage({ type: "success", text: "🎉 Registration & Phone Verification Successful! Redirecting..." });
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
        }
      } else {
        setStatusMessage({ type: "error", text: `❌ ${data.message || "Something went wrong"}` });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "❌ Server issue. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="sm:mx-auto w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-xs transition-colors mb-6 justify-center sm:justify-start sm:px-0 px-4 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
          <ArrowLeft size={14} /> Back to store
        </Link>
        <h2 className="text-center text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
          Create Account
        </h2>
        <p className="mt-2 text-center text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
          Verify your mobile number to register securely.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4 sm:px-0">
        <div className="bg-white/60 backdrop-blur-md py-8 px-6 border rounded-xl shadow-xs sm:px-10" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          
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
            {/* Input fields disable ho jayenge jab OTP chala jayega */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Full Name</label>
              <div className="mt-1.5">
                <input
                  id="name"
                  type="text"
                  required
                  disabled={otpSent}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="Ahmad Khan"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Email Address</label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  required
                  disabled={otpSent}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Phone Number</label>
              <div className="mt-1.5">
                <input
                  id="phone"
                  type="tel"
                  required
                  disabled={otpSent}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="+923001234567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Password</label>
              <div className="mt-1.5">
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  disabled={otpSent}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            {/* Dynamic OTP Input Field Block */}
            {otpSent && (
              <div className="pt-4 border-t border-dashed border-gray-300 animate-in fade-in duration-300">
                <label className="block text-xs font-medium text-amber-800 flex items-center gap-1.5 mb-2">
                  <KeyRound size={14} /> Enter 6-Digit Verification Code
                </label>
                <input 
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  className="w-full px-4 py-2.5 bg-white border text-xs tracking-widest font-bold rounded-md focus:outline-none text-center"
                  style={{ color: '#3a2e28', borderColor: '#3a2e28' }}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setOtpSent(false)} 
                  className="text-[11px] text-red-500 underline mt-1.5 block cursor-pointer"
                >
                  Edit details or re-send code
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-xs font-semibold uppercase tracking-widest text-white transition-opacity focus:outline-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: '#3a2e28' }}
              >
                {loading ? "Processing..." : otpSent ? "Verify & Register" : "Send OTP & Register"}
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