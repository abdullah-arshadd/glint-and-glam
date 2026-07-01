'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const [user, setUser] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [initialUser, setInitialUser] = useState(null); // 🚀 FIXED: Initial values ko compare karne ke liye state block
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 🔒 OTP System States
  const [newPhone, setNewPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // 1. GET: Database se Fresh Profile Data Fetch karna
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        const data = await res.json();
        
        if (res.ok) {
          const profileFields = {
            name: data.name,
            email: data.email,
            phone: data.phone || 'Not available',
            password: '',
            confirmPassword: ''
          };
          
          setUser(profileFields);
          setInitialUser(profileFields); // 🚀 FIXED: Fetch hote hi initial values copy lock kardi
          setNewPhone(data.phone || '');
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to load profile.' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Connection error while fetching profile data.' });
      } finally {
        loading && setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // 2. PUT: Name & Password Update Handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 🚀 FIXED: Strict Verification Check ke data badla b hai ya nahi
    const isNameUnchanged = user.name === initialUser?.name;
    const isPasswordEmpty = !user.password && !user.confirmPassword;

    if (isNameUnchanged && isPasswordEmpty) {
      setMessage({ type: 'error', text: 'ℹ️ No changes done.' });
      return; // API stream aur reload ko yahin block kardo
    }

    if (user.password && user.password !== user.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, password: user.password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '🎉 Profile details updated successfully!' });
        setUser(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setTimeout(() => { window.location.reload(); }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong while saving changes.' });
    } finally {
      setSubmitting(false);
    }
  };

  // 3. OTP: Phone Par Code Send Karne Ka Flow
  const handleSendOtp = async () => {
    if (!newPhone || newPhone.trim() === '') {
      setMessage({ type: 'error', text: 'Please enter a valid phone number first.' });
      return;
    }
    setMessage({ type: '', text: '' });
    setOtpLoading(true);

    try {
      const res = await fetch('/api/profile/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setMessage({ type: 'success', text: '📩 OTP verification code sent to your phone! Check backend console.' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  // 4. OTP: Code Verify Karke Number Lock Karne Ka Flow
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit OTP code.' });
      return;
    }
    setMessage({ type: '', text: '' });
    setOtpLoading(true);

    try {
      const res = await fetch('/api/profile/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone, otp: otpCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Phone number verified and updated successfully!' });
        setOtpSent(false);
        setOtpCode('');
        setTimeout(() => { window.location.reload(); }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to verify OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen" style={{ backgroundColor: '#f5f3ed' }}>
        <Loader2 className="animate-spin text-[#3a2e28] mb-2" size={32} />
        <p className="text-xs font-light text-[#3a2e28] tracking-wider uppercase">Loading Profile Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs transition-colors mb-6 opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
          <ArrowLeft size={14} /> Back to store
        </Link>

        <div className="bg-white/60 backdrop-blur-md p-6 md:p-10 border rounded-2xl shadow-xs" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
              Account Settings
            </h1>
            <p className="text-xs font-light opacity-70 mt-1" style={{ color: '#3a2e28' }}>
              Manage your personal credentials and phone number verification.
            </p>
          </div>

          {message.text && (
            <div className={`p-4 mb-6 rounded-lg text-xs font-light border text-center ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
              message.text.includes('No changes done') ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* SECTION 1: Phone Security Layer (OTP Dynamic Box) */}
          <div className="bg-white/40 p-4 border rounded-xl mb-8 space-y-4" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#3a2e28]">
              Verified Phone Number
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full">
                <p className="text-[11px] text-gray-400 mb-1.5">Current Number: <span className="font-semibold text-gray-700">{user.phone}</span></p>
                <input 
                  type="tel"
                  placeholder="+923001234567"
                  disabled={otpSent}
                  className="w-full px-4 py-2.5 bg-white border text-xs rounded-md focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              {!otpSent ? (
                <button
                  type="button"
                  disabled={otpLoading || newPhone === user.phone}
                  onClick={handleSendOtp}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#3a2e28] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-opacity hover:opacity-90 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {otpLoading ? 'Sending...' : 'Update Phone via OTP'}
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setOtpSent(false)} 
                  className="text-xs text-red-500 font-medium underline p-2 cursor-pointer"
                >
                  Change Number
                </button>
              )}
            </div>

            {/* Expands gracefully once OTP drops to backend console */}
            {otpSent && (
              <div className="pt-4 border-t border-dashed border-gray-200 animate-in fade-in duration-300">
                <label className="block text-xs font-medium text-amber-800 flex items-center gap-1.5 mb-2">
                  <KeyRound size={14} /> Enter 6-Digit OTP Verification Code
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 bg-white border text-xs tracking-widest font-bold rounded-md focus:outline-none text-center"
                    style={{ color: '#3a2e28', borderColor: '#3a2e28' }}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={handleVerifyOtp}
                    className="px-6 py-2.5 bg-green-600 text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-green-700 cursor-pointer transition-colors"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Name & Password Management */}
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#3a2e28' }}>
                Full Name
              </label>
              <input 
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#3a2e28' }}>
                Email Address
              </label>
              <input 
                type="email"
                disabled
                className="w-full px-4 py-2.5 bg-gray-100/50 border text-xs text-gray-400 rounded-md cursor-not-allowed" 
                style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}
                value={user.email} 
              />
            </div>

            <hr className="my-6 opacity-30" style={{ borderColor: '#3a2e28' }} />

            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#3a2e28' }}>
                Update Password
              </h3>
              <p className="text-xs font-light opacity-60 mb-4" style={{ color: '#3a2e28' }}>
                Leave fields blank if you do not want to change your current password.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#3a2e28' }}>
                    New Password
                  </label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                    style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                    value={user.password}
                    onChange={(e) => setUser({...user, password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#3a2e28' }}>
                    Confirm New Password
                  </label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-white/80 border text-xs rounded-md focus:outline-none transition-all"
                    style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.2)' }}
                    value={user.confirmPassword}
                    onChange={(e) => setUser({...user, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-600 hover:bg-black/5 rounded-md transition-all cursor-pointer"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-opacity focus:outline-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90 rounded-md"
                style={{ backgroundColor: '#3a2e28' }}
              >
                {submitting ? 'Saving...' : 'Save General Changes'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}