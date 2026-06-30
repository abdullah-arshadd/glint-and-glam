'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Eye, Clock, CheckCircle, Truck, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const fetchOrders = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/orders');
          if (res.ok) {
              const data = await res.json();
              setOrders(Array.isArray(data) ? data : []);
              setFilteredOrders(Array.isArray(data) ? data : []);
          }
      } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error("Orders load nahi ho sakay");
      } finally {
          setLoading(false);
      }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;
        if (statusFilter !== 'ALL') {
            result = result.filter(o => o.status === statusFilter);
        }
        if (searchTerm.trim() !== '') {
            result = result.filter(o =>
                o.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id?.toString().includes(searchTerm) ||
                o.phone?.includes(searchTerm)
            );
        }
        setFilteredOrders(result);
    }, [statusFilter, searchTerm, orders]);

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
          setCanScrollLeft(container.scrollLeft > 5);
          setCanScrollRight(container.scrollLeft < (container.scrollWidth - container.clientWidth - 5));
      }
    };

    useEffect(() => {
      handleScroll();
      window.addEventListener('resize', handleScroll);
      return () => window.removeEventListener('resize', handleScroll);
    }, [orders]);

    const scroll = (direction) => {
      const container = scrollContainerRef.current;
      if (container) {
          const scrollAmount = direction === 'left' ? -180 : 180;
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                toast.success(`Order #${orderId} status updated to ${newStatus}`);
                fetchOrders(); 
            } else {
                toast.error("Status update fail hogaya");
            }
        } catch (error) {
            console.error("Status patch error:", error);
            toast.error("Something went wrong");
        }
    };

    // 🔑 Fixed: Removed 'border' class and tweaked backgrounds for cleaner look
    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100/70 text-amber-800 px-3 py-1.5 rounded-sm';
            case 'SHIPPED': return 'bg-blue-100/70 text-blue-800 px-3 py-1.5 rounded-sm';
            case 'DELIVERED': return 'bg-green-100/70 text-green-800 px-3 py-1.5 rounded-sm';
            default: return 'bg-gray-100 text-gray-700 px-3 py-1.5 rounded-sm';
        }
    };

    return (
        <div className="space-y-6 [font-family:'Plus_Jakarta_Sans',sans-serif]">
            <div>
                <h1 className="text-2xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
                    Orders Management
                </h1>
                <p className="text-xs text-gray-400 mt-1">Track customer purchases, update shipping details, and filter cash on delivery states.</p>
            </div>

            {/* FILTERS & SEARCH BAR */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-gray-100">
                <div className="w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search by name, order ID, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-200 px-4 py-2 text-xs focus:border-[#DB93B0] focus:outline-none bg-gray-50/10"
                    />
                </div>

                <div className="relative w-full sm:w-auto flex items-center gap-1 group">
                    {canScrollLeft && (
                        <button 
                          onClick={() => scroll('left')} 
                          className="absolute -left-3 z-10 p-1.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 hover:text-black shadow-lg cursor-pointer transition-opacity animate-fade-in sm:block hidden"
                        >
                            <ChevronLeft size={14} />
                        </button>
                    )}

                    <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex gap-2 w-full sm:w-auto sm:overflow-x-auto overflow-x-auto scroll-smooth no-scrollbar"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        <style dangerouslySetInnerHTML={{__html: `
                            div.no-scrollbar::-webkit-scrollbar { display: none; }
                            div.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                        `}} />
                        
                        {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-[10px] uppercase font-semibold tracking-wider transition-all cursor-pointer border whitespace-nowrap ${statusFilter === status
                                        ? 'bg-[#DB93B0] text-white border-[#DB93B0]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:text-[#DB93B0]'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {canScrollRight && (
                        <button 
                          onClick={() => scroll('right')} 
                          className="absolute -right-3 z-10 p-1.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 hover:text-black shadow-lg cursor-pointer transition-opacity animate-fade-in sm:block hidden"
                        >
                            <ChevronRight size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="bg-white border border-gray-100 overflow-x-auto shadow-xs">
                {loading ? (
                    <div className="p-8 text-center text-xs text-gray-400">Syncing live orders data...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">No matching orders found.</div>
                ) : (
                    <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                <th className="p-4 w-[160px]">Order ID</th>
                                <th className="p-4 w-auto">Customer</th>
                                <th className="p-4 w-[130px]">City</th>
                                <th className="p-4 w-[130px]">Amount</th>
                                <th className="p-4 w-[110px]">Status</th>
                                <th className="p-4 text-right w-[110px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-gray-50">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                                    <td className="p-4 font-semibold text-[#2D2524] truncate">#{order.id}</td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-700 truncate">{order.fullName}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{order.phone}</p>
                                    </td>
                                    <td className="p-4 text-gray-500 truncate">{order.city}</td>
                                    <td className="p-4 font-medium text-gray-800 whitespace-nowrap">Rs. {Number(order.totalAmount || order.total || 0).toLocaleString()}</td>
                                    <td className="p-4">
                                        {/* 🔑 Border class removed from here */}
                                        <span className={`inline-block text-[9px] font-bold tracking-wider uppercase whitespace-nowrap ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="border border-gray-200 p-1.5 text-[10px] bg-white text-gray-600 outline-none focus:border-[#DB93B0] cursor-pointer rounded-xs"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}