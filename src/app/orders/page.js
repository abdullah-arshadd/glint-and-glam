'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// FontAwesome core aur components imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faTruckFast, faCircleCheck, faBagShopping, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyOrders() {
      setLoading(true);
      try {
        const res = await fetch('/api/orders/user');
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error loading user orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyOrders();
  }, []);

  const getStepStatusIndex = (status) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'SHIPPED': return 2;
      case 'DELIVERED': return 3;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-400 font-sans">
        Syncing your order history...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans text-[#3a2e28] min-h-[80vh]">
      
      {/* Title Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-medium [font-family:'Cormorant_Garamond',serif] text-[#2D2524] tracking-wide uppercase">
          My Orders
        </h1>
        <div className="w-12 h-[1px] bg-[#3a2e28] mx-auto mt-3 opacity-40"></div>
        <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest">
          Track current live shipments and view previous order history.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-gray-100 rounded-lg bg-white shadow-xs">
          <FontAwesomeIcon icon={faBagShopping} className="mx-auto text-gray-300 mb-4 text-2xl" />
          <p className="text-xs text-gray-500 tracking-wide font-light">No orders found in your pipeline history.</p>
          <Link 
            href="/shop" 
            className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest bg-[#3a2e28] text-white px-6 py-3 hover:opacity-80 transition-all font-medium rounded-xs"
          >
            Explore Catalog <FontAwesomeIcon icon={faArrowRight} size="xs" />
          </Link>
        </div>
      ) : (
        <div className="">
          {orders.map((order) => {
            const currentStep = getStepStatusIndex(order.status);
            
            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden mb-6">
                
                {/* Meta Top Strip */}
                <div className="bg-[#f0e8d6]/40 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3 text-[11px]">
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-500">
                    <div>
                      <span className="text-gray-400 uppercase text-[9px] font-semibold tracking-wider block">Order ID</span>
                      <span className="font-mono text-[#3a2e28] font-medium text-xs">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase text-[9px] font-semibold tracking-wider block">Date Placed</span>
                      <span className="text-gray-700 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-gray-400 uppercase text-[9px] font-semibold tracking-wider block">Total Amount</span>
                    <span className="font-bold text-[#3a2e28] text-sm">
                      Rs. {Number(order.totalAmount || order.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Pipeline Section */}
<div className="p-8 bg-white border-b border-gray-200 flex justify-center items-center">
  <div className="w-full max-w-md relative flex items-center justify-between">
    
    {/* Connecting Bar Track */}
    <div className="absolute left-0 right-0 top-4 h-[2px] bg-neutral-100 -z-0 transform -translate-y-1/2"></div>
    <div 
      className="absolute left-0 top-4 h-[2px] bg-[#3a2e28] transition-all duration-500 -z-0 transform -translate-y-1/2"
      style={{ 
        width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' 
      }}
    ></div>

    {/* Step 1: Placed */}
    <div className="flex flex-col items-center relative z-10 text-center flex-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
        currentStep === 1 
          ? 'bg-[#3a2e28] text-white border-[#3a2e28] shadow-xs' 
          : currentStep > 1 
            ? 'bg-[#f0e8d6] text-[#3a2e28] border-[#3a2e28]/30' 
            : 'bg-white text-neutral-400 border-neutral-200'
      }`}>
        <FontAwesomeIcon icon={faBoxOpen} className="text-xs" />
      </div>
      <span className={`text-[9px] uppercase font-bold tracking-widest mt-2.5 block ${
        currentStep === 1 ? 'text-[#3a2e28] font-extrabold' : currentStep > 1 ? 'text-[#3a2e28]/80 font-medium' : 'text-neutral-400'
      }`}>
        Placed
      </span>
    </div>

    {/* Step 2: Shipped */}
    <div className="flex flex-col items-center relative z-10 text-center flex-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
        currentStep === 2 
          ? 'bg-[#3a2e28] text-white border-[#3a2e28] shadow-xs' 
          : currentStep > 2 
            ? 'bg-[#f0e8d6] text-[#3a2e28] border-[#3a2e28]/30' 
            : 'bg-white text-neutral-400 border-neutral-200'
      }`}>
        <FontAwesomeIcon icon={faTruckFast} className="text-xs" />
      </div>
      <span className={`text-[9px] uppercase font-bold tracking-widest mt-2.5 block ${
        currentStep === 2 ? 'text-[#3a2e28] font-extrabold' : currentStep > 2 ? 'text-[#3a2e28]/80 font-medium' : 'text-neutral-400'
      }`}>
        Shipped
      </span>
    </div>

    {/* Step 3: Delivered */}
    <div className="flex flex-col items-center relative z-10 text-center flex-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
        currentStep === 3 
          ? 'bg-[#3a2e28] text-white border-[#3a2e28] shadow-xs' 
          : 'bg-white text-neutral-400 border-neutral-200'
      }`}>
        <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
      </div>
      <span className={`text-[9px] uppercase font-bold tracking-widest mt-2.5 block ${
        currentStep === 3 ? 'text-[#3a2e28] font-extrabold' : 'text-neutral-400'
      }`}>
        Delivered
      </span>
    </div>

  </div>
</div>

                {/* Items List Rendering */}
                <div className="divide-y divide-gray-50 px-6 bg-white">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 py-5">
                      
                      {/* Product Placeholder Image Layout */}
                      <div className="w-16 h-20 bg-[#fbf9f6] flex-shrink-0 border border-gray-100 overflow-hidden flex items-center justify-center rounded">
                        {item.variant?.product?.images?.[0]?.url || item.variant?.product?.imageUrl ? (
                          <img 
                            src={item.variant?.product?.images?.[0]?.url || item.variant?.product?.imageUrl} 
                            alt={item.variant?.product?.name} 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <FontAwesomeIcon icon={faBagShopping} className="text-gray-300 text-sm" />
                        )}
                      </div>

                      {/* Info Metadata */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-[#2D2524] uppercase tracking-wider truncate">
                          {item.variant?.product?.name || "Premium Jewelry Item"}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-medium">
                          <p>Size: <span className="text-[#3a2e28] font-bold">{item.variant?.size || 'Standard'}</span></p>
                          <span className="w-[3px] h-[3px] bg-gray-300 rounded-full"></span>
                          <p>Qty: <span className="text-[#3a2e28] font-bold">{item.quantity}</span></p>
                        </div>
                      </div>

                      {/* Pricing Unit */}
                      <div className="text-xs font-semibold text-[#2D2524] text-right whitespace-nowrap">
                        Rs. {Number(item.price * item.quantity).toLocaleString()}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}