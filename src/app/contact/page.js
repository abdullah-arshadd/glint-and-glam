'use client';
import React from 'react';
import { MessageSquare, Phone, Clock, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white py-12 lg:py-20 [font-family:'Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 bg-[#F7BFB4]/10 py-12 lg:py-20 border border-[#F7BFB4]/20">
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-[#DB93B0] font-semibold block mb-2">
            Conscious Concierge
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Customer <span className="italic">Support</span> & Care
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-light mt-3 max-w-md mx-auto leading-relaxed">
            Have a question about tracking your order, curation details, or general inquiries? Our team is ready to assist you.
          </p>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT PANEL: Quick Channels & Details (5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
                Get In Touch Directly
              </h2>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Hum koshish karte hain ke aapke tamaam sawalaat ka jawab jald az jald dein. Niche diye gaye standard channels par humse rabta karein.
              </p>
            </div>

            <div className="w-full h-[1px] bg-gray-100" />

            {/* Support Metrics Stack */}
            <div className="space-y-6">
              {/* Channel 1: WhatsApp */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#F7BFB4]/10 border border-[#F7BFB4]/20 flex items-center justify-center text-[#DB93B0] flex-shrink-0">
                  <MessageSquare size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-[#2D2524] uppercase">WhatsApp Helpdesk</h4>
                  <p className="text-xs text-gray-500 font-light mt-0.5">+92 300 1234567</p>
                  <span className="text-[10px] text-[#DB93B0] font-medium block mt-1">Instant Response within hours</span>
                </div>
              </div>

              {/* Channel 2: Email */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#F7BFB4]/10 border border-[#F7BFB4]/20 flex items-center justify-center text-[#DB93B0] flex-shrink-0">
                  <Phone size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-[#2D2524] uppercase">Email Inquiries</h4>
                  <p className="text-xs text-gray-500 font-light mt-0.5">support@twinklesofjoy.com</p>
                  <span className="text-[10px] text-gray-400 block mt-1">Response inside 24 Business Hours</span>
                </div>
              </div>

              {/* Channel 3: Timings */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-[#F7BFB4]/10 border border-[#F7BFB4]/20 flex items-center justify-center text-[#DB93B0] flex-shrink-0">
                  <Clock size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-[#2D2524] uppercase">Operating Hours</h4>
                  <p className="text-xs text-gray-500 font-light mt-0.5">Monday to Saturday: 11:00 AM – 08:00 PM</p>
                  <span className="text-[10px] text-gray-400 block mt-1">Boutique Customer Care timings</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-gray-100" />
            
            {/* Note Box */}
            <div className="bg-[#F7BFB4]/5 border border-[#F7BFB4]/10 p-5 text-xs text-gray-500 font-light leading-relaxed">
              <strong>Order Tracking Tip:</strong> Agar aap apna order confirm kar chuke hain, toh koshish karein ke message mein apna exact <strong>Full Name</strong> aur <strong>Phone Number</strong> share karein taakay hamari dispatch team aapka tracker foran trace kar sake.
            </div>
          </div>


          {/* RIGHT PANEL: Minimalist Message Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-gray-100 p-6 sm:p-10 space-y-6 shadow-2xs">
            <div>
              <h3 className="text-xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
                Leave a Message
              </h3>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Drop your details and query below</p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Your Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Ali Khan" 
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="yourname@gmail.com" 
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g., 03001234567" 
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>

              {/* Message Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">What can we help you with?</label>
                <textarea 
                  rows={4}
                  placeholder="Describe your inquiry or order query here..." 
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors duration-200 resize-none"
                  required
                />
              </div>

              {/* Submit Action Button */}
              <button className="w-full sm:w-auto px-8 bg-[#2D2524] text-white py-3 uppercase tracking-[0.2em] text-[10px] font-semibold hover:bg-[#DB93B0] transition-all duration-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                Send Message <ArrowRight size={12} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </main>
  );
}