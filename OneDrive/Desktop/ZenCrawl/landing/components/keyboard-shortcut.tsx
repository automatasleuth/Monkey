"use client"

import { usePlatform } from "@/hooks/use-platform"

interface KeyboardShortcutProps {
  shortcut: {
    mac: string
    windows: string
  }
  className?: string
}

export default function KeyboardShortcut({ shortcut, className = "" }: KeyboardShortcutProps) {
  const { isMac } = usePlatform()
  const keys = (isMac ? shortcut.mac : shortcut.windows).split("+")

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {keys.map((key, index) => (
        <span key={index} className="inline-flex">
          {index > 0 && <span className="mx-0.5">+</span>}
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-400">
            {key}
          </kbd>
        </span>
      ))}
    </div>
  )
}
