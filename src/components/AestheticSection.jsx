'use client';
import React from 'react';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AestheticSection() {
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
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  return (
    <section 
      className="w-full py-24 lg:py-36 flex items-center justify-center overflow-hidden" 
      style={{ 
        backgroundColor: '#bd977a', // Exact original background color preserved
        color: '#3a2e28' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* --- Premium Grid Container (Perfectly Centered) --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 justify-center items-stretch max-w-5xl mx-auto"
        >
          
          {/* Card 1: Insured Shipping */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group flex flex-col items-center text-center p-8 lg:p-10 cursor-pointer"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)', 
              boxShadow: '0 8px 32px 0 rgba(58, 46, 40, 0.08)', 
            }}
          >
            {/* Animated Icon Circle */}
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 3 }}
              className="p-4 transition-all duration-500 mb-6" 
              style={{ 
                color: '#3a2e28',
                backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <Truck size={26} strokeWidth={1.2} />
            </motion.div>
            
            <h4 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Insured Shipping
            </h4>
            
            <div className="w-8 h-[1px] my-4 opacity-30 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#3a2e28' }} />
            
            <p className="text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Every single order is tracked and fully insured to arrive safely at your doorstep.
            </p>
          </motion.div>

          {/* Card 2: Premium Packaging */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group flex flex-col items-center text-center p-8 lg:p-10 cursor-pointer"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px 0 rgba(58, 46, 40, 0.08)',
            }}
          >
            {/* Animated Icon Circle */}
            <motion.div 
              whileHover={{ scale: 1.15, rotate: -3 }}
              className="p-4 transition-all duration-500 mb-6" 
              style={{ 
                color: '#3a2e28',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <Sparkles size={26} strokeWidth={1.2} />
            </motion.div>
            
            <h4 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Premium Packaging
            </h4>
            
            <div className="w-8 h-[1px] my-4 opacity-30 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#3a2e28' }} />
            
            <p className="text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Your joyful pieces come wrapped inside our iconic romantic blush boxes.
            </p>
          </motion.div>

          {/* Card 3: Lifetime Authenticity */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group flex flex-col items-center text-center p-8 lg:p-10 cursor-pointer"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px 0 rgba(58, 46, 40, 0.08)',
            }}
          >
            {/* Animated Icon Circle */}
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 3 }}
              className="p-4 transition-all duration-500 mb-6" 
              style={{ 
                color: '#3a2e28',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <ShieldCheck size={26} strokeWidth={1.2} />
            </motion.div>
            
            <h4 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              Lifetime Authenticity
            </h4>
            
            <div className="w-8 h-[1px] my-4 opacity-30 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#3a2e28' }} />
            
            <p className="text-xs font-light leading-relaxed opacity-90 max-w-[240px] [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ color: '#3a2e28' }}>
              We provide certified hallmarks with every piece of fine luxury jewellery.
            </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}