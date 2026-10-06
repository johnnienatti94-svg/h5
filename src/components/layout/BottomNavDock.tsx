'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Flame,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
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

  return (
    <nav
      aria-label="แถบเมนูหลัก"
      id="bottom-nav"
      className={cn(
        variant === 'floating'
          ? 'fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[200] w-auto max-w-[calc(100vw-24px)] pointer-events-auto'
          : 'relative w-full py-2 bg-white border-t border-slate-200 z-[200]',
        className
      )}
    >
      <Dock
        magnification={66}
        distance={110}
        panelHeight={58}
        className={cn(
          'border shadow-lg transition-all',
          'bg-white/92 backdrop-blur-xl border-slate-200/80 shadow-slate-900/10',
          'dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-black/30',
          'px-3 py-1 rounded-2xl flex items-center justify-center gap-2'
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'));

          return (
            <Link
              key={item.id}
              href={item.href}
              id={`nav-${item.id}`}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#FF6E00] rounded-xl"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <DockItem
                className={cn(
                  'aspect-square rounded-xl transition-colors relative flex items-center justify-center',
                  isActive
                    ? 'bg-orange-50 text-[#FF6E00] dark:bg-orange-950/40 dark:text-[#FF6E00] font-semibold'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-300'
                )}
              >
                {/* Floating tooltip label (Apple-dock style) */}
                <DockLabel className="bg-[#142B4A] text-white border-slate-700 font-medium text-[11px] shadow-md px-2 py-0.5">
                  {item.label}
                </DockLabel>

                {/* Badge if present (e.g. HOT) */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 z-10 px-1 py-0.2 bg-[#FF6E00] text-white text-[9px] font-bold rounded-full shadow-sm leading-tight pointer-events-none animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Center Icon */}
                <DockIcon className="flex items-center justify-center">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform duration-150',
                      isActive ? 'stroke-[2.5px] scale-105' : 'stroke-[1.8px]'
                    )}
                  />
                </DockIcon>

                {/* Active Indicator Dot (macOS style app indicator) */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF6E00] shadow-[0_0_6px_rgba(255,110,0,0.8)]"
                  />
                )}
              </DockItem>
            </Link>
          );
        })}
      </Dock>
    </nav>
  );
}
