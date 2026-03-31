'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiClient from '../api';
import { useAuth } from '../hooks/useAuth';

interface CartItem {
  medicineId: string;
  pharmacyId: string;
  medicineName: string;
  price: number;
  quantity: number;
  _id?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  addToCart: (item: { medicineId: string; pharmacyId: string; medicineName: string; price: number }) => Promise<void>;
  updateQuantity: (medicineId: string, pharmacyId: string, quantity: number) => Promise<void>;
  removeFromCart: (medicineId: string, pharmacyId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart on load if user is logged in
  useEffect(() => {
    if (user && user.role === 'user') {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.getCart();
      if (res.data && res.data.items) {
        setCartItems(res.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (item: { medicineId: string; pharmacyId: string; medicineName: string; price: number }) => {
    if (!user) return; // Only allow authenticated users for now
    try {
      // Optimistic update
      const existingItemIndex = cartItems.findIndex(
        i => i.medicineId === item.medicineId && i.pharmacyId === item.pharmacyId
      );
      
      let newItems = [...cartItems];
      if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += 1;
      } else {
        newItems.push({ ...item, quantity: 1 });
      }
      setCartItems(newItems);

      // Backend sync
      await ApiClient.addToCart(item.medicineId, item.pharmacyId, item.medicineName, item.price);
      // Re-fetch to ensure perfect sync (optional, can just rely on optimistic)
      fetchCart();
    } catch (error) {
      console.error('Failed to add to cart', error);
      fetchCart(); // Revert on failure
    }
  };

  const updateQuantity = async (medicineId: string, pharmacyId: string, quantity: number) => {
    if (!user) return;
    try {
      // Optimistic
      let newItems = [...cartItems];
      const index = newItems.findIndex(i => i.medicineId === medicineId && i.pharmacyId === pharmacyId);
      if (index > -1) {
        if (quantity <= 0) {
          newItems.splice(index, 1);
        } else {
          newItems[index].quantity = quantity;
        }
        setCartItems(newItems);
      }

      await ApiClient.updateCartQuantity(medicineId, pharmacyId, quantity);
    } catch (error) {
      console.error('Failed to update quantity', error);
      fetchCart();
    }
  };

  const removeFromCart = async (medicineId: string, pharmacyId: string) => {
    if (!user) return;
    try {
      setCartItems(prev => prev.filter(i => !(i.medicineId === medicineId && i.pharmacyId === pharmacyId)));
      await ApiClient.removeFromCart(medicineId, pharmacyId);
    } catch (error) {
      console.error('Failed to remove from cart', error);
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      setCartItems([]);
      await ApiClient.clearCart();
    } catch (error) {
      console.error('Failed to clear cart', error);
      fetchCart();
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartCount, 
        cartTotal, 
        isLoading, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
