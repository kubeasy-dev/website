"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import { ModeSwitcher } from "./mode-switcher";
import { Container } from "./ui/container";
import { useRouter } from "next/navigation";
import { UserDropdown } from "./user-dropdown";
import useSupabase from "@/hooks/use-supabase";
import { useQuery } from "@tanstack/react-query";

export function SiteHeader() {
  const supabase = useSupabase();
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
    refetchOnWindowFocus: true,
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className='fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
    >
      <Container>
        <div className='h-20 flex items-center justify-between'>
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
          <div className='flex-1 flex justify-end'>
            {user ? (
              <UserDropdown />
            ) : (
              <div className='flex items-center space-x-2'>
                <Button variant='ghost' onClick={() => router.push("/login")}>
                  <LogInIcon />
                  Sign In
                </Button>
                <ModeSwitcher />
              </div>
            )}
          </div>
        </div>
      </Container>
    </motion.header>
  );
}
