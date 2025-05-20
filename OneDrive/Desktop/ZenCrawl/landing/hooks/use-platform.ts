"use client"

import { useState, useEffect } from "react"

export type Platform = "mac" | "windows" | "linux" | "unknown"
export type DeviceType = "desktop" | "laptop" | "tablet" | "mobile" | "unknown"

interface PlatformInfo {
  platform: Platform
  deviceType: DeviceType
  isMac: boolean
  isWindows: boolean
  isLinux: boolean
  isDesktop: boolean
  isLaptop: boolean
  isMobile: boolean
  isTablet: boolean
  isRetina: boolean
}

export function usePlatform(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    platform: "unknown",
    deviceType: "unknown",
    isMac: false,
    isWindows: false,
    isLinux: false,
    isDesktop: false,
    isLaptop: false,
    isMobile: false,
    isTablet: false,
    isRetina: false,
  })

  useEffect(() => {
    // Detect platform
    let platform: Platform = "unknown"
    const userAgent = window.navigator.userAgent.toLowerCase()

    if (userAgent.indexOf("mac") !== -1) {
      platform = "mac"
    } else if (userAgent.indexOf("win") !== -1) {
      platform = "windows"
    } else if (userAgent.indexOf("linux") !== -1) {
      platform = "linux"
    }

    // Detect device type
    let deviceType: DeviceType = "unknown"
    const width = window.innerWidth
    const height = window.innerHeight

    // Simple heuristic for device type based on screen size and user agent
    if (width <= 768 || /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      deviceType = "mobile"
    } else if (width <= 1024 || /ipad/i.test(userAgent)) {
      deviceType = "tablet"
    } else if (width <= 1440 || height <= 900) {
      deviceType = "laptop"
    } else {
      deviceType = "desktop"
    }

    // Detect if display is high-DPI/Retina
    const isRetina = window.devicePixelRatio > 1.5

    setPlatformInfo({
      platform,
      deviceType,
      isMac: platform === "mac",
      isWindows: platform === "windows",
      isLinux: platform === "linux",
      isDesktop: deviceType === "desktop",
      isLaptop: deviceType === "laptop",
      isMobile: deviceType === "mobile",
      isTablet: deviceType === "tablet",
      isRetina,
    })
  }, [])

  return platformInfo
}
