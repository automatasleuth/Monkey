"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import SignUpCTA from "@/components/sign-up-cta"

interface FloatingCTAProps {
  delay?: number
  showOnMobile?: boolean
}

export default function FloatingCTA({ delay = 3000, showOnMobile = true }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if the CTA has been dismissed before
    const hasDismissed = localStorage.getItem("zencrawl-cta-dismissed")

    if (hasDismissed) {
      return
    }

    // Show the CTA after the specified delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem("zencrawl-cta-dismissed", "true")
  }

  if (isDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 20 }}
          className={`fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6 ${showOnMobile ? "" : "hidden md:block"}`}
        >
          <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/90 p-3 shadow-xl backdrop-blur-sm sm:p-4">
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-2 rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </button>

            <div className="mb-3 max-w-xs">
              <h3 className="font-display text-base font-bold text-white sm:text-lg">Ready to extract web data?</h3>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Sign up for free and get 100 credits to start extracting structured data.
              </p>
            </div>

            <SignUpCTA variant="primary" size="sm" text="Get Started — It's Free" className="block w-full sm:size-md" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
