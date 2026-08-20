'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AestheticSection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Stagger the three cards so they don't all move at once
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.05,
      },
    },
  };

  // Each card gets its own entrance direction — right, left, then bottom —
  // so they visually "assemble" from different sides instead of all
  // doing the same generic fade-up.
  const entranceVariants = [
    {
      hidden: { opacity: 0, x: 90, y: 20, scale: 0.94 },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      },
    },
    {
      hidden: { opacity: 0, x: -90, y: 20, scale: 0.94 },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      },
    },
    {
      hidden: { opacity: 0, y: 70, scale: 0.9 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      },
    },
  ];

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
        backgroundColor: '#bd977a',
        color: '#3a2e28',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 0%, rgba(255,244,214,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 100%, rgba(90,51,23,0.25) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 justify-center items-stretch max-w-5xl mx-auto"
        >
          {cards.map(({ Icon, title, desc, rotate }, i) => (
            <motion.div
              key={title}
              variants={entranceVariants[i]}
              whileHover={
                isDesktop
                  ? {
                      y: -10,
                      scale: 1.03,
                      boxShadow:
                        '0 30px 60px -12px rgba(58,46,40,0.45), 0 0 0 1px rgba(255,255,255,0.4) inset',
                    }
                  : undefined
              }
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative flex flex-col items-center text-center p-8 lg:p-10"
              style={{
                backgroundColor: 'rgba(255, 248, 238, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow:
                  '0 12px 40px 0 rgba(58, 46, 40, 0.22), 0 2px 8px 0 rgba(58, 46, 40, 0.15)',
              }}
            >
              <div
                className="p-4 mb-6"
                style={{
                  color: '#3a2e28',
                  backgroundColor: 'rgba(255, 255, 255, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 18px rgba(255,244,214,0.5)',
                }}
              >
                <Icon size={26} strokeWidth={1.2} />
              </div>

              <h4
                className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]"
                style={{ color: '#3a2e28' }}
              >
                {title}
              </h4>

              <div
                className="h-[1px] my-4"
                style={{ width: 40, opacity: 0.4, backgroundColor: '#3a2e28' }}
              />

              <p
                className="text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]"
                style={{ color: '#3a2e28' }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}