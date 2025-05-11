"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import Link from "next/link";
// Inline SVG illustration
const HeroIllustration = () => (
  <svg viewBox='0 0 420 260' fill='none' xmlns='http://www.w3.org/2000/svg' className='mx-auto w-[340px] md:w-[420px] lg:w-[480px] drop-shadow-xl' aria-hidden='true' focusable='false'>
    {/* Cloud base */}
    <ellipse cx='210' cy='200' rx='160' ry='40' className='fill-muted' />
    {/* Main circle */}
    <circle cx='210' cy='120' r='70' className='fill-primary/80' />
    {/* Accent ring */}
    <circle cx='210' cy='120' r='85' className='stroke-accent/70' strokeWidth='10' fill='none' />
    {/* Book/terminal shape */}
    <rect x='170' y='110' width='80' height='40' rx='8' className='fill-background stroke-primary/80' strokeWidth='3' />
    <rect x='180' y='120' width='60' height='8' rx='2' className='fill-accent/70' />
    <rect x='180' y='134' width='36' height='6' rx='2' className='fill-muted-foreground/70' />
    <rect x='220' y='134' width='20' height='6' rx='2' className='fill-primary/60' />
    {/* Decorative sparkles */}
    <circle cx='120' cy='80' r='8' className='fill-accent/60' />
    <circle cx='320' cy='70' r='5' className='fill-primary/60' />
    <circle cx='260' cy='50' r='4' className='fill-muted-foreground/60' />
  </svg>
);

export function HeroSection() {
  return (
    <section className='relative flex min-h-screen flex-col items-center justify-center space-y-10 py-24 overflow-hidden bg-background'>
      {/* Gradient background effect adapté dark mode */}
      <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/10 dark:from-primary/10 dark:via-background dark:to-secondary/20' />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='container flex flex-col items-center gap-8 py-16 md:py-32'>
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          href='#'
          className='inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/20 hover:bg-primary/20 transition-colors'
        >
          <Gift className='mr-2 h-4 w-4 text-primary' />
          100% Free Learning Platform
        </motion.a>
        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1] text-foreground text-center'
        >
          Master Kubernetes Through
          <br />
          <span className='bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>Interactive Challenges</span>
        </motion.h1>
        {/* Subtitle */}
        <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className='max-w-[750px] text-center text-lg sm:text-xl text-muted-foreground'>
          Build your Kubernetes skills with hands-on, progressive challenges. 100+ exercises, an active community, and everything you need to become production-ready—faster.
        </motion.span>
        {/* Illustration Hero */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }} className='my-6'>
          <HeroIllustration />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button size='lg' className='h-12 px-8 text-primary-foreground bg-primary shadow-lg hover:scale-105 transition-transform' asChild>
            <Link href='/learning-path'>
              <span className='inline-flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                Start your journey
              </span>
            </Link>
          </Button>
          <Button size='lg' variant='secondary' className='h-12 px-8' asChild>
            <Link href='/challenges'>
              <span className='inline-flex items-center gap-2 hover:scale-105 transition-transform'>
                <Gift className='h-5 w-5' />
                Explore challenges
              </span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
