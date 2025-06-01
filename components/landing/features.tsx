"use client";

import { motion } from "framer-motion";
import { Code, Trophy, Laptop, Users, Terminal, Rocket } from "lucide-react";
import { Container } from "@/components/ui/container";

type Feature = {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
};

const features: Feature[] = [
  {
    name: "Practical Learning",
    description: "Learn through hands-on challenges that simulate real-world scenarios and best practices.",
    icon: Code,
    color: "bg-primary/10 text-primary",
  },
  {
    name: "Track Progress",
    description: "Monitor your learning journey and see your improvements over time.",
    icon: Trophy,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  {
    name: "Local Environment",
    description: "Your computer, your text editor, your terminal. Practice Kubernetes without leaving your machine.",
    icon: Laptop,
    color: "bg-secondary/40 text-secondary-foreground dark:bg-secondary/60",
  },
  {
    name: "Community Driven",
    description: "Join a vibrant community. Learn, share, and grow together with open source challenges.",
    icon: Users,
    color: "bg-accent/40 text-accent-foreground dark:bg-accent/60",
  },
  {
    name: "Instant Feedback",
    description: "Get real-time validation and guidance as you complete each challenge.",
    icon: Terminal,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    name: "Level Up Fast",
    description: "Progress from beginner to advanced with a structured learning path and real-world scenarios.",
    icon: Rocket,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  },
];

export function FeaturesSection() {
  return (
    <Container className='space-y-16 py-16 md:py-28 lg:py-36'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='mx-auto flex max-w-248 flex-col items-center justify-center gap-6 text-center'
      >
        <span className='inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-2'>Features</span>
        <h2 className='text-4xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-6xl'>Everything you need to master Kubernetes</h2>
        <p className='max-w-2xl mx-auto leading-normal text-muted-foreground sm:text-lg sm:leading-7'>
          Kubeasy gives you the complete toolkit: hands-on labs, real-world challenges, a supportive community, and all the power of open source. Free, forever.
        </p>
      </motion.div>
      <div className='mx-auto grid gap-8 sm:max-w-3xl sm:grid-cols-2 lg:max-w-6xl lg:grid-cols-3'>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 8px 32px 0 rgba(80,80,160,0.14)",
              transition: { duration: 0.25 },
            }}
            className='relative flex flex-col items-center overflow-hidden rounded-2xl border border-primary/10 dark:border-muted/60 bg-background dark:bg-muted/70 p-6 shadow-lg dark:shadow-md transition-all duration-200 hover:border-primary/30 hover:shadow-2xl dark:hover:shadow-lg min-h-[260px] group'
          >
            {/* Badge if present */}
            {feature.badge && (
              <span className='absolute top-4 right-4 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                {feature.badge}
              </span>
            )}
            {/* Icon in colored circle */}
            <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-xs ${feature.color}`}>
              <feature.icon className='h-7 w-7' />
            </span>
            <h3 className='mb-2 text-lg font-bold text-foreground'>{feature.name}</h3>
            <p className='text-sm text-muted-foreground mb-2'>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}
