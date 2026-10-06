"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"

export interface GooeyDockItem {
  icon: React.ComponentType<{ className?: string }> | React.ReactNode
  label: string
  onClick?: () => void
  href?: string
  active?: boolean
  badge?: string
}

export interface GooeyDockProps {
  className?: string
  items: GooeyDockItem[]
  sound?: boolean
  fullWidth?: boolean
  glowColor?: string
}

function renderItemIcon(
  IconOrNode: React.ComponentType<{ className?: string }> | React.ReactNode,
  className?: string
) {
  if (React.isValidElement(IconOrNode)) {
    return IconOrNode
  }
  if (
    typeof IconOrNode === "function" ||
    (typeof IconOrNode === "object" && IconOrNode !== null)
  ) {
    const IconComponent = IconOrNode as React.ComponentType<{ className?: string }>
    return <IconComponent className={className} />
  }
  return null
}

export function GooeyDock({ items, className }: GooeyDockProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <div
      className={cn("flex items-center justify-center w-full", className)}
    >
      {/* SVG goo filter */}
      <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 20 -5"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <TooltipProvider delayDuration={100}>
        <div className="relative flex items-center justify-around w-full max-w-[480px] px-4 py-2 rounded-2xl bg-[#E2E8F0]/95 backdrop-blur-xl border border-slate-300/90 shadow-[0_8px_30px_rgba(15,23,42,0.12)] dark:bg-[#CBD5E1]/95 dark:border-slate-400/80">
          {items.map((item, i) => {
            const isHovered = hovered === i
            const isActive = item.active

            const buttonContent = (
              <motion.div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                animate={{
                  scale: isHovered ? 1.2 : isActive ? 1.08 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="relative flex items-center justify-center"
              >
                {/* Liquid blob background with goo filter */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-full transition-colors",
                    isActive
                      ? "bg-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.6)]"
                      : "bg-sky-400/30 dark:bg-sky-500/30"
                  )}
                  style={{ filter: "url(#goo)" }}
                  animate={{
                    scale: isHovered ? 1.75 : isActive ? 1.25 : 1,
                    opacity: isHovered ? 1 : isActive ? 0.85 : 0.45,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                  }}
                />

                {/* Badge if present */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 z-20 px-1.5 py-0.2 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-[9px] font-bold rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] leading-tight pointer-events-none animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Icon button (not filtered) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative rounded-full transition-all duration-200",
                    isActive
                      ? "bg-white text-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.5)] border border-sky-300/80"
                      : "bg-white/80 hover:bg-white text-slate-600 hover:text-sky-500 hover:[filter:drop-shadow(0_0_6px_#38BDF8)]"
                  )}
                  onClick={item.onClick}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "stroke-[2.5px] text-sky-500 [filter:drop-shadow(0_0_6px_#38BDF8)]"
                        : "stroke-[1.8px]"
                    )}
                  >
                    {renderItemIcon(item.icon, "h-5 w-5")}
                  </span>
                </Button>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8,0_0_14px_#0EA5E9]"
                  />
                )}
              </motion.div>
            )

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="outline-none rounded-full flex items-center justify-center"
                      aria-label={item.label}
                    >
                      {buttonContent}
                    </Link>
                  ) : (
                    buttonContent
                  )}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs bg-slate-900/95 text-sky-100 border border-sky-400/30">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
    </div>
  )
}

export default GooeyDock
