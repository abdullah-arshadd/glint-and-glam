'use client';
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden [font-family:'Plus_Jakarta_Sans',sans-serif]">
          {/* Backdrop overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onClick={toggleCart}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              className="w-screen max-w-md shadow-2xl flex flex-col justify-between"
              style={{ backgroundColor: '#f5f3ed' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
            >
              {/* Header */}
              <motion.div
                className="p-5 flex items-center justify-between border-b"
                style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} style={{ color: '#3a2e28' }} />
                  <h2 className="text-xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                    Shopping Bag ({itemCount})
                  </h2>
                </div>
                <motion.button
                  onClick={toggleCart}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="p-2 cursor-pointer text-[#3a2e28]"
                >
                  <X size={20} />
                </motion.button>
              </motion.div>

              {/* Body List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <motion.div
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ShoppingBag size={40} className="mb-3 opacity-30" style={{ color: '#3a2e28' }} />
                    </motion.div>
                    <p className="text-sm font-light opacity-70" style={{ color: '#3a2e28' }}>
                      Your bag is currently empty
                    </p>
                    <motion.button
                      onClick={toggleCart}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-6 px-6 py-2.5 uppercase text-[10px] tracking-widest font-semibold shadow-xs cursor-pointer"
                      style={{ backgroundColor: '#3a2e28', color: '#ffffff' }}
                    >
                      Continue Shopping
                    </motion.button>
                  </motion.div>
                ) : (
                  <AnimatePresence initial={false} mode="popLayout">
                    {cartItems.map((item, index) => {
                      const variant = item.variant;
                      const product = variant?.product;
                      const productImage = product?.images?.[0]?.url || '/fallback-image.jpg';

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 40, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.25 } }}
                          transition={{ delay: 0.05 * index, duration: 0.35, ease: 'easeOut' }}
                          className="flex gap-4 p-3 bg-white/60 border rounded-none items-center"
                          style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}
                        >
                          <motion.img
                            src={productImage}
                            alt={product?.name}
                            className="w-16 h-20 object-cover bg-gray-50 flex-shrink-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold truncate" style={{ color: '#3a2e28' }}>
                              {product?.name}
                            </h4>

                            <div className="flex gap-2 text-[10px] opacity-70 mt-0.5" style={{ color: '#3a2e28' }}>
                              {variant?.size && <span>Size: {variant.size}</span>}
                              {variant?.color && <span>• Color: {variant.color}</span>}
                            </div>

                            <p className="text-xs font-semibold mt-1" style={{ color: '#3a2e28' }}>
                              Rs. {Number(variant?.price || 0).toLocaleString()}
                            </p>

                            {/* Controls */}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center bg-white border" style={{ borderColor: 'rgba(58, 46, 40, 0.15)' }}>
                                <motion.button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  whileTap={{ scale: 0.8 }}
                                  className="px-2 py-1 hover:bg-gray-50 cursor-pointer"
                                  style={{ color: '#3a2e28' }}
                                >
                                  <Minus size={10} />
                                </motion.button>
                                <motion.span
                                  key={item.quantity}
                                  initial={{ scale: 1.3, opacity: 0.5 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-[11px] px-2 font-medium inline-block"
                                  style={{ color: '#3a2e28' }}
                                >
                                  {item.quantity}
                                </motion.span>
                                <motion.button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  whileTap={{ scale: 0.8 }}
                                  className="px-2 py-1 hover:bg-gray-50 cursor-pointer"
                                  style={{ color: '#3a2e28' }}
                                >
                                  <Plus size={10} />
                                </motion.button>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            onClick={() => removeFromCart(item.id)}
                            whileHover={{ scale: 1.15, rotate: -8 }}
                            whileTap={{ scale: 0.85 }}
                            className="p-2 opacity-50 hover:opacity-100 text-red-700 cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer Actions */}
              <AnimatePresence>
                {cartItems.length > 0 && (
                  <motion.div
                    className="p-5 border-t bg-white/80 backdrop-blur-md space-y-3"
                    style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-xs uppercase tracking-widest font-semibold opacity-70" style={{ color: '#3a2e28' }}>
                        Subtotal
                      </span>
                      <motion.span
                        key={cartTotal}
                        initial={{ scale: 1.15 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="text-lg font-bold"
                        style={{ color: '#3a2e28' }}
                      >
                        Rs. {cartTotal.toLocaleString()} PKR
                      </motion.span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href="/checkout"
                          onClick={toggleCart}
                          className="block w-full text-white text-center py-3.5 uppercase tracking-widest text-xs font-semibold shadow-xs cursor-pointer"
                          style={{ backgroundColor: '#3a2e28' }}
                        >
                          Proceed to Checkout
                        </Link>
                      </motion.div>

                      <motion.button
                        type="button"
                        onClick={toggleCart}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        className="block w-full text-center py-3 uppercase tracking-widest text-[11px] font-semibold border cursor-pointer"
                        style={{
                          borderColor: 'rgba(58, 46, 40, 0.2)',
                          color: '#3a2e28',
                          backgroundColor: 'transparent',
                        }}
                      >
                        Continue Shopping
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}