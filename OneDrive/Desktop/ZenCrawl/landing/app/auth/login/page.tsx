import Link from "next/link"
import { Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import TerminalHeader from "@/components/terminal-header"
import AuthBackground from "@/components/auth/auth-background"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <TerminalHeader />

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        <AuthBackground />

        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/30">
              <Terminal className="h-6 w-6 text-purple-400" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-zinc-400">Sign in to your ZenCrawl account</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <div className="p-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-400">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="border-zinc-800 bg-zinc-800/50 text-zinc-200 focus-visible:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-400">
                      Password
                    </Label>
                    <Link href="/auth/reset-password" className="text-xs text-purple-400 hover:text-purple-300">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="border-zinc-800 bg-zinc-800/50 text-zinc-200 focus-visible:ring-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm text-zinc-400">
                    Remember me for 30 days
                  </Label>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  Sign in
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                  >
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 bg-zinc-900/30 p-4 text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-purple-400 hover:text-purple-300">
                Sign up
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500">
            By signing in, you agree to our{" "}
            <Link href="#" className="text-zinc-400 hover:text-zinc-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-zinc-400 hover:text-zinc-300">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
