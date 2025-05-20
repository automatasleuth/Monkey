"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignUpCTAProps {
  variant?: "primary" | "secondary" | "minimal"
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export default function SignUpCTA({
  variant = "primary",
  size = "md",
  text = "Sign Up",
  className = "",
}: SignUpCTAProps) {
  // Size classes
  const sizeClasses = {
    sm: "text-xs py-1 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-2.5 px-5",
  }

  // Variant classes
  const variantClasses = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200",
    minimal: "bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-zinc-200",
  }

  return (
    <Link href="/auth/signup" className={className}>
      <Button className={cn("font-medium transition-colors", sizeClasses[size], variantClasses[variant])}>
        {text}
      </Button>
    </Link>
  )
}
