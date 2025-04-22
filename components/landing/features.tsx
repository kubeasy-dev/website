"use client";

import { motion } from "framer-motion";
import { Code, Trophy, Laptop } from "lucide-react";
import { Container } from "@/components/ui/container";

const features = [
  {
    name: "Practical Learning",
    description: "Learn through hands-on challenges that simulate real-world scenarios and best practices.",
    icon: Code,
  },
  {
    name: "Track Achievement",
    description: "Monitor your progress, earn badges, and showcase your Kubernetes expertise.",
    icon: Trophy,
  },
  {
    name: "Local Environment",
    description: "Your computer, your text editor, your terminal. Practice Kubernetes without leaving your machine.",
    icon: Laptop,
  },
] as const;

export function FeaturesSection() {
  return (
    <Container className='space-y-12 py-12 md:py-24 lg:py-32'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center'
      >
        <h2 className='text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl'>Why Choose Kubeasy?</h2>
        <p className='max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7'>
          Kubeasy provides all the tools you need to master Kubernetes through practical, hands-on learning. And it&apos;s all free!
        </p>
      </motion.div>
      <div className='mx-auto grid gap-12 sm:max-w-3xl sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3'>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 },
            }}
            className='relative overflow-hidden rounded-lg border bg-background p-2'
          >
            <div className='flex h-[180px] flex-col justify-between rounded-md p-6'>
              <div className='space-y-2'>
                <h3 className='font-bold'>{feature.name}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}
