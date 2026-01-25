"use client";

import { Clock, Cpu, Gamepad2, Play, Zap } from "lucide-react";

export function DemoHero() {
  return (
    <div className="relative mb-12 lg:mb-16">
      {/* Main Hero Card */}
      <div className="relative overflow-hidden neo-border-thick neo-shadow-xl bg-white">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-primary" />
        <div className="absolute top-0 right-0 w-8 h-8 bg-accent" />
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-secondary" />
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary" />

        <div className="relative p-8 lg:p-12">
          {/* Top badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Live indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 neo-border font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600" />
              </span>
              <span className="text-sm">Demo Mode</span>
            </div>

            {/* Stats badges */}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary neo-border text-sm font-bold">
              <Clock className="w-4 h-4 text-primary" />
              <span>5 min</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary neo-border text-sm font-bold">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Beginner</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 bg-secondary neo-border text-sm font-bold">
              <Cpu className="w-4 h-4 text-accent" />
              <span>Local Cluster</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-12">
            <div className="flex-1 space-y-6">
              {/* Title with game-style treatment */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-8 h-8 text-primary" />
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

              <p className="text-lg lg:text-xl font-medium text-muted-foreground max-w-xl leading-relaxed">
                Experience hands-on Kubernetes learning in under 5 minutes. No
                account required — your progress updates in real-time.
              </p>

              {/* Quick features */}
              <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  No signup needed
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Real K8s cluster
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  Live validation
                </span>
              </div>
            </div>

            {/* Visual element - Mission briefing card */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="relative">
                {/* Card with diagonal stripe */}
                <div className="relative neo-border-thick bg-foreground text-background p-6 overflow-hidden">
                  {/* Diagonal stripe */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary transform rotate-45 translate-x-10 -translate-y-10" />

                  <div className="relative space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60">
                      <Play className="w-3 h-3" />
                      Mission Briefing
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-black">
                          1
                        </span>
                        <span className="text-sm font-medium">
                          Install the CLI
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-black">
                          2
                        </span>
                        <span className="text-sm font-medium">
                          Start the demo
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-black">
                          3
                        </span>
                        <span className="text-sm font-medium">
                          Create nginx pod
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-accent text-foreground rounded flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                        <span className="text-sm font-medium">
                          Submit & celebrate!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shadow offset element */}
                <div className="absolute inset-0 neo-border-thick bg-primary -z-10 translate-x-2 translate-y-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
