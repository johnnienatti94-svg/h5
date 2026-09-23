'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DetailedProduct, ALL_PRODUCTS } from '@/lib/productsData';

export interface CartItem {
  product: DetailedProduct;
  quantity: number;
  selectedPlanMonths: number;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  estimatedMonthlyInstallment: number;
  appliedVoucher: string | null;
  isCartOpen: boolean;
  isDrawerOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  addToCart: (product: DetailedProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_DEMO_ITEMS: CartItem[] = [
  {
    product: ALL_PRODUCTS[0], // iPhone 16 Pro
    quantity: 1,
    selectedPlanMonths: 10,
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage or initialize with demo item
  useEffect(() => {
    try {
      const saved = localStorage.getItem('meepro_cart_items');
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems(INITIAL_DEMO_ITEMS);
      }
    } catch {
      setItems(INITIAL_DEMO_ITEMS);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('meepro_cart_items', JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, isInitialized]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.promoPrice * item.quantity,
    0
  );

  const totalPrice = Math.max(0, subtotal - discountAmount);

  const estimatedMonthlyInstallment =
    totalPrice > 0 ? Math.round(totalPrice / 10) : 0;

  const addToCart = (product: DetailedProduct, quantity = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.product.id === product.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quantity: updated[index].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedPlanMonths: product.installmentMonths || 10,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const applyVoucher = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'MEEPRO500') {
      setAppliedVoucher(clean);
      setDiscountAmount(500);
      return { success: true, message: 'ใช้โค้ดลด ฿500 สำเร็จ!' };
    }
    if (clean === 'FLAGSHIP1K') {
      if (subtotal >= 30000) {
        setAppliedVoucher(clean);
        setDiscountAmount(1000);
        return { success: true, message: 'ใช้โค้ดลด ฿1,000 สำเร็จ!' };
      }
      return { success: false, message: 'ยอดสั่งซื้อขั้นต่ำ ฿30,000 สำหรับโค้ดนี้' };
    }
    return { success: false, message: 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ' };
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedVoucher(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        discountAmount,
        totalPrice,
        estimatedMonthlyInstallment,
        appliedVoucher,
        isCartOpen,
        isDrawerOpen,
        setIsCartOpen,
        setIsDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyVoucher,
        removeVoucher,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
