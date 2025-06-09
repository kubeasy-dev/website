"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  { src: "/logos/logo1.svg", alt: "CloudCorp" },
  { src: "/logos/logo2.svg", alt: "DevOpsHub" },
  { src: "/logos/logo3.svg", alt: "KubeWorld" },
  { src: "/logos/logo4.svg", alt: "InfraTech" },
  { src: "/logos/logo5.svg", alt: "OpenSourceOrg" },
];

const testimonials = [
  {
    content: "Kubeasy has been a game-changer for my Kubernetes learning journey. The hands-on challenges are incredibly effective, and it's all free!",
    name: "Sarah Johnson",
    title: "DevOps Engineer",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366F1&color=fff&size=64.svg",
  },
  {
    content: "I love how Kubeasy lets me practice Kubernetes concepts right on my local machine. It's both convenient and powerful, and the price can't be beat!",
    name: "Michael Chen",
    title: "Software Developer",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=8B5CF6&color=fff&size=64.svg",
  },
  {
    content: "The progression of challenges in Kubeasy is well-thought-out. I've seen a significant improvement in my Kubernetes skills, all without spending a dime.",
    name: "Emily Rodriguez",
    title: "Cloud Architect",
    avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=4F46E5&color=fff&size=64.svg",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='mx-auto flex max-w-232 flex-col items-center justify-center gap-6 text-center'
      >
        <span className='inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-2'>Testimonials</span>
        <h2 className='text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl'>Trusted by Teams & Loved by Users</h2>
        <p className='text-muted-foreground max-w-xl mx-auto text-base md:text-lg'>Leading organizations and real users rely on Kubeasy to master Kubernetes, hands-on and for free.</p>
        {/* Logos row */}
        <div className='flex flex-wrap justify-center items-center gap-8 mt-6'>
          {logos.map((logo) => (
            <motion.div
              key={logo.alt}
              className='h-10 flex items-center grayscale transition-all duration-300 p-0.5'
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Image src={logo.src} alt={logo.alt} width={64} height={64} className='h-16 w-auto' />
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* Testimonials grid */}
      <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className='flex flex-col items-center rounded-xl border border-primary/10 dark:border-muted/60 bg-background dark:bg-muted/70 p-6 shadow-lg dark:shadow-md transition-all duration-200 hover:shadow-2xl dark:hover:shadow-lg'
          >
            <p className='flex-1 text-muted-foreground'>{testimonial.content}</p>
            <div className='mt-4 flex items-center'>
              <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className='h-10 w-10 rounded-full border-2 border-indigo-200 shadow-xs object-cover' loading='lazy' />
              <div className='ml-4'>
                <p className='text-sm font-semibold'>{testimonial.name}</p>
                <p className='text-sm text-muted-foreground'>{testimonial.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
