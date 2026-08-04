'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Page open hote hi data fetch karo
  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Database (API) se Cart Items lekar aana
  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Cart fetch karne mein error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // 3. Database mein product variant add karna (Strictly adds 1 quantity & opens side drawer)
  const addToCart = async (variantId, stockAvailable = 999) => {
    if (!variantId) {
      toast.error("Invalid product variant!");
      return;
    }

    // Single item click behavior lock
    const qtyToAdd = 1;
    const existing = cartItems.find(item => item.variantId === variantId);
    const currentQtyInCart = existing ? existing.quantity : 0;
    const requestedTotalQty = currentQtyInCart + qtyToAdd;

    // Stock Guardrail Check
    if (stockAvailable !== undefined && requestedTotalQty > stockAvailable) {
      toast.error(`Sorry, only ${stockAvailable} available in stock!`);
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: qtyToAdd }) // Always passes exactly 1
      });

      if (res.ok) {
        await fetchCart(); // UI Refresh
        setIsCartOpen(true); // 🔥 Item add hote hi side drawer auto-open hoga
        toast.success("Added to bag successfully!");
      } else {
        toast.error("Could not add to bag");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // 🌟 4. OPTIMISTIC UPDATE: Cart se specific item remove karna
  const removeFromCart = async (cartItemId) => {
    const previousCart = [...cartItems];

    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    toast.success("Item removed from bag");

    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId })
      });

      if (!res.ok) throw new Error("Backend failed to delete");

    } catch (error) {
      setCartItems(previousCart);
      toast.error("Failed to remove item. It has been restored.");
    }
  };

  // 🌟 5. OPTIMISTIC UPDATE: Quantity kam ya zyada karna (Plus/Minus in Cart Drawer)
  const updateQuantity = async (cartItemId, amount) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + amount;
    if (newQty < 1) return;

    if (amount > 0 && item.variant?.stock && newQty > item.variant.stock) {
      toast.error(`Limit Reached! Only ${item.variant.stock} left in stock.`);
      return;
    }

    const previousCart = [...cartItems];

    setCartItems(prev => prev.map(i => 
      i.id === cartItemId ? { ...i, quantity: newQty } : i
    ));

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          variantId: item.variantId, 
          quantity: amount, 
          isUpdate: true 
        })
      });

      if (!res.ok) throw new Error("API Update Failed");

    } catch (error) {
      console.error("Quantity update nahi ho saki:", error);
      setCartItems(previousCart);
      toast.error("Network error, quantity reverted.");
    }
  };

  // 6. Checkout ke baad puri cart khali karna
  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      if (res.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Cart clear karne mein error:", error);
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.variant?.price || 0) * item.quantity), 
    0
  );
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      isCartOpen, 
      setIsCartOpen,
      toggleCart, 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal, 
      cartCount,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);