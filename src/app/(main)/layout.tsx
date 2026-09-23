'use client';

import React from 'react';
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import MobileContainer from "@/components/layout/MobileContainer";
import CartDrawer from "@/components/layout/CartDrawer";
import CategoryDrawer from "@/components/layout/CategoryDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { useAuthGuard } from "@/lib/auth";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { isDrawerOpen, setIsDrawerOpen } = useCart();

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
  const { isChecking } = useAuthGuard();

  // Show loading spinner while verifying authentication
  if (isChecking) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #E2E8F0',
            borderTopColor: '#007ACC',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <CartProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </CartProvider>
  );
}
