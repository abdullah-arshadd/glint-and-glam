'use client';
import React from 'react';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function AestheticSection() {
  return (
    <section 
      className="w-full py-24 lg:py-36 flex items-center justify-center" 
      style={{ 
        backgroundColor: '#bd977a', // Exact original background color preserved
        color: '#3a2e28' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* --- Premium Grid Container (Perfectly Centered) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 justify-center items-stretch max-w-5xl mx-auto">
          
          {/* Card 1: Insured Shipping */}
          <div 
            className="group flex flex-col items-center text-center p-8 lg:p-10 transition-all duration-500 hover:-translate-y-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)', 
              // 🔑 REMOVED: White border property has been completely clean-swept
              boxShadow: '0 8px 32px 0 rgba(58, 46, 40, 0.08)', 
            }}
          >
            {/* Animated Icon Circle */}
            <div 
              className="p-4 transition-all duration-500 mb-6 group-hover:scale-110" 
              style={{ 
                color: '#3a2e28',
                backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <Truck size={26} strokeWidth={1.2} />
            </div>
            
            <h4 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Insured Shipping
            </h4>
            
            <div className="w-8 h-[1px] my-4 opacity-30 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#3a2e28' }} />
            
            <p className="text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Every single order is tracked and fully insured to arrive safely at your doorstep.
            </p>
          </div>

          {/* Card 2: Premium Packaging */}
          <div 
            className="group flex flex-col items-center text-center p-8 lg:p-10 transition-all duration-500 hover:-translate-y-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              // 🔑 REMOVED: White border property has been completely clean-swept
              boxShadow: '0 8px 32px 0 rgba(58, 46, 40, 0.08)',
            }}
          >
            {/* Animated Icon Circle */}
            <div 
              className="p-4 transition-all duration-500 mb-6 group-hover:scale-110" 
              style={{ 
                color: '#3a2e28',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <Sparkles size={26} strokeWidth={1.2} />
            </div>
            
            <h4 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Premium Packaging
            </h4>
            
            <div className="w-8 h-[1px] my-4 opacity-30 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#3a2e28' }} />
            
            <p className="text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Your joyful pieces come wrapped inside our iconic romantic blush boxes.
            </p>
          </div>

          {/* Card 3: Lifetime Authenticity */}
          <div 
            className="group flex flex-col items-center text-center p-8 lg:p-10 transition-all duration-500 hover:-translate-y-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              // 🔑 REMOVED: White border property has been completely clean-swept
              boxShadow: '0 8px 32px 0 rgba(58, 46, 40, 0.08)',
            }}
          >
            {/* Animated Icon Circle */}
            <div 
              className="p-4 transition-all duration-500 mb-6 group-hover:scale-110" 
              style={{ 
                color: '#3a2e28',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <ShieldCheck size={26} strokeWidth={1.2} />
            </div>
            
            <h4 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Lifetime Authenticity
            </h4>
            
            <div className="w-8 h-[1px] my-4 opacity-30 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#3a2e28' }} />
            
            <p className="text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              We provide certified hallmarks with every piece of fine luxury jewellery.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}