'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const SESSION_KEY = 'gg_sale_popup_shown';

export default function SaleAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const alreadyShown = sessionStorage.getItem(SESSION_KEY);
      if (!alreadyShown) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem(SESSION_KEY, 'true');
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // sessionStorage unavailable — fail silently, no popup
    }
  }, []);

  const close = () => {
    // 🔧 TEMP DEBUG — remove this console.log once confirmed working.
    // If this line does NOT print when you click the X, the click isn't
    // reaching this handler (something else is intercepting it — e.g. a
    // duplicate modal instance, or a parent element with its own onClick).
    console.log('Sale modal close() fired');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sale-modal-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal Card — stopPropagation so a click anywhere inside the
              card (even outside the button) never accidentally bubbles up
              to the backdrop's onClick in some unexpected way */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative w-full max-w-md mx-auto text-center overflow-hidden [font-family:'Plus_Jakarta_Sans',sans-serif]"
            style={{
              backgroundColor: '#f5f3ed',
              boxShadow: '0 30px 70px -15px rgba(58,46,40,0.5)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-3 border"
              style={{ borderColor: 'rgba(189,151,122,0.55)' }}
            />

            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(ellipse 60% 45% at 15% 0%, rgba(189,151,122,0.28) 0%, transparent 60%), radial-gradient(ellipse 55% 40% at 90% 100%, rgba(58,46,40,0.12) 0%, transparent 60%)',
              }}
            />

            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 z-20 p-1.5 text-[#3a2e28]/50 hover:text-[#3a2e28] transition-colors duration-200 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 px-8 sm:px-10 py-12 sm:py-14 flex flex-col items-center">
              <Sparkles size={22} strokeWidth={1.2} style={{ color: '#bd977a' }} />

              <span
                className="mt-5 text-[10px] uppercase tracking-[0.3em] font-semibold"
                style={{ color: '#bd977a' }}
              >
                Limited Time
              </span>

              <h2
                className="mt-3 text-3xl sm:text-4xl font-medium tracking-wide [font-family:'Cormorant_Garamond',serif]"
                style={{ color: '#3a2e28' }}
              >
                The Sale is <span className="italic">Officially</span> Live
              </h2>

              <p
                className="mt-4 text-xs sm:text-sm font-light leading-relaxed opacity-80 max-w-xs"
                style={{ color: '#3a2e28' }}
              >
                For a limited time only, enjoy exclusive prices across the entire collection — available exclusively on our website.
              </p>

              <Link
                href="/shop"
                onClick={close}
                className="mt-8 w-full sm:w-auto px-10 py-3.5 uppercase tracking-[0.15em] text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: '#3a2e28', color: '#ffffff' }}
              >
                Shop The Sale
              </Link>

              <button
                type="button"
                onClick={close}
                className="mt-4 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                style={{ color: '#3a2e28' }}
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}