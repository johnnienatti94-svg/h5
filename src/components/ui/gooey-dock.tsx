'use client';

import React, { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Gooey Dock — proximity magnification dock by Ruixen UI
 * Enhanced with full-width mobile stretching, light-blue glow, and touch physics.
 *
 * Cosine-based scaling curve. Items lift on the Y-axis
 * as they grow — forming a subtle arch.
 */

export interface GooeyDockItem {
  id?: string;
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string;
}

export interface GooeyDockProps {
  items: GooeyDockItem[];
  sound?: boolean;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
  baseSize?: number;
  peakSize?: number;
  lift?: number;
  radius?: number;
  glowColor?: 'lightblue' | 'orange' | 'default';
}

/* ── Constants ── */
const DEFAULT_BASE = 42;
const DEFAULT_PEAK = 58;
const DEFAULT_LIFT = 12;
const DEFAULT_RADIUS = 140;

const SPRING = { mass: 0.1, stiffness: 200, damping: 14 };

/* ── Web Audio Haptics ── */
let _ctx: AudioContext | null = null;
let _buf: AudioBuffer | null = null;

function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      _ctx = new AudioContextClass();
    }
  }
  if (_ctx && _ctx.state === 'suspended') {
    _ctx.resume().catch(() => {});
  }
  return _ctx;
}

function ensureAudioBuffer(ac: AudioContext): AudioBuffer {
  if (_buf && _buf.sampleRate === ac.sampleRate) return _buf;
  const rate = ac.sampleRate;
  const len = Math.floor(rate * 0.003);
  const buf = ac.createBuffer(1, len, rate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    ch[i] = (Math.random() * 2 - 1) * (1 - t) ** 4;
  }
  _buf = buf;
  return buf;
}

function playTick(last: React.MutableRefObject<number>) {
  if (typeof window === 'undefined') return;
  const now = performance.now();
  if (now - last.current < 70) return;
  last.current = now;
  try {
    const ac = getAudioCtx();
    if (!ac) return;
    const buf = ensureAudioBuffer(ac);
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    src.buffer = buf;
    src.playbackRate.value = 1.2;
    gain.gain.value = 0.035;
    src.connect(gain);
    gain.connect(ac.destination);
    src.start();
  } catch {
    /* silent on browser restrictions */
  }
}

/* ── Cosine falloff ── */
function cosineScale(d: number, radius: number): number {
  const abs = Math.abs(d);
  if (abs > radius) return 0;
  return (1 + Math.cos((abs / radius) * Math.PI)) / 2;
}

