"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
      >
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Ready to master Kubernetes?</h2>
        <p className="max-w-[85%] leading-normal sm:text-lg sm:leading-7">
          Start your journey with Kubeasy today. It's completely free and always will be!
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            Get Started Now
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            View All Challenges
          </Button>
        </div>
        <p className="mt-4 text-sm">
          No credit card required. No hidden fees. Just free, quality Kubernetes education.
        </p>
      </motion.div>
    </section>
  )
}

