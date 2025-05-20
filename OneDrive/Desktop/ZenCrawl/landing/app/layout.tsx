import type React from "react"
import "@/styles/globals.css"
import { Inter, Space_Grotesk } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ParticleBackground from "@/components/particle-background"
import PlatformOptimizedUI from "@/components/platform-optimized-ui"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

export const metadata = {
  title: "ZenCrawl - Structured Web Intelligence for AI Builders",
  description:
    "ZenCrawl gives you the power to extract, structure, and ship web data at scale. Markdown, JSON, and HTML-ready for your AI workflows.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PlatformOptimizedUI>
            <ParticleBackground />
            {children}
          </PlatformOptimizedUI>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
