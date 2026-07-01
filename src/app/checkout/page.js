'use client';
import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, Wallet, Truck } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Lahore',
    notes: ''
  });

  // Payment method state configuration (Keeping layout flexible for future integration)
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Options: 'COD', 'CARD', 'WALLET'

  const shippingFee = 250;
  const grandTotal = cartTotal + shippingFee;

  // 🚀 AUTOMATIC EMPTY CART REDIRECTION SYSTEM (Bypasses direct URL access without login)
  React.useEffect(() => {
    if (!loading && cartItems.length === 0) {
      toast.error("Your cart is empty! Add some items before checking out.");
      window.location.href = '/cart';
    }
  }, [cartItems, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/[^0-9+]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form Validations for Pakistani Standards
  const validateForm = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      toast.error("Please enter a valid full name (minimum 3 characters).");
      return false;
    }

    const pakPhoneRegex = /^((\+92)|(0092)|(0))?3[0-9]{9}$/;
    if (!pakPhoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid Pakistani phone number (e.g., 03001234567).");
      return false;
    }

    if (!formData.address.trim() || formData.address.trim().length < 10) {
      toast.error("Please provide a complete shipping address for accurate delivery.");
      return false;
    }

    if (!formData.city) {
      toast.error("Please select a target destination city.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          notes: formData.notes,
          items: cartItems,
          total: grandTotal,
          paymentMethod: paymentMethod
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request layout");
      }

      // 🛒 CASE A: CASH ON DELIVERY (COD) FLOW
      if (paymentMethod === 'COD') {
        toast.success("Order Placed Successfully!");
        await clearCart();
        window.location.href = `/order-success?orderId=${data.orderId}`;
        return;
      }

    } catch (error) {
      console.error("Checkout submission error:", error);
      toast.error(error.message || "Something went wrong while placing order");
      setLoading(false);
    }
  };

  // Prevent UI flashing while redirecting an empty cart user
  if (cartItems.length === 0) return null;

  return (
    <main className="min-h-screen py-12 lg:py-20 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link Wrapper */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-colors duration-200 font-medium opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
            <ArrowLeft size={14} /> Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* --- LEFT: Shipping Form & Payments Panel --- */}
          <div className="lg:col-span-7 space-y-8">

            {/* Shipping Information Module */}
            <div className="bg-white/60 border p-6 sm:p-10" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <h1 className="text-3xl font-light tracking-wide mb-8 [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                Shipping Information
              </h1>

              <form id="checkout-form" className="space-y-5" onSubmit={handlePlaceOrder}>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>Full Name</label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors bg-white/80" style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }} required disabled={loading} placeholder="e.g. Muhammad Ali" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>Phone Number</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors bg-white/80" style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }} required disabled={loading} placeholder="e.g. 03001234567" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>City</label>
                  <select name="city" value={formData.city} onChange={handleInputChange} className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors bg-white/80 cursor-pointer" style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }} required disabled={loading}>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>Complete Shipping Address</label>
                  <input name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors bg-white/80" style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }} required disabled={loading} placeholder="House/Apartment number, Street layout, Area Sector name" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold block" style={{ color: '#3a2e28', opacity: 0.7 }}>Order Notes (Optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="w-full border px-4 py-3 text-xs focus:border-[#DB93B0] focus:outline-none transition-colors resize-none bg-white/80" placeholder="Notes about your delivery, e.g. special instructions." style={{ borderColor: 'rgba(58, 46, 40, 0.15)', color: '#3a2e28' }} disabled={loading}></textarea>
                </div>
              </form>
            </div>

            {/* Payment Method Selector Panel */}
            <div className="bg-white/60 border p-6 sm:p-10" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <h3 className="text-xl font-light tracking-wide mb-6 [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                Select Payment Method
              </h3>

              <div className="space-y-3">
                {/* Method Option: Cash On Delivery */}
                <div
                  onClick={() => !loading && setPaymentMethod('COD')}
                  className="border p-4 flex items-center justify-between cursor-pointer transition-all duration-300 bg-white/80"
                  style={{ borderColor: paymentMethod === 'COD' ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)', borderWidth: paymentMethod === 'COD' ? '1.5px' : '1px' }}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={18} style={{ color: '#3a2e28' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#3a2e28' }}>Cash On Delivery (COD)</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Pay standard cash value upon package home arrival.</p>
                    </div>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: '#3a2e28' }}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3a2e28' }}></div>}
                  </div>
                </div>

                {/* Method Option: Credit/Debit Card */}
                <div
                  onClick={() => !loading && setPaymentMethod('CARD')}
                  className="border p-4 flex items-center justify-between cursor-pointer transition-all duration-300 bg-white/80"
                  style={{ borderColor: paymentMethod === 'CARD' ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)', borderWidth: paymentMethod === 'CARD' ? '1.5px' : '1px' }}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} style={{ color: '#3a2e28' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#3a2e28' }}>Credit / Debit Card</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Secure payment processing via our upcoming bank partner.</p>
                    </div>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: '#3a2e28' }}>
                    {paymentMethod === 'CARD' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3a2e28' }}></div>}
                  </div>
                </div>

                {/* Method Option: Mobile Wallets */}
                <div
                  onClick={() => !loading && setPaymentMethod('WALLET')}
                  className="border p-4 flex items-center justify-between cursor-pointer transition-all duration-300 bg-white/80"
                  style={{ borderColor: paymentMethod === 'WALLET' ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)', borderWidth: paymentMethod === 'WALLET' ? '1.5px' : '1px' }}
                >
                  <div className="flex items-center gap-3">
                    <Wallet size={18} style={{ color: '#3a2e28' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#3a2e28' }}>Easypaisa / JazzCash Mobile Wallet</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Instant transfer from your local mobile wallet setups.</p>
                    </div>
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: '#3a2e28' }}>
                    {paymentMethod === 'WALLET' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3a2e28' }}></div>}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* --- RIGHT: Order Summary Container --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/60 border p-8 space-y-6" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <h2 className="text-xl font-medium border-b pb-4 [font-family:'Cormorant_Garamond',serif] text-lg tracking-wide" style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                Order Summary
              </h2>

              {/* Items Scroll Area */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const variant = item.variant;
                  const product = variant?.product;
                  const productImage = product?.images?.[0]?.url || '/placeholder.jpg';
                  const itemPrice = Number(variant?.price || 0);

                  return (
                    <div key={item.id} className="flex gap-4 items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(58, 46, 40, 0.05)' }}>
                      <div className="flex gap-3 items-center">
                        <img src={productImage} alt={product?.name} className="w-12 h-16 object-cover bg-white border" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }} />
                        <div>
                          <h4 className="text-xs font-medium" style={{ color: '#3a2e28' }}>{product?.name}</h4>
                          <span className="text-[9px] uppercase block mt-0.5 opacity-60" style={{ color: '#3a2e28' }}>Size: {variant?.size}</span>
                          <span className="text-[9px] uppercase block opacity-60" style={{ color: '#3a2e28' }}>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium" style={{ color: '#3a2e28' }}>Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals Breakdown */}
              <div className="border-t pt-4 space-y-2.5 text-xs" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                <div className="flex justify-between" style={{ color: '#3a2e28' }}><span className="opacity-80">Subtotal</span> <span className="font-medium">Rs. {cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between" style={{ color: '#3a2e28' }}><span className="opacity-80">Shipping</span> <span className="font-medium">Rs. {shippingFee.toLocaleString()}</span></div>
                <hr style={{ borderColor: 'rgba(58, 46, 40, 0.05)' }} />
                <div className="flex justify-between font-semibold text-sm mt-1" style={{ color: '#3a2e28' }}>
                  <span>Total Amount</span> <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA Trigger */}
              <button
                type="submit"
                form="checkout-form"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                disabled={loading}
                className="w-full text-white py-4 uppercase tracking-[0.2em] text-[10px] font-semibold transition-all duration-300 cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: loading ? '#d1d5db' : (isHovered ? '#BD977A' : '#3a2e28'),
                }}
              >
                {loading ? "Processing Order..." : `Place Order (${paymentMethod})`}
              </button>

              {/* Secure Checkout Badge */}
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-dashed border-gray-200 text-[10px] text-gray-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-600" /> Secure SSL Encrypted Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}