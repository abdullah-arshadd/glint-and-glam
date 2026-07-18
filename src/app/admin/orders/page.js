'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Eye, Clock, CheckCircle, Truck, AlertCircle, ChevronLeft, ChevronRight, XCircle, DollarSign, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🌟 NEW: Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Change this to show more items per page
    
    // Modal states for Cancellation
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [submittingCancel, setSubmittingCancel] = useState(false);

    // Modal states for Payment Proof
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [currentProof, setCurrentProof] = useState({ image: null, orderId: null });

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
        
        // 🌟 Reset to page 1 whenever filters or search terms change
        setCurrentPage(1);
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
        if (newStatus === 'CANCELLED') {
            setSelectedOrderId(orderId);
            setCancelReason('');
            setIsCancelModalOpen(true);
            return;
        }

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

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) {
            toast.error("Please enter a reason for cancellation");
            return;
        }

        setSubmittingCancel(true);
        try {
            const res = await fetch(`/api/orders/${selectedOrderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'CANCELLED',
                    cancellationReason: cancelReason 
                })
            });

            if (res.ok) {
                toast.success(`Order #${selectedOrderId} has been cancelled`);
                setIsCancelModalOpen(false);
                setSelectedOrderId(null);
                setCancelReason('');
                fetchOrders();
            } else {
                toast.error("Failed to cancel the order");
            }
        } catch (error) {
            console.error("Cancellation error:", error);
            toast.error("Something went wrong");
        } finally {
            setSubmittingCancel(false);
        }
    };

    const handlePaymentStatusChange = async (orderId, paymentStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus }) 
            });

            if (res.ok) {
                toast.success(`Payment status updated to ${paymentStatus}`);
                fetchOrders();
            } else {
                toast.error("Payment status update fail hogaya");
            }
        } catch (error) {
            console.error("Payment sync error:", error);
            toast.error("Database alignment failed");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100/70 text-amber-800 px-3 py-1.5 rounded-sm';
            case 'SHIPPED': return 'bg-blue-100/70 text-blue-800 px-3 py-1.5 rounded-sm';
            case 'DELIVERED': return 'bg-green-100/70 text-green-800 px-3 py-1.5 rounded-sm';
            case 'CANCELLED': return 'bg-red-100/70 text-red-800 px-3 py-1.5 rounded-sm';
            default: return 'bg-gray-100 text-gray-700 px-3 py-1.5 rounded-sm';
        }
    };

    const getPaymentStyle = (status) => {
        switch (status) {
            case 'FULL_PAID': return 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-xs font-semibold';
            case 'HALF_PAID': return 'bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded-xs font-semibold';
            case 'UNPAID': 
            default: 
                return 'bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-xs font-semibold';
        }
    };

    // 🌟 PAGINATION MATH CALCULATION
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="space-y-6 [font-family:'Plus_Jakarta_Sans',sans-serif]">
            <div>
                <h1 className="text-2xl text-[#2D2524] [font-family:'Cormorant_Garamond',serif] font-medium tracking-wide">
                    Orders Management
                </h1>
                <p className="text-xs text-gray-400 mt-1">Track customer purchases, update shipping details, adjust financial settlement flows, and filter operational states.</p>
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
                        
                        {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
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
            <div className="bg-white border border-gray-100 overflow-x-auto shadow-xs flex flex-col">
                {loading ? (
                    <div className="p-8 text-center text-xs text-gray-400">Syncing live orders data...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">No matching orders found.</div>
                ) : (
                    <>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                        <th className="p-4 w-[140px]">Order ID</th>
                                        <th className="p-4 w-auto">Customer</th>
                                        <th className="p-4 w-[120px]">City</th>
                                        <th className="p-4 w-[130px]">Amount</th>
                                        <th className="p-4 w-[150px]">Payment Settlement</th>
                                        <th className="p-4 w-[110px]">Logistics Status</th>
                                        <th className="p-4 text-right w-[140px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-gray-50">
                                    {/* 🌟 Using currentOrders instead of filteredOrders mapped array */}
                                    {currentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                                            <td className="p-4 font-semibold text-[#2D2524] truncate">
                                                #{order.id}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-gray-700 truncate">{order.fullName}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{order.phone}</p>
                                            </td>
                                            <td className="p-4 text-gray-500 truncate">{order.city}</td>
                                            <td className="p-4 font-medium text-gray-800 whitespace-nowrap">Rs. {Number(order.totalAmount || order.total || 0).toLocaleString()}</td>
                                            
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2 items-start">
                                                    <div className="flex gap-2 w-full">
                                                        <select
                                                            value={order.paymentStatus || 'UNPAID'}
                                                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                            className={`border border-gray-100 p-1 font-semibold text-[9px] outline-none rounded-xs cursor-pointer ${getPaymentStyle(order.paymentStatus || 'UNPAID')}`}
                                                        >
                                                            <option value="UNPAID">UNPAID</option>
                                                            <option value="HALF_PAID">HALF PAID</option>
                                                            <option value="FULL_PAID">FULL PAID</option>
                                                        </select>
                                                    </div>

                                                    {order.paymentProof && (
                                                        <button
                                                            onClick={() => {
                                                                setCurrentProof({ image: order.paymentProof, orderId: order.id });
                                                                setIsProofModalOpen(true);
                                                            }}
                                                            className="flex items-center gap-1.5 text-[10px] text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-wider transition-colors"
                                                        >
                                                            <ImageIcon size={12} /> View Proof
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <span className={`inline-block text-[9px] font-bold tracking-wider uppercase whitespace-nowrap ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="border border-gray-200 p-1.5 text-[10px] bg-white text-gray-600 outline-none focus:border-[#DB93B0] cursor-pointer rounded-xs w-full max-w-[120px]"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancel Order</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 🌟 PAGINATION CONTROLS */}
                        {totalPages > 0 && (
                            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/30 px-4 py-3 sm:px-6">
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                                            Showing <span className="font-bold text-gray-700">{indexOfFirstOrder + 1}</span> to <span className="font-bold text-gray-700">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of <span className="font-bold text-gray-700">{filteredOrders.length}</span> Orders
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Items Per Page Selector */}
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-medium text-gray-500 tracking-wider">
                                            Rows:
                                            <select 
                                                value={itemsPerPage} 
                                                onChange={(e) => {
                                                    setItemsPerPage(Number(e.target.value));
                                                    setCurrentPage(1); // Reset to page 1 on changing quantity
                                                }}
                                                className="border border-gray-200 rounded-xs px-1.5 py-1 outline-none bg-white cursor-pointer"
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>

                                        {/* Page Numbers Navigation */}
                                        <nav className="isolate inline-flex -space-x-px rounded-xs shadow-xs" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center rounded-l-xs px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                            <span className="relative inline-flex items-center px-4 py-1.5 text-[10px] font-bold text-gray-700 ring-1 ring-inset ring-gray-200">
                                                PAGE {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center rounded-r-xs px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                                
                                {/* Mobile Version Pagination */}
                                <div className="flex flex-1 items-center justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-xs border border-gray-200 bg-white px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-[10px] font-bold text-gray-600">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-xs border border-gray-200 bg-white px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* PAYMENT PROOF IMAGE MODAL */}
            {isProofModalOpen && (
                <div className="fixed inset-0 bg-[#2D2524]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsProofModalOpen(false)}>
                    <div 
                        className="bg-white w-full max-w-lg p-6 border border-gray-100 shadow-2xl rounded-sm transform transition-all flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-[#2D2524] [font-family:'Cormorant_Garamond',serif]">
                                    Payment Screenshot
                                </h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Order #{currentProof.orderId}</p>
                            </div>
                            <button onClick={() => setIsProofModalOpen(false)} className="text-gray-400 hover:text-rose-600 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto flex justify-center bg-gray-50 border border-gray-100 p-2 rounded-xs">
                            <img 
                                src={currentProof.image} 
                                alt={`Proof for Order #${currentProof.orderId}`} 
                                className="max-w-full h-auto object-contain"
                            />
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={() => setIsProofModalOpen(false)}
                                className="px-5 py-2 bg-[#3a2e28] text-white font-medium tracking-wide uppercase text-[10px] hover:bg-[#BD977A] transition-colors rounded-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CANCELLATION MODAL */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 bg-[#2D2524]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md p-6 border border-gray-100 shadow-xl rounded-xs transform transition-all space-y-4">
                        <div className="flex items-center gap-2.5 text-rose-600">
                            <XCircle size={20} />
                            <h3 className="text-base font-semibold text-[#2D2524] [font-family:'Cormorant_Garamond',serif]">
                                Cancel Order #{selectedOrderId}
                            </h3>
                        </div>
                        
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Specify the core issue or rationale behind this closure. This notation will be forwarded contextually to the consumer metrics screen.
                        </p>

                        <form onSubmit={handleCancelSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                                    Reason for Cancellation
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g., Out of stock items, Invalid delivery address..."
                                    rows={3}
                                    required
                                    className="w-full text-xs p-3 border border-gray-200 focus:border-rose-400 focus:outline-none resize-none rounded-xs bg-gray-50/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 text-xs">
                                <button
                                    type="button"
                                    disabled={submittingCancel}
                                    onClick={() => {
                                        setIsCancelModalOpen(false);
                                        setSelectedOrderId(null);
                                    }}
                                    className="px-4 py-2 border border-gray-200 text-gray-500 tracking-wide uppercase text-[10px] hover:bg-gray-50 rounded-xs"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingCancel}
                                    className="px-4 py-2 bg-rose-600 text-white font-medium tracking-wide uppercase text-[10px] hover:bg-rose-700 disabled:opacity-50 rounded-xs"
                                >
                                    {submittingCancel ? 'Processing...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}