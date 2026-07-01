'use client';
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
    
    // Dynamic state-based hover control for the "Continue Shopping" button
    const [isHovered, setIsHovered] = useState(false);

    if (cartItems.length === 0) {
        return (
            // 🚀 FIXED: Height ko strict calc kiya hai aur overflow-hidden lagaya hai taakay vertical scroll har haal me block ho jaye
            <div className="w-full h-[calc(100vh-80px)] flex flex-col overflow-hidden" style={{ backgroundColor: '#f7f2e6' }}>
                <main className="w-full flex-1 flex flex-col items-center justify-center py-10 px-4 [font-family:'Plus_Jakarta_Sans',sans-serif]">
                    <ShoppingBag size={48} className="mb-4 opacity-40" style={{ color: '#3a2e28' }} />
                    <h2 className="text-xl font-light tracking-wide [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                        Your bag is empty
                    </h2>
                    
                    <Link
                        href="/shop"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="mt-6 px-8 py-3.5 uppercase text-xs tracking-widest transition-all duration-300 font-semibold shadow-xs"
                        style={{
                            backgroundColor: isHovered ? '#BD977A' : '#3a2e28',
                            color: '#ffffff',
                            display: 'inline-block',
                            textAlign: 'center'
                        }}
                    >
                        Continue Shopping
                    </Link>
                </main>
            </div>
        );
    }

    return (
        // 🚀 FIXED: Normal scroll format jab items zyada hon
        <main className="w-full min-h-screen py-16 px-4 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
            <div className="max-w-4xl mx-auto">
                
                <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-10 [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                    Shopping Bag ({cartItems.length})
                </h1>

                {/* --- Cart Items Container --- */}
                <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 shadow-xs border" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                    <div className="space-y-6">
                        {cartItems.map((item) => {
                            const variant = item.variant;
                            const product = variant?.product;
                            const productImage = product?.images?.[0]?.url || '/fallback-image.jpg';

                            return (
                                <div key={item.id} className="flex gap-4 items-center border-b pb-6 last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                                    <img src={productImage} alt={product?.name} className="w-20 h-24 object-cover rounded-md bg-gray-50 shadow-xs" />

                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium" style={{ color: '#3a2e28' }}>
                                            {product?.name} <span className="text-xs opacity-60 font-light">({variant?.size})</span>
                                        </h3>
                                        <p className="text-xs font-light mt-1 opacity-80" style={{ color: '#3a2e28' }}>
                                            Rs. {Number(variant?.price).toLocaleString()}
                                        </p>

                                        {/* --- Quantity Selector --- */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center bg-white border rounded-md overflow-hidden" style={{ borderColor: 'rgba(58, 46, 40, 0.15)' }}>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, -1)} 
                                                    className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
                                                    style={{ color: '#3a2e28' }}
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <span className="text-xs px-2 font-medium" style={{ color: '#3a2e28' }}>{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, 1)} 
                                                    className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
                                                    style={{ color: '#3a2e28' }}
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={() => removeFromCart(item.id)} className="opacity-60 hover:opacity-100 text-red-700 transition-opacity p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Subtotal Summary --- */}
                <div className="mt-8 bg-white/80 backdrop-blur-md p-6 rounded-xl border shadow-xs" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs uppercase tracking-widest font-medium opacity-70" style={{ color: '#3a2e28' }}>Subtotal</span>
                        <span className="text-xl font-semibold" style={{ color: '#3a2e28' }}>Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    
                    <Link
                        href="/checkout"
                        className="block w-full text-white text-center py-4 uppercase tracking-widest text-xs font-semibold rounded-md transition-opacity duration-300 hover:opacity-90 shadow-xs"
                        style={{ backgroundColor: '#3a2e28' }}
                    >
                        Proceed to Checkout
                    </Link>
                </div>
                
            </div>
        </main>
    );
}