"use client";

import { Gamepad2 } from "lucide-react";

export function DemoHero() {
  return (
    <div className="container mx-auto space-y-4 text-center pb-12">
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <span className="text-sm font-black uppercase tracking-widest text-primary">
            Tutorial Mission
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
          Deploy Your First
          <br />
          <span className="text-primary">Kubernetes Pod</span>
        </h1>
      </div>

      <p className="text-lg lg:text-xl font-medium text-muted-foreground leading-relaxed">
        Experience hands-on Kubernetes learning in under 5 minutes.
        <br className="hidden sm:block" />
        No account required — your progress updates in real-time.
      </p>
    </div>
  );
}
