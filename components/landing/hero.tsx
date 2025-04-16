"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className='flex min-h-screen flex-col items-center justify-center space-y-10 py-24'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='container flex flex-col items-center justify-center gap-6 text-center'>
        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} href='#' className='inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-medium'>
          <Gift className='mr-2 h-4 w-4' /> 100% Free Learning Platform
        </motion.a>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]'
        >
          Master Kubernetes Through
          <br />
          Interactive Challenges
        </motion.h1>
        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className='max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl'>
          Learn Kubernetes by doing. Practical, hands-on challenges designed to help you master container orchestration in a local environment. And it&apos;s completely free!
        </motion.span>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className='flex gap-4'>
          <Button size='lg' className='h-12 px-8 text-white' asChild>
            <Link href='/challenges'>View Challenges</Link>
          </Button>
          <Button size='lg' variant='outline' className='h-12 px-8'>
            <Link href='/project'>Learn More</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
