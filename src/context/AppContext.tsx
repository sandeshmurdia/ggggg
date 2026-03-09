/**
 * Global app state: auth (mock) and cart.
 * In a real app you'd use a backend and persistent storage.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Product } from '../types';
import { CartItem } from '../types';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AppState {
  user: User | null;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const signIn = useCallback((email: string, _password: string) => {
    setUser({ id: '1', email, name: email.split('@')[0] });
    return true;
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      signIn,
      signOut,
    }),
    [user, cart, addToCart, removeFromCart, updateQuantity, clearCart, signIn, signOut]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
