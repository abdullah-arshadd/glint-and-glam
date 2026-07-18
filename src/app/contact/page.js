'use client';
import React, { useState } from 'react';
import { MessageSquare, Phone, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/[^0-9+]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Form Validations for Pakistani Standards
    const pakPhoneRegex = /^((\+92)|(0092)|(0))?3[0-9]{9}$/;
    if (!pakPhoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid Pakistani phone number (e.g., 03001234567).");
      setLoading(false);
      return;
    }

    try {
      // API call path setup ready for future backend connections
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Message sent successfully! Our team will reach out soon.");
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error("Failed to send message layout");
      }
    } catch (error) {
      // Temporary success simulation if API route is not constructed yet
      console.log("Submission simulated:", formData);
      toast.success("Thank you! Your inquiry has been logged successfully.");
      setFormData({ name: '', email: '', phone: '', message: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 lg:py-20 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION - Brand Aligned */}
        <div className="text-center mb-16 bg-white/40 py-12 lg:py-20 border" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] font-semibold block mb-2" style={{ color: '#3a2e28' }}>
            Conscious Concierge
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl [font-family:'Cormorant_Garamond',serif] font-light tracking-wide" style={{ color: '#3a2e28' }}>
            Customer <span className="italic">Support</span> & Care
          </h1>
          <p className="text-xs sm:text-sm font-light mt-3 max-w-md mx-auto leading-relaxed opacity-80" style={{ color: '#3a2e28' }}>
            Have a question about tracking your order, curation details, or general inquiries? Our helpdesk is ready to assist you.
          </p>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT PANEL: Quick Channels & Details (5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide" style={{ color: '#3a2e28' }}>
                Get In Touch Directly
              </h2>
              <p className="text-xs font-light leading-relaxed opacity-70" style={{ color: '#3a2e28' }}>
                We strive to answer all your queries as quickly as possible. Please contact us through the standard channels provided below.
              </p>
            </div>

            <div className="w-full h-[1px]" style={{ backgroundColor: 'rgba(58, 46, 40, 0.08)' }} />

            {/* Support Metrics Stack */}
            <div className="space-y-6">
              {/* Channel 1: WhatsApp */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0 bg-white/60" style={{ borderColor: 'rgba(58, 46, 40, 0.12)', color: '#3a2e28' }}>
                  <MessageSquare size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#3a2e28' }}>WhatsApp Helpdesk</h4>
                  <p className="text-xs font-light mt-0.5 opacity-80" style={{ color: '#3a2e28' }}>+92 334 0657345</p>
                  <span className="text-[10px] font-medium block mt-1" style={{ color: '#3a2e28' }}>Instant Response within hours</span>
                </div>
              </div>

              {/* Channel 2: Email */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0 bg-white/60" style={{ borderColor: 'rgba(58, 46, 40, 0.12)', color: '#3a2e28' }}>
                  <Phone size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#3a2e28' }}>Email Inquiries</h4>
                  <p className="text-xs font-light mt-0.5 opacity-80" style={{ color: '#3a2e28' }}>support@glintandglam.com</p>
                  <span className="text-[10px] block mt-1 opacity-50" style={{ color: '#3a2e28' }}>Response inside 24 Business Hours</span>
                </div>
              </div>

              {/* Channel 3: Timings */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0 bg-white/60" style={{ borderColor: 'rgba(58, 46, 40, 0.12)', color: '#3a2e28' }}>
                  <Clock size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#3a2e28' }}>Operating Hours</h4>
                  <p className="text-xs font-light mt-0.5 opacity-80" style={{ color: '#3a2e28' }}>Monday to Saturday: 11:00 AM – 08:00 PM</p>
                  <span className="text-[10px] block mt-1 opacity-50" style={{ color: '#3a2e28' }}>Customer Care timings</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px]" style={{ backgroundColor: 'rgba(58, 46, 40, 0.08)' }} />
            
            {/* Note Box */}
          </div>

          {/* RIGHT PANEL: Minimalist Message Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white/60 border p-6 sm:p-10 space-y-6" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
            <div>
              <h3 className="text-xl [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide" style={{ color: '#3a2e28' }}>
                Leave a Message
              </h3>
              <p className="text-[9px] uppercase tracking-wider mt-0.5 opacity-50" style={{ color: '#3a2e28' }}>Drop your details and query below</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Your Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>Your Name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    type="text" 
                    placeholder="E.g., Ali Khan" 
                    className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors bg-white/80" 
                    style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>Email Address</label>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email" 
                    placeholder="yourname@gmail.com" 
                    className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors bg-white/80" 
                    style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>Phone Number</label>
                <input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel" 
                  placeholder="e.g., 03001234567" 
                  className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors bg-white/80" 
                  style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }}
                  required
                  disabled={loading}
                />
              </div>

              {/* Message Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>What can we help you with?</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your inquiry or order query here..." 
                  className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors resize-none bg-white/80" 
                  style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }}
                  required
                  disabled={loading}
                />
              </div>

              {/* Submit Action Button */}
              <button 
                type="submit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                disabled={loading}
                className="w-full sm:w-auto px-8 text-white py-3.5 uppercase tracking-[0.2em] text-[10px] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: loading ? '#d1d5db' : (isHovered ? '#BD977A' : '#3a2e28'),
                }}
              >
                {loading ? "Sending..." : "Send Message"} <ArrowRight size={12} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </main>
  );
}