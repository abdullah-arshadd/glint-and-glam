'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const STATIC_REVIEWS = [
  {
    id: 1,
    name: "Zainab Arshad",
    comment: "Thankyou so much for amazing products 😍😍 AMAZING QUALITY...LOVEDDD ITTT🫶🏻🫶🏻🫶🏻 And thank you for the free gift 🥹🥹🥹"
  },
  {
    id: 2,
    name: "strvvlight",
    comment: "Assalamualaikum dear! I received my parcel and I love it 💓 both the size and quality is amazing and Thanku again for your cooperation and for gift too, will order again InshaAllah"
  },
  {
    id: 3,
    name: "Jasmine",
    comment: "I loved studs.They are so pretty. Satisfied with the quality and the best part is they have the best price.Really glad with this purchase."
  },
  {
    id: 4,
    name: "Sawera",
    comment: "Assalamualaikum dear...got the parcel and am amazed with the quality of the things... Jazakallah dear...stay always blessed"
  },
  {
    id: 5,
    name: "Urooj",
    comment: "Absolutely loved this.❤️...the perfect blend of jewelry for me and colorful accessories for my little one.. beautiful variety and great quality"
  }
];

export default function ReviewTextSlider() {
  const sliderRef = useRef(null);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);

  const duplicatedReviews = [...STATIC_REVIEWS, ...STATIC_REVIEWS];
  const totalOriginalItems = STATIC_REVIEWS.length;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalDots = Math.ceil(totalOriginalItems / itemsPerPage);

  const handleNext = () => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    const currentScroll = slider.scrollLeft;

    // Mobile screen par exact view width nikalne ke liye slider.clientWidth best hai
    const stepWidth = window.innerWidth < 640 ? slider.clientWidth : (slider.scrollWidth / (totalOriginalItems * 2)) * itemsPerPage;
    let targetScroll = currentScroll + stepWidth;

    if (currentScroll >= (slider.scrollWidth / 2)) {
      slider.scrollLeft = currentScroll - (slider.scrollWidth / 2);
      targetScroll = slider.scrollLeft + stepWidth;
    }

    slider.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    setCurrentIndex((prev) => (prev === totalDots - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    const currentScroll = slider.scrollLeft;

    const stepWidth = window.innerWidth < 640 ? slider.clientWidth : (slider.scrollWidth / (totalOriginalItems * 2)) * itemsPerPage;
    let targetScroll = currentScroll - stepWidth;

    if (currentScroll <= 10) {
      slider.scrollLeft = (slider.scrollWidth / 2);
      targetScroll = slider.scrollLeft - stepWidth;
    }

    slider.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    setCurrentIndex((prev) => (prev === 0 ? totalDots - 1 : prev - 1));
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <section className="w-full pb-20 overflow-hidden" style={{ backgroundColor: '#f7f2e6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- CENTERED HEADER TEXT WITH SCROLL MOTION --- */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-[#3A2E28] font-semibold block mb-3">
            Real Chats, Real Love
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Our Happy <span className="italic">Customers</span>
          </h2>
        </motion.div>

        {/* --- TEXT CARDS OFFSET CAROUSEL TRACK --- */}
        <motion.div
          ref={sliderRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex overflow-x-auto scrollbar-none pb-10 pt-2 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {duplicatedReviews.map((review, index) => (
            <motion.div
              key={`${review.id}-${index}`}
              variants={itemVariants}
              className="flex-shrink-0 flex justify-center items-center w-full sm:w-1/2 lg:w-1/3 px-4"
            >
              {/* 🔑 RETRO SHADOW CARD DESIGN */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-[320px] h-[240px] group mb-2 mx-auto cursor-pointer"
              >

                {/* Back Solid Accent Block */}
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-[#4C4039] border border-[#3a2e28] transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />

                {/* Front Text Canvas */}
                <div className="absolute inset-0 bg-white border border-[#3a2e28] p-6 flex flex-col justify-between shadow-sm transition-transform duration-300">

                  {/* Top: 5 Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-[#3a2e28] text-[#3a2e28]" />
                    ))}
                  </div>

                  {/* Center: Review Comment Text */}
                  <p className="text-sm md:text-base text-[#3a2e28]/90 font-light leading-relaxed line-clamp-4 [font-family:'Plus_Jakarta_Sans',sans-serif]">
                    {review.comment}
                  </p>

                  {/* Bottom: Reviewer Name */}
                  <div className="text-sm font-bold tracking-wider text-[#2D2524] uppercase [font-family:'Plus_Jakarta_Sans',sans-serif]">
                    {review.name}
                  </div>

                </div>

              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- CENTERED CONTROLS (ARROWS & DOTS) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center gap-6 mt-6"
        >

          {/* Retro Navigation Arrows */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handlePrev}
              className="relative p-3 bg-white border border-[#3a2e28] text-[#3a2e28] transition-all duration-300 cursor-pointer"
              style={{ boxShadow: '3px 3px 0px 0px #4C4039' }}
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleNext}
              className="relative p-3 bg-white border border-[#3a2e28] text-[#3a2e28] transition-all duration-300 cursor-pointer"
              style={{ boxShadow: '3px 3px 0px 0px #4C4039' }}
            >
              <ChevronRight size={18} strokeWidth={2} />
            </motion.button>
          </div>

          {/* Timeline Indicators */}
          {totalDots > 1 && (
            <div className="flex justify-center items-center gap-2.5">
              {[...Array(totalDots)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (sliderRef.current) {
                      const stepWidth = window.innerWidth < 640 ? sliderRef.current.clientWidth : (sliderRef.current.scrollWidth / (totalOriginalItems * 2)) * itemsPerPage;
                      sliderRef.current.scrollTo({
                        left: idx * stepWidth,
                        behavior: 'smooth'
                      });
                      setCurrentIndex(idx);
                    }
                  }}
                  className={`h-[3px] transition-all duration-500 rounded-full cursor-pointer ${currentIndex === idx
                      ? 'w-8 bg-[#4C4039]'
                      : 'w-2 bg-[#4C4039]/25 hover:bg-[#3a2e28]/45'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </motion.div>

      </div>
    </section>
  );
}