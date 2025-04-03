"use client"

import { motion } from "framer-motion"

const howItWorks = [
  {
    title: "Install CLI",
    description: "Install the Kubeasy CLI tool",
    command: "npm install -g kubeasy-cli",
  },
  {
    title: "Setup Cluster",
    description: "Login and set up your local cluster",
    command: "kubeasy login && kubeasy setup",
  },
  {
    title: "Start Challenge",
    description: "Begin a new Kubernetes challenge",
    command: "kubeasy start <challenge-name>",
  },
  {
    title: "Practice & Validate",
    description: "Complete the challenge and verify your solution",
    command: "kubeasy verify <challenge-name>",
  },
] as const

export function HowItWorksSection() {
  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
      >
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">How It Works</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Get started with Kubeasy in just a few simple steps - no cost, no catch!
        </p>
      </motion.div>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {howItWorks.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {index + 1}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            <code className="mt-2 rounded bg-muted p-2 text-sm rounded-sm">{step.command}</code>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

