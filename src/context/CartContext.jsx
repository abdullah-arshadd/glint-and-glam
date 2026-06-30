'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Browser ke liye unique Session ID generate ya fetch karna
  useEffect(() => {
    let sid = localStorage.getItem('twinks_session_id');
    if (!sid) {
      sid = crypto.randomUUID(); // Ek unique long string banata hai
      localStorage.setItem('twinks_session_id', sid);
    }
    setSessionId(sid);
    fetchCart(sid);
  }, []);

  // 2. Database (API) se Cart Items lekar aana
  const fetchCart = async (sid) => {
    if (!sid) return;
    try {
      const res = await fetch(`/api/cart?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setCartItems(data);
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
    // Frontend Level par check karo ke variant database se aa raha hai ya nahi
    if (!variantId) {
      toast.error("Invalid product variant!");
      return;
    }

    // Pehle hi check karlo variant pehle se cart mein kitna hai
    const existing = cartItems.find(item => item.variantId === variantId);
    if (existing && existing.quantity >= stockAvailable) {
      toast.error("Sorry, no more stock available for this item!");
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, variantId, quantity: 1 })
      });

      if (res.ok) {
        await fetchCart(sessionId); // UI Refresh karo fresh DB entry ke sath
        toast.success("Added to bag successfully!");
      } else {
        toast.error("Could not add to bag");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // 4. Cart se specific item remove karna (Database delete)
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

  // 5. Quantity kam ya zyada karna (Plus/Minus buttons)
  const updateQuantity = async (cartItemId, amount) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    const newQty = item.quantity + amount;
    if (newQty < 1) return; // 1 se neeche nahi jane dena

    // Variant ka stock check karo
    if (amount > 0 && newQty > item.variant.stock) {
      toast.error("Cannot exceed available stock!");
      return;
    }

    try {
      // Is logic ke liye hum POST request ko hi use karenge, bas quantity overwrite bhejenge
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          variantId: item.variantId, 
          quantity: amount, // Jo amount change karni hai (+1 ya -1)
          isUpdate: true 
        })
      });

      if (res.ok) {
        await fetchCart(sessionId);
      }
    } catch (error) {
      console.error("Quantity update nahi ho saki:", error);
    }
  };

  // 6. Checkout ke baad puri cart khali karne ke liye function
  const clearCart = async () => {
    try {
      const res = await fetch(`/api/cart?sessionId=${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Cart clear karne mein error:", error);
    }
  };

  // Real-time server price Calculation
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