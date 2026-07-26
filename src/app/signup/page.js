"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  
  // 🌟 OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const router = useRouter();

  // Step 1: Signup & Send OTP
  const handleSignupSubmit = async (e) => {
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
        setStatusMessage({ type: "success", text: "Verification code sent to your email." });
        setIsOtpSent(true);
      } else {
        setStatusMessage({ type: "error", text: `❌ ${data.message || "Something went wrong"}` });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "❌ Server issue. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // 🌟 Auto-Fill OTP on Paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Only numbers allowed

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
    setOtp(newOtp);
    
    // Focus last filled box
    const focusIndex = Math.min(digits.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setStatusMessage({ type: "error", text: "Please enter the complete 6-digit code." });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage({ type: "success", text: "🎉 Email Verified! Redirecting..." });
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else {
        setStatusMessage({ type: "error", text: `❌ ${data.message || "Invalid or expired OTP"}` });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "❌ Server issue. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="sm:mx-auto w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-xs transition-colors mb-4 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
          <ArrowLeft size={14} /> Back to store
        </Link>
        <h2 className="text-2xl sm:text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
          {isOtpSent ? "Verify Email" : "Create Account"}
        </h2>
        <p className="mt-1 text-xs font-light opacity-70 break-words" style={{ color: '#3a2e28' }}>
          {isOtpSent 
            ? `We sent a 6-digit verification code to ${formData.email}. Please enter it below.` 
            : "Fill in your details to register securely."}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-md py-6 sm:py-8 px-4 sm:px-10 border rounded-xl shadow-xs" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          
          {statusMessage.text && (
            <div className={`mb-5 p-3 text-xs rounded-md font-light text-center break-words ${
              statusMessage.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {statusMessage.text}
            </div>
          )}

          {!isOtpSent ? (
            /* --- STEP 1: SIGNUP FORM --- */
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSignupSubmit}>
              <div>
                <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Full Name</label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none"
                    style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                    placeholder="Ahmad Khan"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Email Address</label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none"
                    style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Phone Number</label>
                <div className="mt-1">
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none"
                    style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                    placeholder="+923001234567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider" style={{ color: '#3a2e28' }}>Password</label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none"
                    style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-xs font-semibold uppercase tracking-widest text-white transition-opacity focus:outline-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: '#3a2e28' }}
                >
                  {loading ? "Processing..." : "Create Account"}
                </button>
              </div>
            </form>
          ) : (
            /* --- STEP 2: RESPONSIVE OTP VERIFICATION FORM --- */
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              {/* 🌟 Dynamic Flex with flex-1 prevents horizontal scroll on small devices */}
              <div className="flex justify-between gap-1.5 sm:gap-2 mt-2 w-full max-w-full overflow-hidden">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="flex-1 min-w-0 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold bg-white/80 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#3a2e28] transition-all p-0"
                    style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  />
                ))}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-xs font-semibold uppercase tracking-widest text-white transition-opacity focus:outline-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: '#3a2e28' }}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>
              
              <div className="text-center mt-2">
                <button 
                  type="button"
                  onClick={() => setIsOtpSent(false)} 
                  className="text-xs font-light underline opacity-70 hover:opacity-100" 
                  style={{ color: '#3a2e28' }}
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}

          {!isOtpSent && (
            <div className="mt-6 text-center">
              <p className="text-xs font-light opacity-70" style={{ color: '#3a2e28' }}>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold underline hover:opacity-80" style={{ color: '#3a2e28' }}>
                  Sign in
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}