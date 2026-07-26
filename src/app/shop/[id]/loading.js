import React from 'react';

export default function Loading() {
  return (
    <main className="min-h-screen py-8 lg:py-16" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          
          {/* LEFT: Image Skeleton (Animate Pulse) */}
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="w-full aspect-[4/5] bg-[#3a2e28]/5 border" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}></div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-16 bg-[#3a2e28]/5 border" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}></div>
              ))}
            </div>
          </div>

          {/* RIGHT: Content Skeleton (Animate Pulse) */}
          <div className="flex flex-col space-y-6 lg:pt-2 animate-pulse">
            <div>
              <div className="h-3 w-20 bg-[#3a2e28]/10 mb-3"></div>
              <div className="h-10 w-3/4 bg-[#3a2e28]/15 mb-4"></div>
              <div className="h-6 w-32 bg-[#3a2e28]/10 mb-6"></div>
              <div className="h-8 w-24 bg-[#3a2e28]/10"></div>
            </div>

            <hr style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }} />

            <div className="space-y-3">
              <div className="h-3 w-full bg-[#3a2e28]/10"></div>
              <div className="h-3 w-5/6 bg-[#3a2e28]/10"></div>
              <div className="h-3 w-4/6 bg-[#3a2e28]/10"></div>
            </div>

            <div className="pt-8">
               <div className="h-12 w-full bg-[#3a2e28]/15"></div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}