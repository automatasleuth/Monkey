import PlaygroundInterface from "@/components/playground/playground-interface"
import TerminalHeader from "@/components/terminal-header"
import FloatingCTA from "@/components/floating-cta"

export default function PlaygroundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <TerminalHeader />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ZenCrawl Playground
            </h1>
            <p className="mt-2 text-lg text-zinc-400">API, Docs and Playground - all in one place</p>
          </div>

          <PlaygroundInterface />

          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-white">Recent Extractions</h2>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-purple-900/50 hover:bg-zinc-900/80 transition-all cursor-pointer"
                >
                  <div>
                    <div className="font-medium text-zinc-200">example.com/page-{i}</div>
                    <div className="text-sm text-zinc-500">Extracted 2 hours ago</div>
                  </div>
                  <div className="text-sm text-zinc-400">
                    {i === 1 ? "Single URL" : i === 2 ? "Crawl (5 pages)" : "Map"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <FloatingCTA delay={10000} />
    </div>
  )
}
