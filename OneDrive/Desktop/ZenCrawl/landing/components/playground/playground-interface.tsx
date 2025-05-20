"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Terminal,
  Globe,
  BugIcon as Spider,
  MapIcon,
  Search,
  Code,
  Play,
  ChevronDown,
  ChevronUp,
  Info,
  Download,
  Copy,
  Check,
  Layers,
  FileJson,
  FileText,
  Minimize2,
  Maximize2,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/hooks/use-platform"
import KeyboardShortcutsHelp from "@/components/playground/keyboard-shortcuts-help"
import { api } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { useHistoryStore } from "@/lib/history-store"
import { formatDistanceToNow } from "date-fns"

type TabType = "single" | "crawl" | "map" | "search"

interface PlaygroundProps {
  className?: string
}

interface Result {
  markdown?: string;
  links?: Array<{ url: string; text: string }>;
  html?: string;
  screenshot?: string;
  metadata?: any;
  scrapeId?: string;
  [key: string]: any;
}

export default function PlaygroundInterface({ className }: PlaygroundProps) {
  const { isMac, isLaptop } = usePlatform()
  const [activeTab, setActiveTab] = useState<TabType>("single")
  const [url, setUrl] = useState("https://docs.firecrawl.dev")
  const [searchQuery, setSearchQuery] = useState("Top restaurants in San Francisco")
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [resultTab, setResultTab] = useState<"preview" | "json" | "markdown" | "html">("preview")
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  // Single URL options
  const [excludeTags, setExcludeTags] = useState("script, ad, footer")
  const [includeTags, setIncludeTags] = useState("script, ad, footer")
  const [waitTime, setWaitTime] = useState("1000")
  const [timeout, setTimeout] = useState("30000")
  const [extractMainContent, setExtractMainContent] = useState(true)
  const [stealthMode, setStealthMode] = useState(false)

  // Crawl options
  const [crawlLimit, setCrawlLimit] = useState("10")
  const [maxDepth, setMaxDepth] = useState("")
  const [excludePaths, setExcludePaths] = useState("(blog/, */about/.*)")
  const [includePaths, setIncludePaths] = useState("articles/.*")
  const [ignoreSitemap, setIgnoreSitemap] = useState(false)
  const [allowBackwardsLinks, setAllowBackwardsLinks] = useState(false)

  // Map options
  const [mapSearch, setMapSearch] = useState("blog")
  const [includeSubdomains, setIncludeSubdomains] = useState(false)
  const [mapIgnoreSitemap, setMapIgnoreSitemap] = useState(false)

  // Search options
  const [scrapeSearchResults, setScrapeSearchResults] = useState(false)
  const [searchLimit, setSearchLimit] = useState("5")
  const [searchLanguage, setSearchLanguage] = useState("en")
  const [searchCountry, setSearchCountry] = useState("us")
  const [searchTimeBased, setSearchTimeBased] = useState("qdr:w")

  // Common options
  const [outputFormats, setOutputFormats] = useState({
    markdown: true,
    links: false,
    json: true,
  })
  const [htmlTypes, setHtmlTypes] = useState({
    cleaned: true,
    raw: false,
  })
  const [screenshotTypes, setScreenshotTypes] = useState({
    viewport: false,
    fullPage: false,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const { history, addToHistory, removeFromHistory } = useHistoryStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if modifier key is pressed (Cmd for Mac, Ctrl for Windows/Linux)
      const modifierKey = isMac ? e.metaKey : e.ctrlKey

      if (modifierKey) {
        switch (e.key) {
          case "Enter":
            // Run extraction
            e.preventDefault()
            if (!isRunning) handleRun()
            break
          case "o":
          case "O":
            // Toggle options
            e.preventDefault()
            setIsOptionsOpen(!isOptionsOpen)
            break
          case "l":
          case "L":
            // Focus URL input
            e.preventDefault()
            urlInputRef.current?.focus()
            break
          case "1":
            // Switch to Single URL tab
            e.preventDefault()
            setActiveTab("single")
            break
          case "2":
            // Switch to Crawl tab
            e.preventDefault()
            setActiveTab("crawl")
            break
          case "3":
            // Switch to Map tab
            e.preventDefault()
            setActiveTab("map")
            break
          case "4":
            // Switch to Search tab
            e.preventDefault()
            setActiveTab("search")
            break
          case "/":
            // Show keyboard shortcuts
            e.preventDefault()
            // This would trigger the keyboard shortcuts dialog
            break
        }
      }

      // Fullscreen toggle with F11 or Cmd/Ctrl+Shift+F
      if (e.key === "F11" || (modifierKey && e.shiftKey && (e.key === "f" || e.key === "F"))) {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }

      // Escape key to exit fullscreen
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMac, isRunning, isOptionsOpen, isFullscreen])

  // Handle API calls
  const handleRun = async () => {
    if (isRunning) return

    setIsRunning(true)
    setHasResult(false)

    try {
      let result;

      switch (activeTab) {
        case "single":
          result = await api.scrape(url, {
            timeout: parseInt(timeout),
            waitFor: parseInt(waitTime),
            extractMainContent,
            useStealth: stealthMode,
            excludeSelectors: excludeTags.split(",").map(tag => tag.trim()),
            includeSelectors: includeTags.split(",").map(tag => tag.trim()),
            output: {
              markdown: outputFormats.markdown,
              links: outputFormats.links,
              html: htmlTypes.cleaned ? "cleaned" : "raw",
              screenshot: screenshotTypes.viewport ? "viewport" : screenshotTypes.fullPage ? "full" : undefined,
            },
          });
          break;

        case "crawl":
          result = await api.crawl(url, {
            limit: parseInt(crawlLimit),
            maxDepth: maxDepth ? parseInt(maxDepth) : undefined,
            excludePaths: excludePaths.split(",").map(path => path.trim()),
            includeOnlyPaths: includePaths.split(",").map(path => path.trim()),
            ignoreSitemap,
            allowBackwardsLinks,
            pageOptions: {
              excludeTags,
              includeOnlyTags: includeTags,
              waitFor: parseInt(waitTime),
              timeout: parseInt(timeout),
              extractMainContent,
              useStealth: stealthMode,
            },
            output: {
              markdown: outputFormats.markdown,
              links: outputFormats.links,
              html: htmlTypes.cleaned ? "cleaned" : "raw",
              screenshot: screenshotTypes.viewport ? "viewport" : screenshotTypes.fullPage ? "full" : undefined,
            },
          });
          break;

        case "map":
          result = await api.map(url, {
            search: mapSearch,
            subdomains: includeSubdomains,
            ignoreSitemap: mapIgnoreSitemap,
          });
          break;

        case "search":
          result = await api.search(searchQuery, {
            country: searchCountry,
            language: searchLanguage,
            num: parseInt(searchLimit),
            scrapeContent: scrapeSearchResults,
          });
          break;
      }

      setHasResult(true)
      setResult(result)

      // Add to history
      addToHistory({
        type: activeTab,
        url: activeTab === "search" ? searchQuery : url,
        status: "completed",
        result,
      })

      // Scroll to results
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth" })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "An error occurred"
      
      // Add failed extraction to history
      addToHistory({
        type: activeTab,
        url: activeTab === "search" ? searchQuery : url,
        status: "failed",
        error: errorMessage,
      })

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleCopyCode = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle fullscreen toggle
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isFullscreen])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const fullscreenClass = isFullscreen ? "fixed inset-0 z-50 bg-zinc-950 overflow-auto p-4" : ""

  // Add this function to render the result content
  const renderResultContent = () => {
    if (!result) return null;

    switch (resultTab) {
      case "preview":
        return (
          <div className="prose prose-invert max-w-none">
            {result.markdown ? (
              <div dangerouslySetInnerHTML={{ __html: result.markdown }} />
            ) : result.html ? (
              <div dangerouslySetInnerHTML={{ __html: result.html }} />
            ) : (
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        );
      case "json":
        return (
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        );
      case "markdown":
        return result.markdown ? (
          <pre className="text-sm whitespace-pre-wrap">{result.markdown}</pre>
        ) : (
          <div className="text-zinc-400">No markdown content available</div>
        );
      case "html":
        return result.html ? (
          <pre className="text-sm overflow-auto">{result.html}</pre>
        ) : (
          <div className="text-zinc-400">No HTML content available</div>
        );
      default:
        return null;
    }
  };

  // Add function to load history item
  const loadHistoryItem = (item: ExtractionHistory) => {
    if (item.status === "failed") {
      toast({
        title: "Error",
        description: item.error || "Failed to load history item",
        variant: "destructive",
      })
      return
    }

    setActiveTab(item.type)
    if (item.type === "search") {
      setSearchQuery(item.url)
    } else {
      setUrl(item.url)
    }
    setResult(item.result)
    setHasResult(true)
    setResultTab("preview")
  }

  return (
    <div className={cn("flex min-h-screen flex-col bg-zinc-950 text-zinc-100", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5 text-purple-500" />
          <h2 className="font-display text-lg font-bold text-white">ZenCrawl Playground</h2>
          <Badge variant="outline" className="ml-2 border-zinc-700 bg-zinc-800/50 text-xs text-zinc-400">
            Beta
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <KeyboardShortcutsHelp />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                <div className="mt-1 text-xs text-zinc-500">{isMac ? "⌘+Shift+F" : "F11"}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4">
        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
            <TabsList className="grid w-full grid-cols-4 bg-zinc-800/50">
              <TabsTrigger value="single">
                <Globe className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Single URL</span>
                <span className="inline sm:hidden">URL</span>
                <span className="ml-2 hidden text-xs text-zinc-500 lg:inline">{isMac ? "⌘+1" : "Ctrl+1"}</span>
              </TabsTrigger>
              <TabsTrigger value="crawl">
                <Spider className="mr-2 h-4 w-4" />
                <span>Crawl</span>
                <span className="ml-2 hidden text-xs text-zinc-500 lg:inline">{isMac ? "⌘+2" : "Ctrl+2"}</span>
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapIcon className="mr-2 h-4 w-4" />
                <span>Map</span>
                <span className="ml-2 hidden text-xs text-zinc-500 lg:inline">{isMac ? "⌘+3" : "Ctrl+3"}</span>
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
                <span className="ml-2 hidden text-xs text-zinc-500 lg:inline">{isMac ? "⌘+4" : "Ctrl+4"}</span>
                <Badge className="ml-1 bg-purple-600 text-[10px] px-1 py-0">NEW</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* URL/Query Input */}
        <motion.div variants={itemVariants} className="mb-4">
          <Label htmlFor="url" className="mb-2 block text-sm font-medium text-zinc-400">
            {activeTab === "single"
              ? "URL"
              : activeTab === "crawl"
                ? "Start URL"
                : activeTab === "map"
                  ? "Site URL"
                  : "Search Query"}
          </Label>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="relative flex-grow">
              {activeTab !== "search" ? (
                <Input
                  id="url"
                  ref={urlInputRef}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border-zinc-700 bg-zinc-800/50 text-zinc-200 focus-visible:ring-purple-500"
                  placeholder={
                    activeTab === "single"
                      ? "https://example.com/page"
                      : activeTab === "crawl"
                        ? "https://example.com"
                        : "https://example.com"
                  }
                />
              ) : (
                <Input
                  id="search-query"
                  ref={urlInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-zinc-700 bg-zinc-800/50 text-zinc-200 focus-visible:ring-purple-500"
                  placeholder="web scraping tutorial"
                />
              )}
              {activeTab === "single" && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-zinc-500" />
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      onClick={() => {}}
                    >
                      <Code className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Get Code</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Generate code for this configuration</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={cn(
                        "flex-1 sm:flex-none bg-purple-600 text-white hover:bg-purple-700",
                        isRunning && "opacity-80 cursor-not-allowed",
                      )}
                      onClick={handleRun}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          <span>Run</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Run extraction
                    <div className="mt-1 text-xs text-zinc-500">{isMac ? "⌘+Enter" : "Ctrl+Enter"}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </motion.div>

        {/* Options Toggle */}
        <motion.div variants={itemVariants}>
          <div
            className="flex items-center justify-between cursor-pointer py-2 mb-2"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          >
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-zinc-400">Options</h3>
              <Badge className="ml-2 bg-zinc-800 text-zinc-400 text-[10px]">{isOptionsOpen ? "Hide" : "Show"}</Badge>
              <span className="ml-2 text-xs text-zinc-500">{isMac ? "⌘+O" : "Ctrl+O"}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isOptionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <AnimatePresence>
            {isOptionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="border-zinc-800 bg-zinc-900/30 p-4">
                  {/* Single URL Options */}
                  {activeTab === "single" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-zinc-300">Page Options</h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Check the docs for more options</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="exclude-tags" className="mb-1 block text-xs text-zinc-400">
                                  Exclude Tags
                                </Label>
                                <Input
                                  id="exclude-tags"
                                  value={excludeTags}
                                  onChange={(e) => setExcludeTags(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="script, ad, footer"
                                />
                              </div>
                              <div>
                                <Label htmlFor="include-tags" className="mb-1 block text-xs text-zinc-400">
                                  Include Only Tags
                                </Label>
                                <Input
                                  id="include-tags"
                                  value={includeTags}
                                  onChange={(e) => setIncludeTags(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="article, main, section"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="wait-time" className="mb-1 block text-xs text-zinc-400">
                                  Wait for (in ms)
                                </Label>
                                <Input
                                  id="wait-time"
                                  type="number"
                                  value={waitTime}
                                  onChange={(e) => setWaitTime(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="1000"
                                />
                              </div>
                              <div>
                                <Label htmlFor="timeout" className="mb-1 block text-xs text-zinc-400">
                                  Timeout (in ms)
                                </Label>
                                <Input
                                  id="timeout"
                                  type="number"
                                  value={timeout}
                                  onChange={(e) => setTimeout(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="30000"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="extract-main"
                                  checked={extractMainContent}
                                  onCheckedChange={(checked) => setExtractMainContent(checked as boolean)}
                                />
                                <Label htmlFor="extract-main" className="text-sm text-zinc-300">
                                  Extract only main content (no headers, navs, footers, etc.)
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="stealth-mode"
                                  checked={stealthMode}
                                  onCheckedChange={(checked) => setStealthMode(checked as boolean)}
                                />
                                <div className="flex items-center">
                                  <Label htmlFor="stealth-mode" className="text-sm text-zinc-300">
                                    Use stealth mode
                                  </Label>
                                  <Badge className="ml-2 bg-zinc-800 text-zinc-400 text-[10px]">5 credits/page</Badge>
                                </div>
                              </div>
                            </div>

                            {/* Output formats section */}
                            {renderOutputFormatsSection()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Crawl Options */}
                  {activeTab === "crawl" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-zinc-300">Crawler Options</h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Check the docs for more options</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="crawl-limit" className="mb-1 block text-xs text-zinc-400">
                                  Limit
                                </Label>
                                <Input
                                  id="crawl-limit"
                                  type="number"
                                  value={crawlLimit}
                                  onChange={(e) => setCrawlLimit(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="10"
                                />
                              </div>
                              <div>
                                <Label htmlFor="max-depth" className="mb-1 block text-xs text-zinc-400">
                                  Max depth
                                </Label>
                                <Input
                                  id="max-depth"
                                  type="number"
                                  value={maxDepth}
                                  onChange={(e) => setMaxDepth(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="Enter max depth"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="exclude-paths" className="mb-1 block text-xs text-zinc-400">
                                  Exclude Paths
                                </Label>
                                <Input
                                  id="exclude-paths"
                                  value={excludePaths}
                                  onChange={(e) => setExcludePaths(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="(blog/, */about/.*)"
                                />
                              </div>
                              <div>
                                <Label htmlFor="include-paths" className="mb-1 block text-xs text-zinc-400">
                                  Include Only Paths
                                </Label>
                                <Input
                                  id="include-paths"
                                  value={includePaths}
                                  onChange={(e) => setIncludePaths(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="articles/.*"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="ignore-sitemap"
                                  checked={ignoreSitemap}
                                  onCheckedChange={(checked) => setIgnoreSitemap(checked as boolean)}
                                />
                                <Label htmlFor="ignore-sitemap" className="text-sm text-zinc-300">
                                  Ignore sitemap
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="allow-backwards"
                                  checked={allowBackwardsLinks}
                                  onCheckedChange={(checked) => setAllowBackwardsLinks(checked as boolean)}
                                />
                                <Label htmlFor="allow-backwards" className="text-sm text-zinc-300">
                                  Allow backwards links
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Page options section */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-zinc-300">Page Options</h4>

                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="extract-main-crawl"
                                    checked={extractMainContent}
                                    onCheckedChange={(checked) => setExtractMainContent(checked as boolean)}
                                  />
                                  <Label htmlFor="extract-main-crawl" className="text-sm text-zinc-300">
                                    Extract only main content (no headers, navs, footers, etc.)
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="stealth-mode-crawl"
                                    checked={stealthMode}
                                    onCheckedChange={(checked) => setStealthMode(checked as boolean)}
                                  />
                                  <div className="flex items-center">
                                    <Label htmlFor="stealth-mode-crawl" className="text-sm text-zinc-300">
                                      Use stealth mode
                                    </Label>
                                    <Badge className="ml-2 bg-zinc-800 text-zinc-400 text-[10px]">5 credits/page</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Output formats section */}
                            {renderOutputFormatsSection()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Map Options */}
                  {activeTab === "map" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-zinc-300">Map Options</h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Check the docs for more options</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="map-search" className="mb-1 block text-xs text-zinc-400">
                                Search (Beta)
                              </Label>
                              <Input
                                id="map-search"
                                value={mapSearch}
                                onChange={(e) => setMapSearch(e.target.value)}
                                className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                placeholder="blog"
                              />
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="include-subdomains"
                                  checked={includeSubdomains}
                                  onCheckedChange={(checked) => setIncludeSubdomains(checked as boolean)}
                                />
                                <Label htmlFor="include-subdomains" className="text-sm text-zinc-300">
                                  Include subdomains
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="map-ignore-sitemap"
                                  checked={mapIgnoreSitemap}
                                  onCheckedChange={(checked) => setMapIgnoreSitemap(checked as boolean)}
                                />
                                <Label htmlFor="map-ignore-sitemap" className="text-sm text-zinc-300">
                                  Ignore sitemap
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Output formats section */}
                            {renderOutputFormatsSection()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Options */}
                  {activeTab === "search" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-zinc-300">Search Options</h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Check the docs for more options</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="scrape-search-results"
                                checked={scrapeSearchResults}
                                onCheckedChange={(checked) => setScrapeSearchResults(checked as boolean)}
                              />
                              <Label htmlFor="scrape-search-results" className="text-sm text-zinc-300">
                                Scrape content from search results
                              </Label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="search-limit" className="mb-1 block text-xs text-zinc-400">
                                  Limit
                                </Label>
                                <Input
                                  id="search-limit"
                                  type="number"
                                  value={searchLimit}
                                  onChange={(e) => setSearchLimit(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="5"
                                />
                              </div>
                              <div>
                                <Label htmlFor="search-language" className="mb-1 block text-xs text-zinc-400">
                                  Language (Optional)
                                </Label>
                                <Input
                                  id="search-language"
                                  value={searchLanguage}
                                  onChange={(e) => setSearchLanguage(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="en"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="search-country" className="mb-1 block text-xs text-zinc-400">
                                  Country (Optional)
                                </Label>
                                <Input
                                  id="search-country"
                                  value={searchCountry}
                                  onChange={(e) => setSearchCountry(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="us"
                                />
                              </div>
                              <div>
                                <Label htmlFor="search-time" className="mb-1 block text-xs text-zinc-400">
                                  Time-based (Optional)
                                </Label>
                                <Input
                                  id="search-time"
                                  value={searchTimeBased}
                                  onChange={(e) => setSearchTimeBased(e.target.value)}
                                  className="border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm focus-visible:ring-purple-500"
                                  placeholder="qdr:w"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Output formats section */}
                            {renderOutputFormatsSection()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full border-4 border-zinc-700 border-t-purple-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Terminal className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  Processing {activeTab === "single" ? "URL" : activeTab}
                </h3>
                <p className="text-zinc-400">This may take a few moments...</p>

                <div className="mt-4 w-full max-w-md">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full animate-progress bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  </div>
                </div>

                <div className="mt-4 font-mono text-xs text-zinc-500">
                  <div className="animate-pulse">Connecting to target...</div>
                </div>
              </div>
            </motion.div>
          )}

          {hasResult && (
            <div ref={resultRef} className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-white">Result</h2>
                <div className="flex items-center space-x-2">
                  <Tabs value={resultTab} onValueChange={(v) => setResultTab(v as any)}>
                    <TabsList>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="json">JSON</TabsTrigger>
                      <TabsTrigger value="markdown">Markdown</TabsTrigger>
                      <TabsTrigger value="html">HTML</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-8 w-8"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="max-h-[500px] overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-4">
                {renderResultContent()}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Recent Extractions Section */}
        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">Recent Extractions</h2>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                onClick={() => useHistoryStore.getState().clearHistory()}
              >
                Clear History
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                No recent extractions
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-purple-900/50 hover:bg-zinc-900/80 transition-all"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => loadHistoryItem(item)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-zinc-200 truncate">
                        {item.url}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          item.status === "completed"
                            ? "border-green-900/50 text-green-400"
                            : "border-red-900/50 text-red-400"
                        )}
                      >
                        {item.status === "completed" ? "Completed" : "Failed"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-zinc-500">
                      <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromHistory(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )

  // Helper function to render the output formats section
  function renderOutputFormatsSection() {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium text-zinc-300">Output Formats</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="markdown-format"
                checked={outputFormats.markdown}
                onCheckedChange={(checked) => setOutputFormats({ ...outputFormats, markdown: checked as boolean })}
              />
              <Label htmlFor="markdown-format" className="text-sm text-zinc-300">
                Markdown
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="links-format"
                checked={outputFormats.links}
                onCheckedChange={(checked) => setOutputFormats({ ...outputFormats, links: checked as boolean })}
              />
              <Label htmlFor="links-format" className="text-sm text-zinc-300">
                Links
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="json-format"
                checked={outputFormats.json}
                onCheckedChange={(checked) => setOutputFormats({ ...outputFormats, json: checked as boolean })}
              />
              <div className="flex items-center">
                <Label htmlFor="json-format" className="text-sm text-zinc-300">
                  JSON
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-1 h-3 w-3 text-zinc-500" />
                    </TooltipTrigger>
                    <TooltipContent side="top">See documentation</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-300">HTML Types</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="html-cleaned-format"
                  checked={htmlTypes.cleaned}
                  onCheckedChange={(checked) => setHtmlTypes({ ...htmlTypes, cleaned: checked as boolean })}
                />
                <Label htmlFor="html-cleaned-format" className="text-sm text-zinc-300">
                  HTML (cleaned)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="raw-html-format"
                  checked={htmlTypes.raw}
                  onCheckedChange={(checked) => setHtmlTypes({ ...htmlTypes, raw: checked as boolean })}
                />
                <Label htmlFor="raw-html-format" className="text-sm text-zinc-300">
                  Raw HTML
                </Label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-300">Screenshot Types</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="viewport-format"
                  checked={screenshotTypes.viewport}
                  onCheckedChange={(checked) =>
                    setScreenshotTypes({ ...screenshotTypes, viewport: checked as boolean })
                  }
                />
                <Label htmlFor="viewport-format" className="text-sm text-zinc-300">
                  Viewport
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="full-page-format"
                  checked={screenshotTypes.fullPage}
                  onCheckedChange={(checked) =>
                    setScreenshotTypes({ ...screenshotTypes, fullPage: checked as boolean })
                  }
                />
                <Label htmlFor="full-page-format" className="text-sm text-zinc-300">
                  Full Page
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
