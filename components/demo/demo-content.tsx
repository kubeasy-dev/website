"use client";

import { useEffect, useState } from "react";
import { DemoMission } from "./demo-mission";
import { DemoSteps } from "./demo-steps";

interface DemoSession {
  token: string;
  createdAt: number;
}

export function DemoContent() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createSession() {
      try {
        // Get UTM params from URL
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

        // Store token in cookie for conversion tracking
        document.cookie = `kubeasy_demo_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create demo");
      } finally {
        setIsLoading(false);
      }
    }

    createSession();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 max-w-4xl text-center py-20">
        <h1 className="text-3xl font-black mb-4">Demo Unavailable</h1>
        <p className="text-muted-foreground font-bold mb-8">
          {error || "Unable to create demo session. Please try again later."}
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-lg neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Sign In Instead
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      {/* Hero Section */}
      <div className="mb-12 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 neo-border-thick font-bold neo-shadow">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span>Demo Mode - No Sign Up Required</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-balance">
          Try Kubeasy in 5 Minutes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-bold">
          Create your first Kubernetes pod and experience hands-on learning.
          Your progress updates in real-time below.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left: Mission/Validation Status */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <DemoMission token={session.token} />
        </div>

        {/* Right: Steps */}
        <div>
          <DemoSteps token={session.token} />
        </div>
      </div>

      {/* Sign Up CTA */}
      <section className="mb-12">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 neo-border-thick neo-shadow p-8 text-center">
          <h3 className="text-2xl font-black mb-2">
            Ready for More Challenges?
          </h3>
          <p className="text-muted-foreground font-bold mb-6">
            Sign up to unlock 30+ challenges, earn XP, track your progress, and
            become a Kubernetes expert.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-lg neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Create Free Account
          </a>
        </div>
      </section>
    </div>
  );
}
