"use client";

import { useEffect, useRef, useState } from "react";
import { trackDemoCompleted, trackDemoCreated } from "@/lib/analytics";
import { DemoHero } from "./demo-hero";
import { DemoSteps } from "./demo-steps";
import { DemoSuccess } from "./demo-success";

interface DemoContentProps {
  token: string;
}

export function DemoContent({ token }: DemoContentProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const hasTrackedCreated = useRef(false);

  useEffect(() => {
    if (!hasTrackedCreated.current) {
      trackDemoCreated();
      hasTrackedCreated.current = true;
    }
  }, []);

  const handleComplete = () => {
    setIsCompleted(true);
    trackDemoCompleted();
  };

  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-secondary/50 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <DemoHero />

        {/* Main Content - Single Column */}
        {isCompleted ? (
          <DemoSuccess />
        ) : (
          <div className="mb-16">
            <DemoSteps token={token} onComplete={handleComplete} />
          </div>
        )}
      </div>
    </div>
  );
}
