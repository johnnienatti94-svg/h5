'use client';

import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import MobileContainer from "@/components/layout/MobileContainer";
import { useAuthGuard } from "@/lib/auth";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isChecking } = useAuthGuard();

  // Show nothing while checking auth (prevents flash of content)
  if (isChecking) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
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
    </>
  );
}
