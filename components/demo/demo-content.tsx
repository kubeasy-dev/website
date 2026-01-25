"use client";

import { LogIn, Rocket, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { DemoHero } from "./demo-hero";
import { DemoSteps } from "./demo-steps";
import { DemoSuccess } from "./demo-success";

interface DemoSession {
  token: string;
  createdAt: number;
}

export function DemoContent() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function createSession() {
      try {
        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get("utm_source") ?? undefined;
        const utmMedium = params.get("utm_medium") ?? undefined;
        const utmCampaign = params.get("utm_campaign") ?? undefined;

        const response = await fetch("/api/demo/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utmSource, utmMedium, utmCampaign }),
        });

        if (!response.ok) {
          throw new Error("Failed to create demo session");
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create demo");
      } finally {
        setIsLoading(false);
      }
    }

    createSession();
  }, []);

  if (isLoading) {
    return <DemoLoadingState />;
  }

  if (error || !session) {
    return <DemoErrorState error={error} />;
  }

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
            <DemoSteps
              token={session.token}
              onComplete={() => setIsCompleted(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DemoLoadingState() {
  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
          <div className="w-20 h-20 neo-border-thick bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent neo-border rounded-full animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black">Preparing your demo...</p>
          <p className="text-muted-foreground font-medium">
            Setting up your playground
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoErrorState({ error }: { error: string | null }) {
  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 neo-border-thick bg-destructive/10 rounded-2xl mb-6">
          <Zap className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-black mb-4">Demo Unavailable</h1>
        <p className="text-lg text-muted-foreground font-bold mb-8 max-w-md mx-auto">
          {error || "Unable to create demo session. Please try again later."}
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black text-lg neo-border-thick neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <LogIn className="w-5 h-5" />
          Sign In Instead
        </a>
      </div>
    </div>
  );
}
