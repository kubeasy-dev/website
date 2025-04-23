"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CompassIcon, GithubIcon, LifeBuoyIcon, LogInIcon, LogOutIcon, UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import React, { useCallback, useEffect, useState } from "react";
import { ModeSwitcher } from "./mode-switcher";
import { Container } from "./ui/container";
import { tryCatch } from "@/lib/try-catch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import posthog from "posthog-js";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function SiteHeader() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const getUser = useCallback(async () => {
    const { data: user, error } = await tryCatch(supabase.auth.getUser());
    if (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
    if (user?.data.user) {
      setUser(user.data.user);
    } else {
      setUser(null);
    }
  }, [supabase]);

  useEffect(() => {
    getUser();
    return () => {
      setUser(null);
    };
  }, [getUser]);

  const handleSignOut = async () => {
    posthog.capture("Logout");
    setUser(null);
    window.location.reload();
    await supabase.auth.signOut();
  };

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className='fixed top-0 z-50 w-full border-b'>
      <Container>
        <div className='h-20 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='flex-1'>
            <Link href='/'>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className='text-2xl font-bold'>
                Kubeasy
              </motion.span>
            </Link>
          </div>
          <div className='hidden flex-1 md:flex justify-center items-center space-x-4'>
            <Link href='/challenges' className='hover:underline underline-offset-8 decoration-2 decoration-primary'>
              Challenges
            </Link>
            <Link href='/documentation' className='hover:underline underline-offset-8 decoration-2 decoration-primary'>
              Documentation
            </Link>
            <Link href='/blog' className='hover:underline underline-offset-8 decoration-2 decoration-primary'>
              Blog
            </Link>
            <Link href='/about' className='hover:underline underline-offset-8 decoration-2 decoration-primary'>
              About
            </Link>
          </div>
          <div className='flex-1 flex justify-end items-center space-x-2'>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost'>
                    <UserIcon />
                    {user.user_metadata.full_name.split(" ")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href='/profile'>
                      <DropdownMenuItem>
                        <UserIcon />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href='/learning-path'>
                      <DropdownMenuItem>
                        <CompassIcon />
                        <span>My journey</span>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <GithubIcon />
                    <span>GitHub</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LifeBuoyIcon />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSignOut()}>
                    <LogOutIcon />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant='ghost' onClick={() => router.push("/login")}>
                <LogInIcon />
                Sign In
              </Button>
            )}
            <ModeSwitcher />
          </div>
        </div>
      </Container>
    </motion.header>
  );
}
