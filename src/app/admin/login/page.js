'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin'); // Redirect to dashboard over success
        router.refresh();
      } else {
        setError(data.message || 'Invalid Credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="w-full max-w-md bg-white border border-gray-100 p-8 shadow-xs space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide text-[#2D2524]">
            Glint & Glam Control
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Authorized Admin Access Only</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold block">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-xs px-4 py-3 focus:outline-none focus:border-[#3a2e28] text-[#3a2e28]"
              placeholder="Enter admin identifier"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold block">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-xs px-4 py-3 focus:outline-none focus:border-[#3a2e28] text-[#3a2e28]"
              placeholder="••••••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full text-white py-3.5 uppercase tracking-widest text-[9px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer mt-2"
            style={{ backgroundColor: '#3a2e28' }}
          >
            {loading ? 'Verifying Identity...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </main>
  );
}