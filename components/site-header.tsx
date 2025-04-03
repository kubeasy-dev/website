"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCallback, useEffect, useState } from "react"
import { ModeSwitcher } from "./mode-switcher"

export function SiteHeader() {
  const supabase = createClient()
  const [loggedIn, setLoggedIn] = useState(false)

  const getUser = useCallback(async () => {
    const {data: { user}} = await supabase.auth.getUser()
    if (user) {
      setLoggedIn(true)
    }
  }, [supabase])

  useEffect(() => {
    getUser()
    return () => {
      setLoggedIn(false)
    }
  }, [getUser])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold"
          >
            Kubeasy
          </motion.span>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/challenges" legacyBehavior passHref>
                <NavigationMenuLink className="h-10 px-4 py-2">Challenges</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center space-x-4">
          <ModeSwitcher />
          {loggedIn ? (
            <Button variant="ghost" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
}

