"use client";

import { ArrowRight, Rocket, Sparkles, Terminal, Zap } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface StepWelcomeProps {
  userName: string;
  onContinue: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    icon: Terminal,
    title: "Install CLI",
    description: "One-line install, works everywhere",
  },
  {
    icon: Zap,
    title: "Connect",
    description: "Authenticate with your token",
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Spin up a local cluster",
  },
  {
    icon: Sparkles,
    title: "Complete",
    description: "Solve your first challenge",
  },
];

/**
 * Welcome step for onboarding wizard.
 * Introduces the user and provides an overview of what they'll do.
 */
export function StepWelcome({
  userName,
  onContinue,
  onSkip,
}: StepWelcomeProps) {
  return (
    <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
      {/* Hero Section */}
      <div
        className="flex items-center gap-5 mb-8 animate-in slide-in-from-bottom-4 duration-700"
        style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 bg-primary/20 rounded-xl blur-md"
            aria-hidden="true"
          />
          <Image
            src="/logo.png"
            alt="Kubeasy logo"
            width={72}
            height={72}
            priority
            className="relative drop-shadow-lg"
          />
        </div>
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Welcome!
          </h1>
          <p className="text-lg text-primary font-bold mt-1">
            Hey {userName}{" "}
            <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite]">
              👋
            </span>
          </p>
        </div>
      </div>

      {/* Tagline */}
      <p
        className="text-lg md:text-xl font-bold text-foreground/80 max-w-lg leading-relaxed mb-10 animate-in slide-in-from-bottom-4 duration-700"
        style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
      >
        Ready to master Kubernetes through{" "}
        <span className="relative inline-block">
          <span className="relative z-10 text-primary">
            hands-on challenges
          </span>
          <span
            className="absolute -inset-1 -bottom-0.5 bg-primary/15 -skew-x-3 rounded"
            aria-hidden="true"
          />
        </span>
        ?
      </p>

      {/* Steps Journey */}
      <div
        className="relative w-full mb-10 animate-in slide-in-from-bottom-4 duration-700"
        style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
      >
        {/* Connecting line (desktop only) */}
        <div
          className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-1 bg-gradient-to-r from-amber-200 via-primary/30 to-emerald-200 -translate-y-1/2 rounded-full"
          aria-hidden="true"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((step, index) => (
            <article
              key={step.title}
              className="group relative animate-in slide-in-from-bottom-4 duration-500"
              style={{
                animationDelay: `${400 + index * 100}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="relative bg-secondary neo-border p-4 rounded-xl transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-1">
                {/* Step number badge */}
                <div
                  className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-black text-xs neo-border shadow-sm z-10 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <step.icon
                  className="w-8 h-8 text-primary mx-auto mb-2 transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />

                {/* Content */}
                <h3 className="font-black text-sm mb-0.5">{step.title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="flex flex-col items-center gap-3 w-full max-w-sm animate-in slide-in-from-bottom-4 duration-700"
        style={{ animationDelay: "800ms", animationFillMode: "backwards" }}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="group relative neo-border shadow-md font-black w-full text-lg py-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
        >
          {/* Shimmer effect */}
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            aria-hidden="true"
          />
          <span className="relative flex items-center justify-center gap-2">
            <Rocket
              className="w-5 h-5 transition-transform group-hover:-rotate-12 group-hover:scale-110"
              aria-hidden="true"
            />
            Let's Go
            <ArrowRight
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </Button>

        <button
          onClick={onSkip}
          type="button"
          className="text-foreground/40 text-sm font-bold hover:text-foreground/60 transition-colors py-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
