'use client';

import React from 'react';
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import MobileContainer from "@/components/layout/MobileContainer";
import CartDrawer from "@/components/layout/CartDrawer";
import CategoryDrawer from "@/components/layout/CategoryDrawer";
import { CartProvider, useCart } from "@/context/CartContext";

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
  return (
    <CartProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </CartProvider>
  );
}
