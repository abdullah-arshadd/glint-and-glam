'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ShoppingBag, Truck, Calendar, Hash, Compass } from 'lucide-react';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [isTrackHovered, setIsTrackHovered] = useState(false);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;

    const fetchOrderDetails = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${baseUrl}/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setOrder(data);
        } else {
          console.error("API Error Response Status:", res.status);
          if (isMounted) setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order across network:", error);
        if (isMounted) setOrder(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FBF9F6] [font-family:'Plus_Jakarta_Sans',sans-serif]">
        <h2 className="text-xl font-medium text-[#2D2524] [font-family:'Cormorant_Garamond',serif]">Invalid Order Link</h2>
        <Link href="/shop" className="mt-4 bg-[#2D2524] text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-[#4A3E3D] transition-colors duration-300">
          Go to Shop
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FBF9F6] [font-family:'Plus_Jakarta_Sans',sans-serif]">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-12 h-12 border border-dashed border-[#2D2524]/20 rounded-full"></div>
          <div className="absolute w-12 h-12 border-t-2 border-r-2 border-[#2D2524] rounded-full animate-spin"></div>
          <div className="w-2 h-2 bg-[#BD977A] rounded-full animate-ping"></div>
        </div>
        <p className="text-[10px] text-gray-400 mt-6 tracking-[0.2em] uppercase font-light">Retrieving Receipt Context...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FBF9F6] [font-family:'Plus_Jakarta_Sans',sans-serif]">
        <h2 className="text-xl font-medium text-[#2D2524] [font-family:'Cormorant_Garamond',serif]">Order Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">We couldn't retrieve the details for this order ID.</p>
        <Link href="/shop" className="mt-6 bg-[#2D2524] text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-[#4A3E3D] transition-colors duration-300">
          Return to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBF9F6] py-12 lg:py-20 [font-family:'Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Top Thank You Card */}
        <div className="bg-white border border-gray-100 p-8 text-center shadow-2xs mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2D2524]/5 text-[#2D2524] mb-4">
            <CheckCircle size={26} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl md:text-3xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
            Thank you for your order!
          </h1>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
            Your order has been placed successfully. We are preparing your package for shipment.
          </p>
        </div>

        {/* Meta Info (ID, Date, Status) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 p-4 shadow-2xs flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <Hash size={16} className="text-[#2D2524]/60" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Order ID</span>
              <span className="text-[11px] font-mono text-gray-700 block break-all selection:bg-amber-100">{order.id}</span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-4 shadow-2xs flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <Calendar size={16} className="text-[#2D2524]/60" />
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Date</span>
              <span className="text-xs text-gray-700 font-medium">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-4 shadow-2xs flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <Truck size={16} className="text-[#2D2524]/60" />
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Status</span>
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-[#2D2524] bg-[#2D2524]/5 px-2 py-0.5 rounded-sm mt-0.5">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Order Items Summary */}
          <div className="md:col-span-7 bg-white border border-gray-100 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-[#2D2524] border-b border-gray-100 pb-3 flex items-center gap-2 [font-family:'Cormorant_Garamond',serif] lg:text-base font-semibold">
              <ShoppingBag size={14} className="text-[#2D2524]" /> Items Ordered
            </h3>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto pr-1">
              {order.items?.map((item) => {
                const product = item.variant?.product;
                return (
                  <div key={item.id} className="flex gap-4 py-3 items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-14 bg-gray-50 flex-shrink-0 border border-gray-100">
                        <img src={product?.images?.[0]?.url || "/placeholder.jpg"} alt={product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs text-[#2D2524] font-medium line-clamp-1">{product?.name}</h4>
                        <span className="text-[9px] text-gray-400 uppercase block mt-0.5">Size: {item.variant?.size}</span>
                        <span className="text-[9px] text-gray-400 uppercase block">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">Rs. {(Number(item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-gray-100 pt-3 text-xs flex justify-between font-semibold text-[#2D2524]">
              <span className="uppercase tracking-wider text-gray-400 text-[10px]">Total Amount</span>
              <span className="text-sm font-bold text-[#2D2524]">Rs. {Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          {/* RIGHT: Delivery Details */}
          <div className="md:col-span-5 bg-white border border-gray-100 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-[#2D2524] border-b border-gray-100 pb-3 flex items-center gap-2 [font-family:'Cormorant_Garamond',serif] lg:text-base font-semibold">
              <Truck size={14} className="text-[#2D2524]" /> Shipping Details
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-gray-600">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Customer Name</span>
                <p className="font-medium text-gray-800 mt-0.5">{order.fullName}</p>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Phone</span>
                <p className="font-medium text-gray-800 mt-0.5">{order.phone}</p>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Address</span>
                <p className="font-medium text-gray-800 mt-0.5">{order.address}, {order.city}</p>
              </div>
              {order.notes && (
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Order Notes</span>
                  <p className="text-gray-500 italic mt-0.5 bg-gray-50 p-2 border border-gray-100 rounded-xs">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Actions Layout */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/orders"
            onMouseEnter={() => setIsTrackHovered(true)}
            onMouseLeave={() => setIsTrackHovered(false)}
            className="w-full sm:w-auto px-8 py-3.5 uppercase text-xs tracking-widest transition-all duration-300 font-semibold border border-[#3a2e28] text-center"
            style={{
              backgroundColor: isTrackHovered ? '#3a2e28' : 'transparent',
              color: isTrackHovered ? '#ffffff' : '#3a2e28',
            }}
          >
            Track Order
          </Link>

          <Link
            href="/shop"
            onMouseEnter={() => setIsShopHovered(true)}
            onMouseLeave={() => setIsShopHovered(false)}
            className="w-full sm:w-auto px-8 py-3.5 uppercase text-xs tracking-widest transition-all duration-300 font-semibold text-center border border-transparent"
            style={{
              backgroundColor: isShopHovered ? '#BD977A' : '#3a2e28',
              color: '#ffffff',
            }}
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FBF9F6] [font-family:'Plus_Jakarta_Sans',sans-serif]">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-12 h-12 border border-dashed border-[#2D2524]/20 rounded-full"></div>
          <div className="absolute w-12 h-12 border-t-2 border-r-2 border-[#2D2524] rounded-full animate-spin"></div>
          <div className="w-2 h-2 bg-[#BD977A] rounded-full animate-ping"></div>
        </div>
        <p className="text-[10px] text-gray-400 mt-6 tracking-[0.2em] uppercase font-light">Initializing receipt data...</p>
      </main>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}