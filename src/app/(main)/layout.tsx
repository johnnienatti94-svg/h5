'use client';

import React from 'react';
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import MobileContainer from "@/components/layout/MobileContainer";
import CartDrawer from "@/components/layout/CartDrawer";
import CategoryDrawer from "@/components/layout/CategoryDrawer";
import { CartProvider, useCart } from "@/context/CartContext";

import { useAuthGuard } from '@/lib/auth';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { isDrawerOpen, setIsDrawerOpen } = useCart();
  const { isChecking, auth } = useAuthGuard();

  if (isChecking || !auth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center animate-pulse">
            <img src="/brand-logo.png" alt="มีโปรโฟน" className="h-10 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <span className="inline-block w-4 h-4 border-2 border-[#FF6E00] border-t-transparent rounded-full animate-spin" />
            <span>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <MobileContainer>
        {children}
      </MobileContainer>
      <BottomNav />
      <CartDrawer />
      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </CartProvider>
  );
}
