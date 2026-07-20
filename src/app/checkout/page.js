'use client';
import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Truck, Building2, UploadCloud } from 'lucide-react';
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

  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  
  // 🌟 NEW: State to store the uploaded screenshot (base64)
  const [paymentProof, setPaymentProof] = useState(null);
  const [fileName, setFileName] = useState('');

  const shippingFee = 250;
  const grandTotal = cartTotal + shippingFee;

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

  // 🌟 NEW: Function to handle image upload and convert to base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please upload an image under 5MB.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result); // Base64 string ban jayegi
    };
    reader.readAsDataURL(file);
  };

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
      toast.error("Please provide a complete shipping address.");
      return false;
    }

    // 🌟 NEW: Validate payment proof
    if (!paymentProof) {
      toast.error("Please upload the payment screenshot to proceed.");
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
          paymentMethod: paymentMethod,
          paymentProof: paymentProof // 🌟 NEW: Sending screenshot to backend
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      toast.success("Order Placed Successfully!");
      await clearCart();
      window.location.href = `/order-success?orderId=${data.orderId}`;
      return;

    } catch (error) {
      console.error("Checkout submission error:", error);
      toast.error(error.message || "Something went wrong while placing order");
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return null;

  // 🌟 Reusable Bank Details Component
  const BankAccountInfo = () => (
    <div className="mt-3 bg-[#f5f3ed] p-3 rounded-md text-xs border border-[rgba(58,46,40,0.1)]">
      <p className="font-semibold mb-1.5" style={{ color: '#3a2e28' }}>Bank Account Details:</p>
      <div className="space-y-1 opacity-80" style={{ color: '#3a2e28' }}>
        <p><span className="font-medium">Bank Name:</span> Easypaisa</p>
        <p><span className="font-medium">Account Title:</span> Raazia Arshad</p>
        <p><span className="font-medium">Account No:</span> 03340657345</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen py-12 lg:py-20 [font-family:'Plus_Jakarta_Sans',sans-serif]" style={{ backgroundColor: '#f5f3ed' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-colors duration-200 font-medium opacity-70 hover:opacity-100" style={{ color: '#3a2e28' }}>
            <ArrowLeft size={14} /> Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">

            {/* Shipping Information Module */}
            <div className="bg-white/60 border p-6 sm:p-10" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <h1 className="text-3xl font-light tracking-wide mb-8 [font-family:'Cormorant_Garamond',serif]" style={{ color: '#3a2e28' }}>
                Shipping Information
              </h1>

              <form id="checkout-form" className="space-y-5" onSubmit={handlePlaceOrder}>
                {/* Form fields same as before... */}
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

              <div className="space-y-4">
                
                {/* 🌟 1. Cash On Delivery Block */}
                <div
                  className="border transition-all duration-300 bg-white/80"
                  style={{ borderColor: paymentMethod === 'COD' ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)', borderWidth: paymentMethod === 'COD' ? '1.5px' : '1px' }}
                >
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => { if(!loading) { setPaymentMethod('COD'); setPaymentProof(null); setFileName(''); }}}>
                    <div className="flex items-center gap-3">
                      <Truck size={18} style={{ color: '#3a2e28' }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#3a2e28' }}>Cash On Delivery (COD)</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">COD Advance Required</p>
                      </div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: '#3a2e28' }}>
                      {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3a2e28' }}></div>}
                    </div>
                  </div>

                  {/* COD Details & Upload Section */}
                  {paymentMethod === 'COD' && (
                    <div className="p-4 pt-0 border-t mt-2" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                      <p className="text-[11px] mt-4 leading-relaxed" style={{ color: '#3a2e28' }}>
                        <span className="font-semibold text-red-600">Note:</span> According to our policy, <strong>delivery payment</strong> is required in advance to process your COD order. Please transfer the amount to the following account and attach the screenshot below.
                      </p>
                      
                      <BankAccountInfo />

                      <div className="mt-4">
                        <label className="text-[10px] uppercase tracking-widest font-semibold block mb-2" style={{ color: '#3a2e28' }}>Attach Payment Proof</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer border border-dashed px-4 py-2 hover:bg-gray-50 transition-colors" style={{ borderColor: '#3a2e28', color: '#3a2e28' }}>
                            <UploadCloud size={14} />
                            <span className="text-xs">{fileName ? "Change Image" : "Upload Screenshot"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                          </label>
                          {fileName && <span className="text-[10px] truncate max-w-[150px]" style={{ color: '#3a2e28' }}>{fileName}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🌟 2. Advance Bank Transfer Block */}
                <div
                  className="border transition-all duration-300 bg-white/80"
                  style={{ borderColor: paymentMethod === 'BANK' ? '#3a2e28' : 'rgba(58, 46, 40, 0.12)', borderWidth: paymentMethod === 'BANK' ? '1.5px' : '1px' }}
                >
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => { if(!loading) { setPaymentMethod('BANK'); setPaymentProof(null); setFileName(''); }}}>
                    <div className="flex items-center gap-3">
                      <Building2 size={18} style={{ color: '#3a2e28' }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#3a2e28' }}>Advance Bank Transfer</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">100% Advance Required</p>
                      </div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: '#3a2e28' }}>
                      {paymentMethod === 'BANK' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3a2e28' }}></div>}
                    </div>
                  </div>

                  {/* BANK Details & Upload Section */}
                  {paymentMethod === 'BANK' && (
                    <div className="p-4 pt-0 border-t mt-2" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                      <p className="text-[11px] mt-4 leading-relaxed" style={{ color: '#3a2e28' }}>
                        <span className="font-semibold text-red-600">Note:</span> A <strong>100% advance payment (Rs. {grandTotal.toLocaleString()})</strong> is required via bank transfer to process your order. Please transfer the amount and attach the screenshot below.
                      </p>
                      
                      <BankAccountInfo />

                      <div className="mt-4">
                        <label className="text-[10px] uppercase tracking-widest font-semibold block mb-2" style={{ color: '#3a2e28' }}>Attach Payment Proof</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer border border-dashed px-4 py-2 hover:bg-gray-50 transition-colors" style={{ borderColor: '#3a2e28', color: '#3a2e28' }}>
                            <UploadCloud size={14} />
                            <span className="text-xs">{fileName ? "Change Image" : "Upload Screenshot"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                          </label>
                          {fileName && <span className="text-[10px] truncate max-w-[150px]" style={{ color: '#3a2e28' }}>{fileName}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* --- RIGHT: Order Summary Container --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/60 border p-8 space-y-6" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
              <h2 className="text-xl font-medium border-b pb-4 [font-family:'Cormorant_Garamond',serif] tracking-wide" style={{ color: '#3a2e28', borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                Order Summary
              </h2>

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

              <div className="border-t pt-4 space-y-2.5 text-xs" style={{ borderColor: 'rgba(58, 46, 40, 0.08)' }}>
                <div className="flex justify-between" style={{ color: '#3a2e28' }}><span className="opacity-80">Subtotal</span> <span className="font-medium">Rs. {cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between" style={{ color: '#3a2e28' }}><span className="opacity-80">Shipping</span> <span className="font-medium">Rs. {shippingFee.toLocaleString()}</span></div>
                <hr style={{ borderColor: 'rgba(58, 46, 40, 0.05)' }} />
                <div className="flex justify-between font-semibold text-sm mt-1" style={{ color: '#3a2e28' }}>
                  <span>Total Amount</span> <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

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
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}