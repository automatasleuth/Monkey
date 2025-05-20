"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Node {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  connections: number[]
  type: "page" | "data" | "hub"
  pulse: number
  active: boolean
}

interface Connection {
  from: number
  to: number
  strength: number
  active: boolean
  data: boolean
  progress: number
  speed: number
}

export default function EnhancedHeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  const animationRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const connectionsRef = useRef<Connection[]>([])
  const frameCountRef = useRef(0)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const activeNodeRef = useRef<number | null>(null)

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const width = window.innerWidth
        const height = Math.min(window.innerHeight * 0.7, 800) // Cap height
        setDimensions({ width, height })

        // Reinitialize nodes and connections when resizing
        initializeNodesAndConnections(width, height)
      }
    }

    handleResize() // Initial setup
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        mousePositionRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Initialize nodes and connections
  const initializeNodesAndConnections = (width: number, height: number) => {
    // Create nodes
    const nodeCount = Math.max(15, Math.floor((width * height) / 25000))
    const hubCount = Math.max(3, Math.floor(nodeCount / 5))

    const nodes: Node[] = []

    // Create hub nodes first (larger, more connections)
    for (let i = 0; i < hubCount; i++) {
      nodes.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 4 + 6, // Larger radius for hubs
        color: `rgba(147, 51, 234, ${Math.random() * 0.3 + 0.7})`, // Brighter purple
        connections: [],
        type: "hub",
        pulse: Math.random() * 2 * Math.PI,
        active: Math.random() > 0.5,
      })
    }

    // Create regular nodes
    for (let i = hubCount; i < nodeCount; i++) {
      const type = Math.random() > 0.7 ? "data" : "page"
      nodes.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: type === "data" ? Math.random() * 1.5 + 2 : Math.random() * 2 + 3,
        color:
          type === "data"
            ? `rgba(56, 189, 248, ${Math.random() * 0.3 + 0.6})` // Blue for data
            : `rgba(147, 51, 234, ${Math.random() * 0.3 + 0.6})`, // Purple for pages
        connections: [],
        type,
        pulse: Math.random() * 2 * Math.PI,
        active: Math.random() > 0.7,
      })
    }

    // Create connections
    const connections: Connection[] = []

    // Connect hubs to many nodes
    for (let i = 0; i < hubCount; i++) {
      const connectionCount = Math.floor(Math.random() * 10) + 5
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * (nodeCount - hubCount)) + hubCount

        if (!nodes[i].connections.includes(targetIndex)) {
          nodes[i].connections.push(targetIndex)
          nodes[targetIndex].connections.push(i)

          connections.push({
            from: i,
            to: targetIndex,
            strength: Math.random() * 0.5 + 0.5,
            active: Math.random() > 0.3,
            data: nodes[targetIndex].type === "data",
            progress: 0,
            speed: Math.random() * 0.01 + 0.005,
          })
        }
      }
    }

    // Connect some regular nodes to each other
    for (let i = hubCount; i < nodeCount; i++) {
      const connectionCount = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodeCount)

        if (targetIndex !== i && !nodes[i].connections.includes(targetIndex)) {
          nodes[i].connections.push(targetIndex)
          nodes[targetIndex].connections.push(i)

          connections.push({
            from: i,
            to: targetIndex,
            strength: Math.random() * 0.3 + 0.2,
            active: Math.random() > 0.5,
            data: nodes[targetIndex].type === "data" || nodes[i].type === "data",
            progress: 0,
            speed: Math.random() * 0.008 + 0.002,
          })
        }
      }
    }

    nodesRef.current = nodes
    connectionsRef.current = connections
  }

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return

    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const { width, height } = dimensions
      canvas.width = width
      canvas.height = height

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "rgba(9, 9, 11, 1)")
      gradient.addColorStop(1, "rgba(24, 24, 27, 0.8)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const nodes = nodesRef.current
      const connections = connectionsRef.current

      // Update frame counter
      frameCountRef.current++

      // Check for mouse interaction
      const mouseX = mousePositionRef.current.x
      const mouseY = mousePositionRef.current.y

      // Find closest node to mouse
      let closestNode = null
      let closestDistance = 100 // Only detect within 100px

      for (const node of nodes) {
        const dx = node.x - mouseX
        const dy = node.y - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < closestDistance) {
          closestDistance = distance
          closestNode = node.id
        }
      }

      activeNodeRef.current = closestNode

      // Draw connections first (so they appear behind nodes)
      for (let i = 0; i < connections.length; i++) {
        const connection = connections[i]
        const fromNode = nodes[connection.from]
        const toNode = nodes[connection.to]

        // Skip if either node is undefined
        if (!fromNode || !toNode) continue

        const dx = toNode.x - fromNode.x
        const dy = toNode.y - fromNode.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Only draw connections within a reasonable distance
        if (distance > 300) continue

        // Determine if this connection should be highlighted
        const isHighlighted =
          activeNodeRef.current !== null &&
          (connection.from === activeNodeRef.current || connection.to === activeNodeRef.current)

        // Base opacity on distance and connection strength
        let opacity = connection.strength * (1 - distance / 300)

        if (isHighlighted) {
          opacity = Math.min(opacity * 3, 1) // Boost opacity for highlighted connections
        }

        // Draw the connection line
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)

        const baseColor = connection.data ? "56, 189, 248" : "147, 51, 234" // Blue for data, purple for pages
        ctx.strokeStyle = `rgba(${baseColor}, ${opacity})`
        ctx.lineWidth = connection.data ? 1 : 1.5

        if (isHighlighted) {
          ctx.lineWidth *= 2
        }

        // Use dashed lines for some connections
        if (connection.data && !isHighlighted) {
          ctx.setLineDash([2, 4])
        } else {
          ctx.setLineDash([])
        }

        ctx.stroke()
        ctx.setLineDash([]) // Reset dash

        // Animate data flowing through active connections
        if (connection.active) {
          // Update progress
          connection.progress += connection.speed
          if (connection.progress > 1) {
            connection.progress = 0
            // Randomly deactivate some connections
            if (Math.random() > 0.7) {
              connection.active = false
              setTimeout(
                () => {
                  connection.active = true
                },
                Math.random() * 5000 + 1000,
              )
            }
          }

          // Draw the flowing particle
          const particleX = fromNode.x + dx * connection.progress
          const particleY = fromNode.y + dy * connection.progress

          ctx.beginPath()
          ctx.arc(particleX, particleY, connection.data ? 2 : 3, 0, Math.PI * 2)
          ctx.fillStyle = connection.data
            ? "rgba(56, 189, 248, 0.9)" // Blue for data
            : "rgba(147, 51, 234, 0.9)" // Purple for pages
          ctx.fill()
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // Update node position with slight randomness
        node.x += node.vx + (Math.random() - 0.5) * 0.1
        node.y += node.vy + (Math.random() - 0.5) * 0.1

        // Bounce off edges with some padding
        const padding = 50
        if (node.x < padding || node.x > width - padding) {
          node.vx *= -1
          node.x = Math.max(padding, Math.min(width - padding, node.x))
        }
        if (node.y < padding || node.y > height - padding) {
          node.vy *= -1
          node.y = Math.max(padding, Math.min(height - padding, node.y))
        }

        // Update pulse
        node.pulse += 0.05

        // Determine if this node is highlighted
        const isHighlighted = node.id === activeNodeRef.current

        // Draw the node
        ctx.beginPath()

        // Draw different shapes based on node type
        if (node.type === "hub") {
          // Draw hexagon for hub nodes
          const sides = 6
          const size = node.radius * (isHighlighted ? 1.5 : 1)

          ctx.beginPath()
          for (let j = 0; j < sides; j++) {
            const angle = (j * 2 * Math.PI) / sides + Math.PI / 6
            const x = node.x + size * Math.cos(angle)
            const y = node.y + size * Math.sin(angle)

            if (j === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
        } else if (node.type === "data") {
          // Draw square for data nodes
          const size = node.radius * (isHighlighted ? 1.5 : 1)
          ctx.rect(node.x - size, node.y - size, size * 2, size * 2)
        } else {
          // Draw circle for page nodes
          ctx.arc(node.x, node.y, node.radius * (isHighlighted ? 1.5 : 1), 0, Math.PI * 2)
        }

        // Fill with gradient for active nodes
        if (node.active || isHighlighted) {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            node.radius * 2 * (isHighlighted ? 1.5 : 1),
          )

          const baseColor = node.type === "data" ? "56, 189, 248" : "147, 51, 234"
          gradient.addColorStop(0, `rgba(${baseColor}, 0.9)`)
          gradient.addColorStop(1, `rgba(${baseColor}, 0.1)`)

          ctx.fillStyle = gradient
        } else {
          ctx.fillStyle = node.color
        }

        ctx.fill()

        // Add glow effect for active or highlighted nodes
        if (node.active || isHighlighted) {
          ctx.save()
          ctx.filter = `blur(${isHighlighted ? 8 : 4}px)`
          ctx.beginPath()

          if (node.type === "hub") {
            // Hexagon glow
            const sides = 6
            const size = node.radius * 1.2

            ctx.beginPath()
            for (let j = 0; j < sides; j++) {
              const angle = (j * 2 * Math.PI) / sides + Math.PI / 6
              const x = node.x + size * Math.cos(angle)
              const y = node.y + size * Math.sin(angle)

              if (j === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
            ctx.closePath()
          } else if (node.type === "data") {
            // Square glow
            const size = node.radius * 1.2
            ctx.rect(node.x - size, node.y - size, size * 2, size * 2)
          } else {
            // Circle glow
            ctx.arc(node.x, node.y, node.radius * 1.2, 0, Math.PI * 2)
          }

          const baseColor = node.type === "data" ? "56, 189, 248" : "147, 51, 234"
          ctx.fillStyle = `rgba(${baseColor}, ${isHighlighted ? 0.4 : 0.2})`
          ctx.fill()
          ctx.restore()
        }

        // Add pulsing effect for active nodes
        if (node.active) {
          const pulseSize = node.radius * (2 + Math.sin(node.pulse) * 0.5)
          const pulseOpacity = (0.1 * (1 + Math.sin(node.pulse))) / 2

          ctx.beginPath()
          ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2)

          const baseColor = node.type === "data" ? "56, 189, 248" : "147, 51, 234"
          ctx.fillStyle = `rgba(${baseColor}, ${pulseOpacity})`
          ctx.fill()
        }
      }

      // Randomly activate/deactivate nodes
      if (frameCountRef.current % 120 === 0) {
        const randomNodeIndex = Math.floor(Math.random() * nodes.length)
        nodes[randomNodeIndex].active = !nodes[randomNodeIndex].active

        // Activate/deactivate connections
        for (const connection of connections) {
          if (connection.from === randomNodeIndex || connection.to === randomNodeIndex) {
            connection.active = nodes[randomNodeIndex].active
          }
        }
      }

      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [dimensions])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-full w-full"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 opacity-90" />
      </motion.div>
    </div>
  )
}
