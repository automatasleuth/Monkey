"use client"

import { useState, useEffect } from "react"
import { Terminal, User, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function TerminalHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/playground", label: "Playground" },
    { href: "#", label: "Docs" },
    { href: "#", label: "API" },
    { href: "#", label: "Pricing" },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-purple-500" />
            <span className="font-display text-base font-semibold text-white">ZenCrawl</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center">
          <nav className="flex items-center space-x-6 mr-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium ${
                  pathname === item.href ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <Link href="/auth/login" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Login</span>
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] border-zinc-800 bg-zinc-950 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5 text-purple-500" />
                    <span className="font-display text-base font-semibold text-white">ZenCrawl</span>
                  </div>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>
                <nav className="flex flex-col p-4 space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`text-base font-medium px-2 py-2 rounded-md ${
                        pathname === item.href
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 mt-4 border-t border-zinc-800">
                    <Button
                      asChild
                      variant="outline"
                      size="default"
                      className="w-full justify-center border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700"
                    >
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
