"use client"

import { useState } from "react"
import { Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import KeyboardShortcut from "@/components/keyboard-shortcut"
import { usePlatform } from "@/hooks/use-platform"

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)
  const { isMac } = usePlatform()

  const shortcuts = [
    {
      category: "General",
      items: [
        {
          name: "Show keyboard shortcuts",
          shortcut: { mac: "⌘+/", windows: "Ctrl+/" },
        },
        {
          name: "Focus URL input",
          shortcut: { mac: "⌘+L", windows: "Ctrl+L" },
        },
        {
          name: "Run extraction",
          shortcut: { mac: "⌘+Enter", windows: "Ctrl+Enter" },
        },
        {
          name: "Toggle options",
          shortcut: { mac: "⌘+O", windows: "Ctrl+O" },
        },
      ],
    },
    {
      category: "Navigation",
      items: [
        {
          name: "Switch to Single URL",
          shortcut: { mac: "⌘+1", windows: "Ctrl+1" },
        },
        {
          name: "Switch to Crawl",
          shortcut: { mac: "⌘+2", windows: "Ctrl+2" },
        },
        {
          name: "Switch to Map",
          shortcut: { mac: "⌘+3", windows: "Ctrl+3" },
        },
        {
          name: "Switch to Search",
          shortcut: { mac: "⌘+4", windows: "Ctrl+4" },
        },
      ],
    },
    {
      category: "Results",
      items: [
        {
          name: "Copy results",
          shortcut: { mac: "⌘+Shift+C", windows: "Ctrl+Shift+C" },
        },
        {
          name: "Export results",
          shortcut: { mac: "⌘+E", windows: "Ctrl+E" },
        },
        {
          name: "Toggle fullscreen",
          shortcut: { mac: "⌘+Shift+F", windows: "F11" },
        },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <Command className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Keyboard Shortcuts</span>
          <span className="inline sm:hidden">Shortcuts</span>
          <KeyboardShortcut shortcut={{ mac: "⌘+/", windows: "Ctrl+/" }} className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-zinc-800 bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Keyboard shortcuts to help you navigate and use ZenCrawl more efficiently.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="mb-2 text-sm font-medium text-zinc-300">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">{item.name}</span>
                    <KeyboardShortcut shortcut={item.shortcut} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-zinc-500">
          Press <KeyboardShortcut shortcut={{ mac: "Esc", windows: "Esc" }} className="inline-flex mx-1" /> to close
        </div>
      </DialogContent>
    </Dialog>
  )
}
