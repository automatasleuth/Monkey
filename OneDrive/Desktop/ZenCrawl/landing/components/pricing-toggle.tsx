"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function PricingToggle() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="pricing-toggle" className="text-zinc-400">
        Monthly
      </Label>
      <Switch id="pricing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
      <Label htmlFor="pricing-toggle" className="flex items-center text-zinc-400">
        Yearly
        <span className="ml-2 rounded-full bg-purple-900/30 px-2 py-0.5 text-xs text-purple-400">Save 20%</span>
      </Label>
    </div>
  )
}
