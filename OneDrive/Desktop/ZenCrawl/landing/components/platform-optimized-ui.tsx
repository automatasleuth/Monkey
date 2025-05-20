"use client"

import type { ReactNode } from "react"
import { usePlatform } from "@/hooks/use-platform"

interface PlatformOptimizedUIProps {
  children: ReactNode
}

export default function PlatformOptimizedUI({ children }: PlatformOptimizedUIProps) {
  const { isMac, isWindows, isLaptop, isDesktop, isRetina } = usePlatform()

  // Apply platform-specific CSS classes to the root element
  const platformClasses = [
    isMac ? "platform-mac" : "",
    isWindows ? "platform-windows" : "",
    isLaptop ? "device-laptop" : "",
    isDesktop ? "device-desktop" : "",
    isRetina ? "display-retina" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={platformClasses}>{children}</div>
}
