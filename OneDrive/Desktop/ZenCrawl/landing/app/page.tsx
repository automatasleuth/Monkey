import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  ArrowRight,
  Terminal,
  Search,
  BugIcon as Spider,
  Map,
  Brain,
  BarChartIcon as ChartBar,
  Microscope,
  TrendingUp,
  Github,
  Linkedin,
  CheckCircle2,
} from "lucide-react"
import PricingToggle from "@/components/pricing-toggle"
import FeatureCard from "@/components/feature-card"
import WorkflowBuilder from "@/components/workflow-builder"
import EnhancedHeroAnimation from "@/components/enhanced-hero-animation"
import ArchitectureFlow from "@/components/architecture-flow"
import TerminalHeader from "@/components/terminal-header"
import FloatingTerminal from "@/components/floating-terminal"
import FloatingCTA from "@/components/floating-cta"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <TerminalHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-32">
        <div className="absolute inset-0 z-0">
          <EnhancedHeroAnimation />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-purple-900/30 text-purple-400 hover:bg-purple-900/30">
              Beta Access Available
            </Badge>
            <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Structured Web Intelligence for AI Builders
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-base text-zinc-400 sm:mb-10 sm:text-lg md:text-xl">
              ZenCrawl gives you the power to extract, structure, and ship web data at scale. Markdown, JSON, and
              HTML-ready for your AI workflows.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full bg-purple-600 text-white hover:bg-purple-700 sm:w-auto" asChild>
                <Link href="/playground">Launch Playground</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white sm:w-auto"
              >
                See How It Works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <FloatingTerminal />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What You Can Do with ZenCrawl
            </h2>
            <p className="mt-4 text-zinc-400">Extract, transform, and structure web data with precision and scale</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="Scrape"
              description="Pull clean, readable content from a single page"
              icon={<Terminal className="h-10 w-10 text-purple-500" />}
              animationName="zoom-in"
            />
            <FeatureCard
              title="Map"
              description="Instantly chart out an entire site's structure"
              icon={<Map className="h-10 w-10 text-blue-500" />}
              animationName="radar-scan"
            />
            <FeatureCard
              title="Crawl"
              description="Traverse and extract data across subpages"
              icon={<Spider className="h-10 w-10 text-green-500" />}
              animationName="spider-crawl"
            />
            <FeatureCard
              title="Search"
              description="Query the web and capture result content"
              icon={<Search className="h-10 w-10 text-amber-500" />}
              animationName="search-spotlight"
            />
          </div>
        </div>
      </section>

      {/* Playground Preview */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <Badge className="mb-4 bg-zinc-800 text-zinc-400 hover:bg-zinc-800">ZenFlow UI</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Command-Center for Web Data
            </h2>
            <p className="mt-4 text-zinc-400">Build modular extraction workflows with our intuitive interface</p>
          </div>

          <div className="mx-auto max-w-5xl rounded-xl border border-zinc-800 bg-zinc-900/50 p-1 shadow-2xl">
            <div className="rounded-lg bg-zinc-950 p-4">
              <Tabs defaultValue="control" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-3 bg-zinc-900">
                  <TabsTrigger value="control">Control Panel</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="output">Output Viewer</TabsTrigger>
                </TabsList>
                <TabsContent value="control" className="mt-0">
                  <WorkflowBuilder />
                </TabsContent>
                <TabsContent value="history" className="mt-0">
                  <div className="h-[400px] rounded-md border border-zinc-800 bg-zinc-900/50 p-4 font-mono text-sm text-zinc-400">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span>crawl-task-239fd</span>
                      <span className="text-green-500">Completed</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-zinc-800 py-2">
                      <span>extract-blog-posts</span>
                      <span className="text-green-500">Completed</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-zinc-800 py-2">
                      <span>map-competitor-site</span>
                      <span className="text-amber-500">Running</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="output" className="mt-0">
                  <div className="h-[400px] overflow-auto rounded-md border border-zinc-800 bg-zinc-900/50 p-4 font-mono text-sm text-zinc-400">
                    <pre className="text-green-400"># Extracted Content</pre>
                    <pre>{`{
  "title": "Understanding Web Crawling",
  "author": "ZenCrawl Team",
  "date": "2023-05-15",
  "content": "Web crawling is the process of...",
  "links": [
    {"url": "/blog/web-scraping", "text": "Web Scraping Basics"},
    {"url": "/blog/data-extraction", "text": "Data Extraction"}
  ]
}`}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built For Modern Data Teams
            </h2>
            <p className="mt-4 text-zinc-400">Powerful tools for professionals who need structured web data</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-purple-900/50 hover:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/20">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-white">AI Engineers</h3>
              <p className="text-zinc-400">Train models on structured web data with consistent formatting</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-blue-900/50 hover:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/20">
                <ChartBar className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-white">Data Scientists</h3>
              <p className="text-zinc-400">Extract and analyze web data at scale without manual cleaning</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-green-900/50 hover:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-900/20">
                <Microscope className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-white">Researchers</h3>
              <p className="text-zinc-400">Gather and structure information from multiple sources automatically</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-amber-900/50 hover:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-900/20">
                <TrendingUp className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-white">Market Analysts</h3>
              <p className="text-zinc-400">Summarize 100 articles from your competitor's blog with one command</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How ZenCrawl Works
            </h2>
            <p className="mt-4 text-zinc-400">A powerful architecture designed for speed, scale, and precision</p>
          </div>

          <ArchitectureFlow />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-zinc-400">Start for free, upgrade as you grow</p>

            <div className="mt-8 flex items-center justify-center">
              <PricingToggle />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Free Plan */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4">
                <h3 className="font-display text-xl font-bold text-white">Free</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="font-display text-4xl font-bold text-white">$0</span>
                  <span className="ml-1 text-zinc-400">/month</span>
                </div>
                <p className="mt-4 text-zinc-400">Perfect for trying out ZenCrawl</p>
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">100 credits/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">Basic extraction</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">24-hour history</span>
                </li>
              </ul>

              <Button className="mt-8 w-full bg-zinc-800 text-white hover:bg-zinc-700">Get Started</Button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-xl border border-purple-700 bg-zinc-900/50 p-6 shadow-[0_0_30px_rgba(147,51,234,0.15)]">
              <div className="mb-4">
                <Badge className="mb-2 bg-purple-900/30 text-purple-400 hover:bg-purple-900/30">Popular</Badge>
                <h3 className="font-display text-xl font-bold text-white">Pro</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="font-display text-4xl font-bold text-white">$49</span>
                  <span className="ml-1 text-zinc-400">/month</span>
                </div>
                <p className="mt-4 text-zinc-400">For individual developers</p>
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">1,000 credits/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">Advanced extraction</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">30-day history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">API access</span>
                </li>
              </ul>

              <Button className="mt-8 w-full bg-purple-600 text-white hover:bg-purple-700">Subscribe Now</Button>
            </div>

            {/* Growth Plan */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4">
                <h3 className="font-display text-xl font-bold text-white">Growth</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="font-display text-4xl font-bold text-white">$149</span>
                  <span className="ml-1 text-zinc-400">/month</span>
                </div>
                <p className="mt-4 text-zinc-400">For growing teams</p>
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">5,000 credits/month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">All extraction features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">90-day history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">Team management</span>
                </li>
              </ul>

              <Button className="mt-8 w-full bg-zinc-800 text-white hover:bg-zinc-700">Subscribe Now</Button>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4">
                <h3 className="font-display text-xl font-bold text-white">Enterprise</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="font-display text-xl font-bold text-white">Custom pricing</span>
                </div>
                <p className="mt-4 text-zinc-400">For large organizations</p>
              </div>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">Unlimited credits</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">Unlimited history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-zinc-300">Dedicated support</span>
                </li>
              </ul>

              <Button className="mt-8 w-full bg-zinc-800 text-white hover:bg-zinc-700">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="flex items-center">
                <Terminal className="mr-2 h-6 w-6 text-purple-500" />
                <span className="font-display text-xl font-bold text-white">ZenCrawl</span>
              </div>
              <p className="mt-4 max-w-md text-zinc-400">
                Structured web intelligence for AI builders. Extract, structure, and ship web data at scale.
              </p>
              <div className="mt-6">
                <p className="text-zinc-400">contact@zencrawl.com</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-zinc-400">Product</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      Docs
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      API
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-zinc-400">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-zinc-400">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-zinc-400 hover:text-white">
                      Terms
                    </Link>
                  </li>
                </ul>

                <div className="mt-8 flex space-x-4">
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-zinc-800 pt-8">
            <p className="text-center text-sm text-zinc-400">
              &copy; {new Date().getFullYear()} ZenCrawl. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <FloatingCTA delay={5000} />
    </div>
  )
}
