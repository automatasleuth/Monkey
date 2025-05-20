"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Terminal, ArrowRight, Plus, X, FileText, Code, Database } from "lucide-react"
import { motion } from "framer-motion"

interface WorkflowStep {
  id: string
  type: string
  title: string
  config: Record<string, string>
}

export default function WorkflowBuilder() {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "step-1",
      type: "scrape",
      title: "Scrape Website",
      config: { url: "https://example.com/blog" },
    },
    {
      id: "step-2",
      type: "extract",
      title: "Extract Content",
      config: { selector: "article.post" },
    },
    {
      id: "step-3",
      type: "output",
      title: "Output as Markdown",
      config: { format: "markdown" },
    },
  ])

  const addStep = (type: string) => {
    const newStep: WorkflowStep = {
      id: `step-${steps.length + 1}`,
      type,
      title: type === "scrape" ? "Scrape Website" : type === "extract" ? "Extract Content" : "Output as JSON",
      config: {},
    }

    setSteps([...steps, newStep])
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id))
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "scrape":
        return <Terminal className="h-4 w-4" />
      case "extract":
        return <FileText className="h-4 w-4" />
      case "output":
        return <Code className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/20">
            <Terminal className="h-4 w-4 text-purple-400" />
          </div>
          <Input
            placeholder="Workflow name"
            defaultValue="Extract Blog Posts"
            className="max-w-xs border-zinc-800 bg-zinc-900 text-zinc-200 focus-visible:ring-purple-500"
          />
        </div>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          Run Workflow
        </Button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-zinc-800 bg-zinc-900/50 transition-all hover:border-purple-900/30 hover:bg-zinc-900">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                      {getStepIcon(step.type)}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-200">{step.title}</p>
                      <p className="text-xs text-zinc-400">
                        {Object.entries(step.config)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                      onClick={() => removeStep(step.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>

                    {index < steps.length - 1 && (
                      <div className="flex h-8 items-center">
                        <div className="h-0.5 w-4 bg-zinc-700"></div>
                        <ArrowRight className="h-4 w-4 text-zinc-500" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-center space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              onClick={() => addStep("scrape")}
            >
              <Plus className="mr-1 h-3 w-3" />
              Scrape
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              onClick={() => addStep("extract")}
            >
              <Plus className="mr-1 h-3 w-3" />
              Extract
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              onClick={() => addStep("output")}
            >
              <Plus className="mr-1 h-3 w-3" />
              Output
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
