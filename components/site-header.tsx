"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { ModeSwitcher } from "./mode-switcher";
import { Container } from "./ui/container";

export function SiteHeader() {
  const supabase = createClient();
  const [loggedIn, setLoggedIn] = useState(false);

  const getUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setLoggedIn(true);
    }
  }, [supabase]);

  useEffect(() => {
    getUser();
    return () => {
      setLoggedIn(false);
    };
  }, [getUser]);

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
            {loggedIn && (
              <Link href='/dashboard' className='hover:underline underline-offset-8 decoration-2 decoration-primary'>
                Dashboard
              </Link>
            )}
          </div>
          <div className='flex-1 flex justify-end  items-center space-x-4'>
            <ModeSwitcher />
            {loggedIn ? (
              <Button variant='ghost' asChild>
                <Link href='/profile'>
                  <User className='h-4 w-4' />
                  Profile
                </Link>
              </Button>
            ) : (
              <Button variant='ghost' asChild>
                <Link href='/login'>Sign In</Link>
              </Button>
            )}
          </div>
          {/* <Link href='/'>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className='text-2xl font-bold'>
              Kubeasy
            </motion.span>
          </Link>
          <div className='hidden md:flex items-center space-x-4'>
            <Link href='/challenges' className="hover:underline underline-offset-8 decoration-2 decoration-primary">
              Challenges
            </Link>
            {loggedIn && (
              <Link href='/dashboard' className="hover:underline underline-offset-8 decoration-2 decoration-primary">
                Dashboard
              </Link>
            )}
          </div>
          <div className='flex items-center space-x-4 w-20 bg-destructive'>
            <ModeSwitcher />
            {loggedIn ? (
              <Button variant='ghost' asChild>
                <Link href='/profile'>
                  <User className='h-4 w-4' />
                  Profile
                </Link>
              </Button>
            ) : (
              <Button variant='ghost' asChild>
                <Link href='/login'>Sign In</Link>
              </Button>
            )}
          </div> */}
        </div>
      </Container>
    </motion.header>
  );
}
