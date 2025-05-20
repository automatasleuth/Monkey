"use client"

import { type ReactNode, useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  animationName: string
}

export default function FeatureCard({ title, description, icon, animationName }: FeatureCardProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Animation variants based on the animation name
  const getAnimationVariant = () => {
    switch (animationName) {
      case "zoom-in":
        return {
          hidden: { scale: 0.8, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
        }
      case "radar-scan":
        return {
          hidden: { opacity: 0, rotate: -10 },
          visible: {
            opacity: 1,
            rotate: 0,
            transition: { duration: 0.5 },
          },
        }
      case "spider-crawl":
        return {
          hidden: { y: 20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 10 },
          },
        }
      case "search-spotlight":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 },
          },
        }
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }
    }
  }

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={getAnimationVariant()}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        rotateX: -5,
        transition: { duration: 0.3 },
      }}
      className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-purple-900/50 hover:bg-zinc-900 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)]"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-800/50 transition-all group-hover:bg-zinc-800 group-hover:shadow-[0_0_15px_rgba(147,51,234,0.2)]">
        {icon}
      </div>
      <h3 className="mb-2 font-display text-xl font-bold text-white">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </motion.div>
  )
}
