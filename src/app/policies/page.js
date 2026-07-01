'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Truck, Lock } from 'lucide-react';

export default function PolicyPage() {
  return (
    <main className="min-h-screen py-12 lg:py-24 text-[#3a2e28]" style={{ backgroundColor: '#f7f2e6' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO HEADER */}
        <div className="text-center mb-20 py-16 lg:py-24 border" style={{ backgroundColor: 'rgba(58, 46, 40, 0.02)', borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] font-semibold block mb-3 opacity-60">
            Legal & Trust
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light tracking-wide max-w-3xl mx-auto leading-tight">
            Privacy & <span className="italic">Store Policies</span>
          </h1>
          <p className="text-xs sm:text-sm font-light mt-4 max-w-md mx-auto leading-relaxed opacity-70">
            At Glint and Glam, transparency and your trust are our highest priorities. Review our terms below.
          </p>
        </div>

        {/* QUICK NAVIGATION ICONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="border p-4 text-center space-y-2" style={{ backgroundColor: 'rgba(58, 46, 40, 0.01)', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
            <ShieldCheck size={20} className="mx-auto opacity-70" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold tracking-widest uppercase block">Privacy</span>
          </div>
          <div className="border p-4 text-center space-y-2" style={{ backgroundColor: 'rgba(58, 46, 40, 0.01)', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
            <RefreshCw size={20} className="mx-auto opacity-70" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold tracking-widest uppercase block">Returns</span>
          </div>
          <div className="border p-4 text-center space-y-2" style={{ backgroundColor: 'rgba(58, 46, 40, 0.01)', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
            <Truck size={20} className="mx-auto opacity-70" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold tracking-widest uppercase block">Shipping</span>
          </div>
          <div className="border p-4 text-center space-y-2" style={{ backgroundColor: 'rgba(58, 46, 40, 0.01)', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
            <Lock size={20} className="mx-auto opacity-70" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold tracking-widest uppercase block">Security</span>
          </div>
        </div>

        {/* POLICY CONTENT SECTIONS */}
        <div className="space-y-16 border-t pt-16" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
          
          {/* SECTION 1: REFUND & RETURN POLICY */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-light tracking-wide uppercase">
              1. Refund & Return Policy
            </h2>
            <div className="text-xs sm:text-sm font-light leading-relaxed opacity-80 space-y-3">
              <p>
                Since Glint and Glam curates premium retail jewelry with manual quality inspections before dispatch, we ensure each piece is in flawless condition. However, if you receive a damaged or incorrect item, we offer a hassle-free exchange or refund.
              </p>
              <p>
                <strong>Eligibility for Returns:</strong> You must contact us within 7 days of delivery. The item must be unused, in its original luxury packaging, and accompanied by the original receipt or proof of purchase.
              </p>
              <p>
                <strong>Refund Process:</strong> Once your return is received and inspected, we will notify you via email or phone. Approved refunds will be processed via your original payment method or online bank transfer within 5-7 working days.
              </p>
            </div>
          </section>

          {/* SECTION 2: PRIVACY POLICY */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-light tracking-wide uppercase">
              2. Privacy Policy
            </h2>
            <div className="text-xs sm:text-sm font-light leading-relaxed opacity-80 space-y-3">
              <p>
                Your privacy is essential to us. This policy outlines how Glint and Glam collects, uses, and safeguards the personal information you provide on our boutique storefront.
              </p>
              <p>
                <strong>Information Collection:</strong> When you purchase from our boutique, we collect standard personal details such as your name, delivery address, phone number, and email address to process your orders seamlessly.
              </p>
              <p>
                <strong>Data Usage:</strong> Your details are strictly used for order fulfillment, shipping logistics, and customer service. We absolutely never sell, rent, or trade your personal data to third-party marketing agencies.
              </p>
            </div>
          </section>

          {/* SECTION 3: SHIPPING & DELIVERY */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-light tracking-wide uppercase">
              3. Shipping & Delivery Terms
            </h2>
            <div className="text-xs sm:text-sm font-light leading-relaxed opacity-80 space-y-3">
              <p>
                Because our curated collections are physically stocked in our retail warehouse, we eliminate long waiting lists. 
              </p>
              <p>
                <strong>Delivery Timeline:</strong> Orders are packaged carefully and shipped within 24-48 hours. Standard delivery across major cities takes 2-4 working days.
              </p>
              <p>
                <strong>Shipping Fee:</strong> Standard delivery rates are applied at checkout unless specified during promotional campaigns. Tracking details will be shared via text/email once the courier handles your order.
              </p>
            </div>
          </section>

          {/* SECTION 4: SECURE SHOPPING */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-light tracking-wide uppercase">
              4. Secure Shopping Guarantee
            </h2>
            <div className="text-xs sm:text-sm font-light leading-relaxed opacity-80 space-y-3">
              <p>
                Glint and Glam utilizes standard SSL encryption technology to safeguard your transaction data. All digital payments are handled through secure, certified payment gateways to ensure complete financial safety.
              </p>
            </div>
          </section>

        </div>

        {/* FOOTER NOTE */}
        <div className="mt-20 pt-8 border-t text-center text-[10px] tracking-widest uppercase opacity-50" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
          Last Updated: July 2026 • Glint and Glam Luxury Retail
        </div>

      </div>
    </main>
  );
}