"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { ArrowRight, Globe, Database, FileText } from "lucide-react"

export default function ArchitectureFlow() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.2,
        ease: "easeOut",
      },
    }),
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="mx-auto max-w-4xl"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Input */}
        <motion.div
          variants={itemVariants}
          custom={0}
          className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <Globe className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="mb-2 font-display text-xl font-bold text-white">Input</h3>
          <p className="text-zinc-400">URLs, search queries, or site maps that define what content to extract</p>
          <div className="mt-4 rounded-md bg-zinc-800 p-2 font-mono text-xs text-zinc-300">
            zencrawl --url="example.com/blog"
          </div>
        </motion.div>

        {/* Process */}
        <motion.div
          variants={itemVariants}
          custom={1}
          className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <Database className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="mb-2 font-display text-xl font-bold text-white">Process</h3>
          <p className="text-zinc-400">Queue + Scraper + Formatter pipeline that extracts and structures data</p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-zinc-400">
            <div className="rounded-md bg-zinc-800 px-2 py-1 text-xs">Queue</div>
            <ArrowRight className="h-3 w-3" />
            <div className="rounded-md bg-zinc-800 px-2 py-1 text-xs">Scraper</div>
            <ArrowRight className="h-3 w-3" />
            <div className="rounded-md bg-zinc-800 px-2 py-1 text-xs">Formatter</div>
          </div>
        </motion.div>

        {/* Output */}
        <motion.div
          variants={itemVariants}
          custom={2}
          className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <FileText className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="mb-2 font-display text-xl font-bold text-white">Output</h3>
          <p className="text-zinc-400">Structured data in Markdown, JSON, or HTML format ready for AI consumption</p>
          <div className="mt-4 rounded-md bg-zinc-800 p-2 font-mono text-xs text-purple-300">
            {"{"} "title": "Example Blog", ... {"}"}
          </div>
        </motion.div>
      </div>

      {/* Flow Diagram */}
      <motion.div
        variants={itemVariants}
        custom={3}
        className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 overflow-hidden"
      >
        <h3 className="mb-4 text-center font-display text-xl font-bold text-white">Data Flow</h3>
        <div className="relative mx-auto h-[200px] max-w-2xl">
          <svg className="h-full w-full" viewBox="0 0 800 200">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
              </marker>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Flow path */}
            <path
              d="M 100,100 C 250,50 350,150 500,100 C 650,50 700,100 700,100"
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="3"
              strokeDasharray="0"
              filter="url(#glow)"
            />

            {/* Animated particles */}
            {[0, 1, 2].map((i) => (
              <circle key={i} r="4" fill="#8b5cf6">
                <animateMotion
                  path="M 100,100 C 250,50 350,150 500,100 C 650,50 700,100 700,100"
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 1}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                  begin={`${i * 1}s`}
                />
              </circle>
            ))}

            {/* Data particles */}
            {[0, 1, 2].map((i) => (
              <rect key={`data-${i}`} width="6" height="6" fill="#38bdf8">
                <animateMotion
                  path="M 100,100 C 250,50 350,150 500,100 C 650,50 700,100 700,100"
                  dur={`${4 + i * 0.7}s`}
                  repeatCount="indefinite"
                  begin={`${i * 1.5}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${4 + i * 0.7}s`}
                  repeatCount="indefinite"
                  begin={`${i * 1.5}s`}
                />
              </rect>
            ))}

            {/* Nodes */}
            <g filter="url(#glow)">
              <circle cx="100" cy="100" r="20" fill="#27272a" stroke="#8b5cf6" strokeWidth="2" />
              <text x="100" y="105" textAnchor="middle" fill="#8b5cf6" fontSize="12">
                1
              </text>

              <circle cx="300" cy="100" r="20" fill="#27272a" stroke="#8b5cf6" strokeWidth="2" />
              <text x="300" y="105" textAnchor="middle" fill="#8b5cf6" fontSize="12">
                2
              </text>

              <circle cx="500" cy="100" r="20" fill="#27272a" stroke="#8b5cf6" strokeWidth="2" />
              <text x="500" y="105" textAnchor="middle" fill="#8b5cf6" fontSize="12">
                3
              </text>

              <circle cx="700" cy="100" r="20" fill="#27272a" stroke="#8b5cf6" strokeWidth="2" />
              <text x="700" y="105" textAnchor="middle" fill="#8b5cf6" fontSize="12">
                4
              </text>
            </g>

            {/* Labels */}
            <text x="100" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="12">
              URL Input
            </text>
            <text x="300" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="12">
              Queue
            </text>
            <text x="500" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="12">
              Processing
            </text>
            <text x="700" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="12">
              Output
            </text>
          </svg>
        </div>
      </motion.div>
    </motion.div>
  )
}
