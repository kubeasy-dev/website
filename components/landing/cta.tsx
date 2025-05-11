"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "../ui/container";
import Link from "next/link";

export function CTASection() {
  return (
    <Container className='relative py-12 md:py-24 lg:py-32 overflow-hidden bg-background dark:bg-muted/70 rounded-xl shadow-lg dark:shadow-md mb-24 ring-2 ring-primary/30 dark:ring-muted/60 transition-all duration-200 hover:shadow-2xl dark:hover:shadow-lg'>
      {/* Gradient décoratif animé */}
      <div className='pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-primary/10 via-background to-secondary/10 dark:from-primary dark:via-accent dark:to-background/80 opacity-90' />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center'
      >
        <h2 className='text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl'>Ready to master Kubernetes?</h2>
        <p className='max-w-[85%] leading-normal sm:text-lg sm:leading-7'>Start your journey with Kubeasy today. It&apos;s completely free and always will be!</p>
        <div className='mt-6 flex flex-col sm:flex-row gap-4'>
          <Button size='lg' className='w-full sm:w-auto'>
            <Link href='/learning-path'>Get Started Now</Link>
          </Button>
          <Button size='lg' variant='secondary' className='w-full sm:w-auto' asChild>
            <Link href='/challenges'>Explore Challenges</Link>
          </Button>
        </div>
        <p className='mt-4 text-sm'>No credit card required. No hidden fees. Just free, quality Kubernetes education.</p>
      </motion.div>
    </Container>
  );
}
