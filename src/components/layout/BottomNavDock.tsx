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
          ? 'fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-2.5 right-2.5 sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] sm:max-w-[calc(100vw-20px)] z-[200] pointer-events-auto'
          : 'relative w-full py-2 bg-[#E2E8F0] border-t border-slate-300 z-[200]',
        className
      )}
    >
      <Dock
        magnification={64}
        distance={100}
        panelHeight={58}
        className={cn(
          'w-full flex items-center justify-around px-2 sm:px-3 rounded-2xl border transition-all',
          'bg-[#E2E8F0]/95 backdrop-blur-xl border-slate-300/90 shadow-[0_8px_30px_rgba(15,23,42,0.12)]',
          'dark:bg-[#CBD5E1]/95 dark:border-slate-400/80 dark:shadow-[0_8px_30px_rgba(0,0,0,0.18)]'
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
              className="flex-1 flex justify-center items-center outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <DockItem
                className={cn(
                  'aspect-square rounded-xl transition-all duration-200 relative flex items-center justify-center',
                  isActive
                    ? 'bg-white/95 text-sky-500 font-semibold shadow-[0_0_16px_rgba(56,189,248,0.5)] border border-sky-300/80'
                    : 'bg-white/50 hover:bg-white/80 text-slate-500 hover:text-sky-500 hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                )}
              >
                {/* Floating tooltip label (Apple-dock style) */}
                <DockLabel className="bg-slate-900/95 text-sky-200 border-sky-400/30 font-medium text-[11px] shadow-[0_0_10px_rgba(56,189,248,0.25)] px-2.5 py-0.5">
                  {item.label}
                </DockLabel>

                {/* Badge if present (e.g. HOT) with lightblue glow accent */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-[9px] font-bold rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] leading-tight pointer-events-none animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Center Icon with Lightblue Glow */}
                <DockIcon className="flex items-center justify-center">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-200',
                      isActive
                        ? 'stroke-[2.5px] text-sky-500 [filter:drop-shadow(0_0_6px_#38BDF8)_drop-shadow(0_0_12px_rgba(56,189,248,0.75))]'
                        : 'stroke-[1.8px] hover:[filter:drop-shadow(0_0_6px_#38BDF8)]'
                    )}
                  />
                </DockIcon>

                {/* Active Indicator Dot with Lightblue Glow */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8,0_0_14px_#0EA5E9]"
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
