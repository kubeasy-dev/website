"use client";

import { MessageSquare, Quote, Star } from "lucide-react";
import Image from "next/image";
import AsianDeveloper from "./asian-developer.jpg";
import DeveloperPortrait from "./developer-portrait.png";
import MaleEngineer from "./male-engineer.jpg";
import ManDeveloper from "./man-developer.png";
import WomanDeveloper from "./woman-developer.png";
import WomanEngineerAtWork from "./woman-engineer-at-work.png";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "DevOps Engineer",
    company: "TechCorp",
    avatar: WomanDeveloper,
    quote:
      "Kubeasy transformed how I learn Kubernetes. The hands-on challenges are way more effective than reading docs. I went from zero to deploying production clusters in weeks!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Backend Developer",
    company: "StartupXYZ",
    avatar: ManDeveloper,
    quote:
      "Finally, a Kubernetes learning platform that doesn't bore me to death. The CLI challenges are addictive and I actually remember what I learn.",
    rating: 5,
  },
  {
    name: "Yuki Tanaka",
    role: "Cloud Architect",
    company: "CloudScale",
    avatar: AsianDeveloper,
    quote:
      "I use Kubeasy to train my entire team. The progressive difficulty and real-world scenarios make it perfect for onboarding new engineers to Kubernetes.",
    rating: 5,
  },
  {
    name: "Alex Rivera",
    role: "Full Stack Developer",
    company: "Freelance",
    avatar: DeveloperPortrait,
    quote:
      "Open-source and free? This is exactly what the community needed. The challenges are well-designed and the CLI tool is incredibly smooth to use.",
    rating: 5,
  },
  {
    name: "Emma Schmidt",
    role: "Platform Engineer",
    company: "FinTech Inc",
    avatar: WomanEngineerAtWork,
    quote:
      "Kubeasy helped me pass my CKA certification. The practical approach is so much better than traditional courses. Highly recommend!",
    rating: 5,
  },
  {
    name: "David Park",
    role: "SRE",
    company: "DataFlow",
    avatar: MaleEngineer,
    quote:
      "The debugging challenges are gold. They simulate real production issues and taught me troubleshooting skills I use every day at work.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-secondary border-4 border-black rotate-12 opacity-20" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent border-4 border-black -rotate-12 opacity-20" />

      <div className="max-w-7xl px-4 mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary border-4 border-black px-6 py-2 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="text-white font-black text-sm uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Loved by developers
            <br />
            <span className="text-primary">worldwide</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-bold">
            Join thousands of developers who are mastering Kubernetes with
            Kubeasy
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-10 h-10 text-primary" fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from(
                  { length: testimonial.rating },
                  (_, i) => `star-${i}`,
                ).map((key) => (
                  <Star
                    key={key}
                    className="w-5 h-5 text-secondary"
                    fill="currentColor"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 font-bold mb-6 leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t-4 border-black">
                <div className="w-14 h-14 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex-shrink-0">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-black text-lg">{testimonial.name}</div>
                  <div className="text-gray-600 font-bold text-sm">
                    {testimonial.role}
                  </div>
                  <div className="text-primary font-bold text-sm">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-secondary border-4 border-black px-8 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black text-lg">
              Join{" "}
              <span className="text-primary text-2xl">10,000+ developers</span>{" "}
              learning Kubernetes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
