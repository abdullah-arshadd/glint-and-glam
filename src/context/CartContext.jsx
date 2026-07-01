'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Page open hote hi data fetch karo (Backend cookie khud manage karega)
  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Database (API) se Cart Items lekar aana
  const fetchCart = async () => {
    try {
      // 🚀 FIXED: URL params se sessionId hata diya, ab server direct cookie se parh lega
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

  // 3. Database mein product variant add karna
  const addToCart = async (variantId, stockAvailable) => {
    if (!variantId) {
      toast.error("Invalid product variant!");
      return;
    }

    const existing = cartItems.find(item => item.variantId === variantId);
    if (existing && existing.quantity >= stockAvailable) {
      toast.error("Sorry, no more stock available for this item!");
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: 1 }) // 🚀 FIXED: sessionId removed from payload
      });

      if (res.ok) {
        await fetchCart(); // UI Refresh
        toast.success("Added to bag successfully!");
      } else {
        toast.error("Could not add to bag");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // 4. Cart se specific item remove karna
  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId })
      });

      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        toast.success("Item removed from bag");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // 5. Quantity kam ya zyada karna (Plus/Minus)
  const updateQuantity = async (cartItemId, amount) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + amount;
    if (newQty < 1) return;

    if (amount > 0 && newQty > item.variant.stock) {
      toast.error("Cannot exceed available stock!");
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          variantId: item.variantId, 
          quantity: amount, 
          isUpdate: true 
        }) // 🚀 FIXED: sessionId removed
      });

      if (res.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Quantity update nahi ho saki:", error);
    }
  };

  // 6. Checkout ke baad puri cart khali karna
  const clearCart = async () => {
    try {
      // 🚀 FIXED: Query param ki zaroorat nahi
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