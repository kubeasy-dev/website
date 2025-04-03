"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { HandHeart } from "lucide-react"

export function OpenSourceSection() {
  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-8 text-center"
      >
        <HandHeart className="h-16 w-16 text-primary" />
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Open Source & Community-Driven</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Kubeasy thrives on community contributions. All challenges are open source and available on GitHub, making
          Kubernetes learning accessible for everyone.
        </p>
        <Button variant="outline">
          <Icons.gitHub className="mr-2 h-4 w-4" />
          Fork on GitHub
        </Button>
      </motion.div>
    </section>
  )
}

