"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Container } from "../ui/container";

const testimonials = [
  {
    content: "Kubeasy has been a game-changer for my Kubernetes learning journey. The hands-on challenges are incredibly effective, and it's all free!",
    name: "Sarah Johnson",
    title: "DevOps Engineer",
  },
  {
    content: "I love how Kubeasy lets me practice Kubernetes concepts right on my local machine. It's both convenient and powerful, and the price can't be beat!",
    name: "Michael Chen",
    title: "Software Developer",
  },
  {
    content: "The progression of challenges in Kubeasy is well-thought-out. I've seen a significant improvement in my Kubernetes skills, all without spending a dime.",
    name: "Emily Rodriguez",
    title: "Cloud Architect",
  },
] as const;

export function TestimonialsSection() {
  return (
    <Container className='py-12 md:py-24 lg:py-32'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center'
      >
        <h2 className='text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl'>What Our Users Say</h2>
      </motion.div>
      <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className='flex flex-col rounded-lg border bg-card p-6'
          >
            <p className='flex-1 text-muted-foreground'>{testimonial.content}</p>
            <div className='mt-4 flex items-center'>
              <div className='rounded-full bg-primary text-primary-foreground p-2'>
                <CheckCircle className='h-4 w-4' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-semibold'>{testimonial.name}</p>
                <p className='text-sm text-muted-foreground'>{testimonial.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}