/* ── Dock Item Component ── */
function GooeyDockIconItem({
  item,
  mouseX,
  sound,
  lastSound,
  baseSize,
  peakSize,
  lift,
  radius,
  fullWidth,
  glowColor,
}: {
  item: GooeyDockItem;
  mouseX: MotionValue<number>;
  sound: boolean;
  lastSound: React.MutableRefObject<number>;
  baseSize: number;
  peakSize: number;
  lift: number;
  radius: number;
  fullWidth: boolean;
  glowColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const el = ref.current;
    if (!el || val === Infinity) return Infinity;
    const rect = el.getBoundingClientRect();
    return val - rect.left - rect.width / 2;
  });

  /* Size — cosine curve */
  const sizeRaw = useTransform(distance, (d) => {
    const t = cosineScale(d, radius);
    return baseSize + (peakSize - baseSize) * t;
  });
  const size = useSpring(sizeRaw, SPRING);

  /* Y lift — items arch upward */
  const liftRaw = useTransform(distance, (d) => {
    const t = cosineScale(d, radius);
    return -lift * t;
  });
  const y = useSpring(liftRaw, SPRING);

  /* Background proximity fill */
  const bgRaw = useTransform(distance, (d) => {
    const t = cosineScale(d, radius);
    return t * 0.12;
  });
  const bgOpacity = useSpring(bgRaw, SPRING);

  /* Icon scale */
  const iconScaleRaw = useTransform(size, [baseSize, peakSize], [1, 1.22]);
  const iconScale = useSpring(iconScaleRaw, SPRING);

  const isLightblue = glowColor === 'lightblue';

  const content = (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
        y,
        borderRadius: 14,
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: useTransform(
          bgOpacity,
          (v) => (item.active ? 'rgba(255,255,255,0.95)' : `rgba(255,255,255,${0.35 + v})`)
        ),
      }}
      className={cn(
        'transition-shadow duration-200 select-none outline-none',
        item.active && isLightblue
          ? 'shadow-[0_0_16px_rgba(56,189,248,0.5)] border border-sky-300/80'
          : 'border border-transparent hover:border-slate-300/60'
      )}
      onClick={item.onClick}
      onMouseEnter={() => {
        setHovered(true);
        if (sound) playTick(lastSound);
      }}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={item.label}
    >
      {/* Label Tooltip — springs in */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 50,
            }}
            className="px-2.5 py-0.5 rounded-md bg-slate-900/95 text-sky-200 border border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional Badge */}
      {item.badge && (
        <span className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-[9px] font-bold rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] leading-tight pointer-events-none animate-pulse">
          {item.badge}
        </span>
      )}

      {/* Icon — scales and glows in lightblue */}
      <motion.div
        style={{
          scale: iconScale,
        }}
        className={cn(
          'flex items-center justify-center transition-all duration-200',
          item.active
            ? isLightblue
              ? 'text-sky-500 [filter:drop-shadow(0_0_6px_#38BDF8)_drop-shadow(0_0_12px_rgba(56,189,248,0.75))]'
              : 'text-[#FF6E00]'
            : isLightblue
              ? 'text-slate-500 hover:text-sky-500 hover:[filter:drop-shadow(0_0_6px_#38BDF8)]'
              : 'text-slate-600 hover:text-slate-900'
        )}
      >
        {item.icon}
      </motion.div>

      {/* Active Indicator Dot */}
      {item.active && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
            isLightblue
              ? 'bg-sky-400 shadow-[0_0_8px_#38BDF8,0_0_14px_#0EA5E9]'
              : 'bg-[#FF6E00] shadow-[0_0_8px_rgba(255,110,0,0.8)]'
          )}
        />
      )}
    </motion.div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          'outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl flex items-center justify-center',
          fullWidth && 'flex-1'
        )}
      >
        {content}
      </Link>
    );
  }

  return fullWidth ? (
    <div className="flex-1 flex items-center justify-center">{content}</div>
  ) : (
    content
  );
}

/* ── Main GooeyDock Component ── */
export function GooeyDock({
  items,
  sound = true,
  className,
  containerClassName,
  fullWidth = true,
  baseSize = DEFAULT_BASE,
  peakSize = DEFAULT_PEAK,
  lift = DEFAULT_LIFT,
  radius = DEFAULT_RADIUS,
  glowColor = 'lightblue',
}: GooeyDockProps) {
  const mouseX = useMotionValue(Infinity);
  const lastSound = useRef(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      mouseX.set(e.touches[0].clientX);
    }
  };

  return (
    <div
      className={cn('w-full flex items-end justify-center select-none', containerClassName)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => mouseX.set(Infinity)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => mouseX.set(Infinity)}
    >
      <div
        className={cn(
          'flex items-center rounded-2xl border transition-all duration-200',
          fullWidth ? 'w-full justify-around px-2 sm:px-3' : 'w-fit gap-2 px-4',
          'bg-[#E2E8F0]/95 backdrop-blur-xl border-slate-300/90 shadow-[0_8px_30px_rgba(15,23,42,0.12)]',
          'dark:bg-[#CBD5E1]/95 dark:border-slate-400/80',
          className
        )}
        style={{
          paddingTop: 8,
          paddingBottom: 10,
        }}
        role="toolbar"
        aria-label="Application navigation dock"
      >
        {items.map((item, i) => (
          <GooeyDockIconItem
            key={item.id ?? i}
            item={item}
            mouseX={mouseX}
            sound={sound}
            lastSound={lastSound}
            baseSize={baseSize}
            peakSize={peakSize}
            lift={lift}
            radius={radius}
            fullWidth={fullWidth}
            glowColor={glowColor}
          />
        ))}
      </div>
    </div>
  );
}

export default GooeyDock;
