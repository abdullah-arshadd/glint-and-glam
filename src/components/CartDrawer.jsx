'use client';
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden [font-family:'Plus_Jakarta_Sans',sans-serif]">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={toggleCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div 
          className="w-screen max-w-md shadow-2xl flex flex-col justify-between"
          style={{ backgroundColor: '#f5f3ed' }}
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} style={{ color: '#3a2e28' }} />
              <h2 className="text-xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                Shopping Bag ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
            </div>
            <button 
              onClick={toggleCart} 
              className="p-2 hover:opacity-70 transition-opacity cursor-pointer text-[#3a2e28]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag size={40} className="mb-3 opacity-30" style={{ color: '#3a2e28' }} />
                <p className="text-sm font-light opacity-70" style={{ color: '#3a2e28' }}>
                  Your bag is currently empty
                </p>
                <button
                  onClick={toggleCart}
                  className="mt-6 px-6 py-2.5 uppercase text-[10px] tracking-widest font-semibold transition-all shadow-xs cursor-pointer"
                  style={{ backgroundColor: '#3a2e28', color: '#ffffff' }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const variant = item.variant;
                const product = variant?.product;
                const productImage = product?.images?.[0]?.url || '/fallback-image.jpg';

                return (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-3 bg-white/60 border rounded-none items-center"
                    style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}
                  >
                    <img 
                      src={productImage} 
                      alt={product?.name} 
                      className="w-16 h-20 object-cover bg-gray-50 flex-shrink-0" 
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
                          <button 
                            onClick={() => updateQuantity(item.id, -1)} 
                            className="px-2 py-1 hover:bg-gray-50 cursor-pointer"
                            style={{ color: '#3a2e28' }}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-[11px] px-2 font-medium" style={{ color: '#3a2e28' }}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)} 
                            className="px-2 py-1 hover:bg-gray-50 cursor-pointer"
                            style={{ color: '#3a2e28' }}
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="p-2 opacity-50 hover:opacity-100 text-red-700 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t bg-white/80 backdrop-blur-md space-y-3" style={{ borderColor: 'rgba(58, 46, 40, 0.1)' }}>
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs uppercase tracking-widest font-semibold opacity-70" style={{ color: '#3a2e28' }}>Subtotal</span>
                <span className="text-lg font-bold" style={{ color: '#3a2e28' }}>Rs. {cartTotal.toLocaleString()} PKR</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="block w-full text-white text-center py-3.5 uppercase tracking-widest text-xs font-semibold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
                  style={{ backgroundColor: '#3a2e28' }}
                >
                  Proceed to Checkout
                </Link>

                <button
                  type="button"
                  onClick={toggleCart}
                  className="block w-full text-center py-3 uppercase tracking-widest text-[11px] font-semibold transition-colors border cursor-pointer"
                  style={{ 
                    borderColor: 'rgba(58, 46, 40, 0.2)', 
                    color: '#3a2e28', 
                    backgroundColor: 'transparent' 
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}