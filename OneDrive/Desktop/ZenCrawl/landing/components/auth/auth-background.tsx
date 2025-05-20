"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create grid points
    const gridSize = 30
    const points: { x: number; y: number; vx: number; vy: number; connections: number[] }[] = []

    const createGrid = () => {
      points.length = 0
      const numX = Math.ceil(canvas.width / gridSize) + 1
      const numY = Math.ceil(canvas.height / gridSize) + 1

      for (let y = 0; y < numY; y++) {
        for (let x = 0; x < numX; x++) {
          points.push({
            x: x * gridSize + (Math.random() * gridSize - gridSize / 2) * 0.5,
            y: y * gridSize + (Math.random() * gridSize - gridSize / 2) * 0.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            connections: [],
          })
        }
      }

      // Create connections
      for (let i = 0; i < points.length; i++) {
        const point = points[i]
        for (let j = 0; j < points.length; j++) {
          if (i !== j) {
            const otherPoint = points[j]
            const dx = point.x - otherPoint.x
            const dy = point.y - otherPoint.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < gridSize * 2) {
              point.connections.push(j)
            }
          }
        }
      }
    }

    createGrid()
    window.addEventListener("resize", createGrid)

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw points
      for (let i = 0; i < points.length; i++) {
        const point = points[i]

        // Update position with slight movement
        point.x += point.vx
        point.y += point.vy

        // Reverse direction at boundaries with some padding
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1

        // Draw connections
        for (const connectionIndex of point.connections) {
          const connectedPoint = points[connectionIndex]
          const dx = point.x - connectedPoint.x
          const dy = point.y - connectedPoint.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < gridSize * 2) {
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(connectedPoint.x, connectedPoint.y)
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.05 * (1 - distance / (gridSize * 2))})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        // Draw point
        ctx.beginPath()
        ctx.arc(point.x, point.y, 1, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(147, 51, 234, 0.3)"
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      window.removeEventListener("resize", createGrid)
    }
  }, [])

  return (
    <>
      <motion.canvas
        ref={canvasRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-zinc-950 z-0"></div>
    </>
  )
}
