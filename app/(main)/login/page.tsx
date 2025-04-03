"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Icons } from "@/components/icons"

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const searchParams = useSearchParams()
   
    const next = searchParams.get('next')
    const supabase = createClient()
  
    const handleLogin = async (provider: 'github'|'azure'|'google') => {
      setIsLoading(true)
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${next ?? '/'}`,
        },
      })
      setIsLoading(false)
    }

  return (
    <section className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in to Kubeasy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose your preferred method to sign in and start mastering Kubernetes
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            className="w-full bg-muted text-white"
            onClick={() => handleLogin("github")}
            disabled={isLoading}
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
          <Button
            className="w-full bg-muted text-white"
            onClick={() => handleLogin("azure")}
            disabled={isLoading}
          >
            <Icons.microsoft className="mr-2 h-4 w-4" />
            Sign in with Microsoft
          </Button>
          <Button
            className="w-full bg-muted text-white"
            onClick={() => handleLogin("google")}
            disabled={isLoading}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </section>
  )
}

