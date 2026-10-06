'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Home,
  Flame,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import { GooeyDock, type GooeyDockItem } from '@/components/ui/gooey-dock';
import { cn } from '@/lib/utils';

export interface NavItemConfig {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const DOCK_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    href: '/home',
    label: 'หน้าหลัก',
    icon: Home,
  },
  {
    id: 'promotions',
    href: '/promotions',
    label: 'โปรโมชั่น',
    icon: Flame,
    badge: 'HOT',
  },
  {
    id: 'products',
    href: '/products',
    label: 'สินค้า',
    icon: ShoppingBag,
  },
  {
    id: 'stores',
    href: '/stores',
    label: 'สาขา',
    icon: Store,
  },
  {
    id: 'account',
    href: '/account',
    label: 'บัญชี',
    icon: User,
  },
];

interface BottomNavDockProps {
  className?: string;
  items?: NavItemConfig[];
  variant?: 'floating' | 'bar';
}

export default function BottomNavDock({
  className,
  items = DOCK_NAV_ITEMS,
  variant = 'floating',
}: BottomNavDockProps) {
  const pathname = usePathname();

  const dockItems: GooeyDockItem[] = items.map((item) => {
    const isActive =
      pathname === item.href ||
      (item.href !== '/' && pathname?.startsWith(item.href + '/'));

    return {
      icon: item.icon,
      label: item.label,
      href: item.href,
      active: isActive,
      badge: item.badge,
    };
  });

  return (
    <nav
      aria-label="แถบเมนูหลัก"
      id="bottom-nav"
      className={cn(
        variant === 'floating'
          ? 'fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-2.5 right-2.5 sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] sm:max-w-[calc(100vw-20px)] z-[200] pointer-events-auto'
          : 'relative w-full py-2 bg-[#E2E8F0] border-t border-slate-300 z-[200]',
        className
      )}
    >
      <GooeyDock items={dockItems} />
    </nav>
  );
}
