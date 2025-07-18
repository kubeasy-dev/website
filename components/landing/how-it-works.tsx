"use client";

import { motion } from "framer-motion";
import { CopyToClipboardStep } from "./copy-to-clipboard-step";

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
    <section className='py-16 px-4'>
      <div className='text-center'>
        <h2 className='text-lg text-primary mb-2 tracking-wider'>How It Works</h2>
        <h2 className='ext-3xl md:text-4xl font-bold mb-4'>Resolve your first challenge in 5 minutes</h2>
        <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
          Follow the steps below to start your first Kubernetes challenge with Kubeasy. In less than five minutes, you’ll be ready to solve your first scenario and explore the world of Kubernetes on
          your own.
        </p>
      </div>
      <div className='w-full flex justify-center my-6'>
        <div className='h-1 w-24 bg-primary/20 rounded-full' />
      </div>
      <div className='mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2'>
        {howItWorks.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className={index === howItWorks.length - 1 && howItWorks.length % 2 === 1 ? "md:col-span-2 md:mx-auto md:w-1/2" : ""}
          >
            <div className='bg-card rounded-xl flex flex-col items-start gap-1 h-full overflow-hidden shadow-lg'>
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground text-lg font-bold'>{index + 1}</div>
                  <h3 className='text-lg font-semibold leading-tight'>{step.title}</h3>
                </div>
                <p className='text-sm text-muted-foreground mb-0 min-h-[40px]'>{step.description}</p>
              </div>
              <div className='flex items-center w-full'>
                <code className='flex justify-between bg-muted px-3 py-2 text-sm font-mono w-full rounded-b-xl'>
                  <div className='flex items-center gap-1'>
                    <span className='text-muted-foreground'>&gt;</span>
                    {step.command}
                  </div>
                  <CopyToClipboardStep value={step.command} />
                </code>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
