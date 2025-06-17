"use client";

import { motion } from "framer-motion";

const howItWorks = [
  {
    title: "Install the CLI",
    description: "Install the Kubeasy command-line tool on your machine.",
    command: "npm install -g @kubeasy-dev/kubeasy-cli",
  },
  {
    title: "Authenticate",
    description: "Generate an API token and log in to your Kubeasy account.",
    command: "kubeasy login",
  },
  {
    title: "Prepare Your Environment",
    description: "Set up a local Kubernetes cluster to run challenges.",
    command: "kubeasy cluster setup",
  },
  {
    title: "Start a Challenge",
    description: "Launch a challenge and get your initial setup.",
    command: "kubeasy challenge start",
  },
  {
    title: "Solve & Submit",
    description: "Solve the challenge, then run validation to check your solution.",
    command: "kubeasy challenge submit",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='mx-auto flex max-w-232 flex-col items-center justify-center gap-4 text-center'
      >
        <h2 className='text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl'>How It Works</h2>
        <p className='max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7'>Start learning Kubernetes with hands-on challenges — fast, free, and effective.</p>
      </motion.div>
      <div className='mt-12 grid grid-cols-1 gap-y-12 md:grid-cols-5'>
        {howItWorks.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className='flex flex-col items-center text-center min-h-[250px]' // ajuste si besoin
          >
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium'>{index + 1}</div>
            <h3 className='mb-1 text-base font-semibold'>{step.title}</h3>
            <p className='mb-2 text-sm text-muted-foreground min-h-[48px]'>{step.description}</p>
            <code className='rounded bg-muted px-2 py-1 text-sm font-mono'>{step.command}</code>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
