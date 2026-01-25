"use client";

import { Rocket, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { DemoHero } from "./demo-hero";
import { DemoMission } from "./demo-mission";
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
        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not supported in all browsers
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

      <div className="relative container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <DemoHero />

        {/* Main Content - Asymmetric Layout */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 mb-16">
          {/* Mission Panel - Sticky on desktop */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start order-2 lg:order-1">
            <DemoMission
              token={session.token}
              onComplete={() => setIsCompleted(true)}
            />
          </div>

          {/* Steps Panel */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <DemoSteps token={session.token} />
          </div>
        </div>

        {/* Success CTA or Regular CTA */}
        {isCompleted ? <DemoSuccess /> : <SignupCTA />}
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
          <Sparkles className="w-5 h-5" />
          Sign In Instead
        </a>
      </div>
    </div>
  );
}

function SignupCTA() {
  return (
    <section className="mb-16">
      <div className="relative overflow-hidden neo-border-thick neo-shadow-xl bg-gradient-to-br from-primary via-primary to-primary-dark p-10 lg:p-14">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Unlock Full Access</span>
          </div>

          <h3 className="text-3xl lg:text-4xl font-black mb-4">
            Ready for More Challenges?
          </h3>
          <p className="text-lg lg:text-xl font-bold opacity-90 mb-8 max-w-2xl mx-auto">
            Sign up to unlock 30+ challenges, earn XP, track your progress, and
            become a Kubernetes expert.
          </p>

          <a
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary rounded-xl font-black text-lg neo-border-thick shadow-lg hover:scale-105 transition-transform"
          >
            Create Free Account
            <Rocket className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
