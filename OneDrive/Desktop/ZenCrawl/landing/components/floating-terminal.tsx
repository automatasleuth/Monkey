"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Terminal, X, Maximize2, Minimize2 } from "lucide-react"

export default function FloatingTerminal() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentText, setCurrentText] = useState("")

  const lines = [
    "$ zencrawl init",
    "Initializing ZenCrawl...",
    "Connecting to API...",
    "Scanning target: example.com",
    "Mapping site structure...",
    "Found 128 pages, 42 assets",
    "Extracting structured data...",
    "Converting to JSON...",
    "Done! Extracted 1.2MB of structured data",
    "$ _",
  ]

  useEffect(() => {
    if (currentLine >= lines.length) {
      setIsTyping(false)
      return
    }

    const targetText = lines[currentLine]

    if (currentText.length < targetText.length) {
      // Typing effect
      const timeout = setTimeout(
        () => {
          setCurrentText(targetText.substring(0, currentText.length + 1))
        },
        Math.random() * 50 + 30,
      )

      return () => clearTimeout(timeout)
    } else {
      // Move to next line
      const timeout = setTimeout(
        () => {
          setCurrentLine(currentLine + 1)
          setCurrentText("")
        },
        currentLine === lines.length - 1 ? 3000 : Math.random() * 300 + 200,
      )

      return () => clearTimeout(timeout)
    }
  }, [currentLine, currentText, lines])

  // Reset animation after completion
  useEffect(() => {
    if (!isTyping && currentLine >= lines.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(0)
        setCurrentText("")
        setIsTyping(true)
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [isTyping, currentLine, lines.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="absolute bottom-4 right-4 z-10 max-w-[90vw] sm:bottom-8 sm:right-8 md:bottom-16 md:right-16"
    >
      <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/90 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 sm:px-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-medium text-zinc-300">ZenCrawl Terminal</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </button>
            <button className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        <motion.div animate={{ height: isMinimized ? 0 : "auto" }} className="overflow-hidden">
          <div className="h-full max-h-[200px] overflow-y-auto p-3 font-mono text-xs leading-relaxed text-zinc-300 sm:p-4">
            {lines.slice(0, currentLine).map((line, index) => (
              <div key={index} className={line.startsWith("$") ? "text-green-400" : ""}>
                {line}
              </div>
            ))}
            <div className={currentLine < lines.length && lines[currentLine].startsWith("$") ? "text-green-400" : ""}>
              {currentText}
              {isTyping && <span className="ml-0.5 inline-block h-3 w-2 animate-pulse bg-purple-500"></span>}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
