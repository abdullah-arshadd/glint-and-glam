'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AestheticSection() {
  // Detect desktop vs touch/mobile so the two device classes get
  // genuinely different animation treatments instead of the same
  // hover-only effects awkwardly reused on touch.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const cards = [
    {
      Icon: Truck,
      title: 'Insured Shipping',
      desc: 'Every single order is tracked and fully insured to arrive safely at your doorstep.',
      rotate: 3,
    },
    {
      Icon: Sparkles,
      title: 'Premium Packaging',
      desc: 'Your joyful pieces come wrapped inside our iconic romantic blush boxes.',
      rotate: -3,
    },
    {
      Icon: ShieldCheck,
      title: 'Lifetime Authenticity',
      desc: 'We provide certified hallmarks with every piece of fine luxury jewellery.',
      rotate: 3,
    },
  ];

  return (
    <section
      className="relative w-full py-24 lg:py-36 flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#bd977a', // Exact original background color preserved
        color: '#3a2e28',
      }}
    >
      {/* 🌟 AMBIENT GOLD GLOW LAYER — gives the flat color depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 0%, rgba(255,244,214,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 100%, rgba(90,51,23,0.25) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
        {/* --- Premium Grid Container (Perfectly Centered) --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 justify-center items-stretch max-w-5xl mx-auto lg:[perspective:1200px]"
        >
          {cards.map(({ Icon, title, desc, rotate }, i) => (
            <motion.div
              key={title}
              variants={cardVariants}
              whileHover={
                isDesktop
                  ? {
                      y: -14,
                      scale: 1.045,
                      rotateX: 4,
                      rotateY: rotate,
                      boxShadow:
                        '0 30px 60px -12px rgba(58,46,40,0.45), 0 0 0 1px rgba(255,255,255,0.4) inset',
                    }
                  : undefined
              }
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="group relative flex flex-col items-center text-center p-8 lg:p-10 cursor-pointer overflow-hidden lg:[transform-style:preserve-3d]"
              style={{
                backgroundColor: 'rgba(255, 248, 238, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow:
                  '0 12px 40px 0 rgba(58, 46, 40, 0.22), 0 2px 8px 0 rgba(58, 46, 40, 0.15)',
              }}
            >
              {/* ✨ DESKTOP: SHINE SWEEP ON HOVER */}
              {isDesktop && (
                <motion.div
                  className="pointer-events-none absolute inset-0 z-0"
                  initial={{ x: '-120%' }}
                  whileHover={{ x: '120%' }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                  style={{
                    background:
                      'linear-gradient(75deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)',
                    width: '60%',
                  }}
                />
              )}

              {/* 📱 MOBILE: AMBIENT AUTO-PLAYING SHINE SWEEP — loops on its own since there's no hover */}
              {!isDesktop && (
                <motion.div
                  className="pointer-events-none absolute inset-0 z-0"
                  initial={{ x: '-130%' }}
                  animate={{ x: '130%' }}
                  transition={{
                    duration: 2.6,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  style={{
                    background:
                      'linear-gradient(75deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)',
                    width: '55%',
                  }}
                />
              )}

              {/* 🔆 DESKTOP: GOLD GLOW that blooms behind the icon on hover */}
              {isDesktop && (
                <motion.div
                  className="pointer-events-none absolute top-8 w-28 h-28 rounded-full z-0"
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileHover={{ opacity: 1, scale: 1.3 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,235,190,0.65) 0%, transparent 70%)',
                    filter: 'blur(6px)',
                  }}
                />
              )}

              {/* 📱 MOBILE: SOFT PULSING GLOW RING — ambient, no hover needed */}
              {!isDesktop && (
                <motion.div
                  className="pointer-events-none absolute top-8 w-24 h-24 rounded-full z-0"
                  animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.9, 1.08, 0.9] }}
                  transition={{
                    duration: 3,
                    ease: 'easeInOut',
                    repeat: Infinity,
                                      }}
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,235,190,0.55) 0%, transparent 70%)',
                    filter: 'blur(5px)',
                  }}
                />
              )}

              {/* Animated Icon Circle */}
              <motion.div
                whileHover={isDesktop ? { scale: 1.18, rotate: rotate * 4 } : undefined}
                animate={!isDesktop ? { y: [0, -6, 0] } : undefined}
                transition={
                  isDesktop
                    ? { type: 'spring', stiffness: 300, damping: 12 }
                    : { duration: 2.6, ease: 'easeInOut', repeat: Infinity }
                }
                className="relative z-10 p-4 mb-6"
                style={{
                  color: '#3a2e28',
                  backgroundColor: 'rgba(255, 255, 255, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 18px rgba(255,244,214,0.5)',
                }}
              >
                <Icon size={26} strokeWidth={1.2} />
              </motion.div>

              <h4
                className="relative z-10 text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]"
                style={{ color: '#3a2e28' }}
              >
                {title}
              </h4>

              <motion.div
                className="relative z-10 h-[1px] my-4"
                initial={{ width: 32, opacity: 0.3 }}
                whileHover={isDesktop ? { width: 64, opacity: 0.7 } : undefined}
                animate={
                  !isDesktop
                    ? { width: [32, 52, 32], opacity: [0.3, 0.55, 0.3] }
                    : undefined
                }
                transition={
                  isDesktop
                    ? { duration: 0.4 }
                    : { duration: 3, ease: 'easeInOut', repeat: Infinity }
                }
                style={{ backgroundColor: '#3a2e28' }}
              />

              <p
                className="relative z-10 text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]"
                style={{ color: '#3a2e28' }}
              >
                {desc}
              </p>

              {/* 🪞 BOTTOM REFLECTION LINE — hover-driven on desktop, gentle idle pulse on mobile */}
              {isDesktop ? (
                <motion.div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] z-10"
                  initial={{ opacity: 0, scaleX: 0.3 }}
                  whileHover={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(90,51,23,0.6), transparent)',
                  }}
                />
              ) : (
                <motion.div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] z-10"
                  animate={{ opacity: [0.25, 0.6, 0.25] }}
                  transition={{
                    duration: 3,
                    ease: 'easeInOut',
                    repeat: Infinity,
                                      }}
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(90,51,23,0.6), transparent)',
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}