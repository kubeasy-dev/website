"use client";

import { CheckCircle2, PartyPopper, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Pre-generated confetti configuration for stable rendering
const CONFETTI_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-secondary",
  "bg-green-500",
  "bg-amber-400",
];

function generateConfettiPieces() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `confetti-${i}`,
    left: `${(i * 5 + 2) % 100}%`,
    delay: `${(i * 0.1) % 2}s`,
    duration: `${2 + (i % 3)}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotation: `${i * 18}deg`,
  }));
}

export function DemoSuccess() {
  const [showConfetti, setShowConfetti] = useState(true);
  const confettiPieces = useMemo(() => generateConfettiPieces(), []);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mb-16 relative">
      {/* Confetti animation overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute animate-confetti"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            >
              <div
                className={`w-3 h-3 ${piece.color}`}
                style={{
                  transform: `rotate(${piece.rotation})`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Card */}
      <div className="relative">
        <div className="relative overflow-hidden neo-border-thick neo-shadow-xl bg-gradient-to-br from-green-50 via-white to-accent/10">
          <div className="relative p-10 lg:p-16">
            {/* Achievement Badge */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 neo-border-thick bg-green-500 rounded-full flex items-center justify-center animate-bounce-slow">
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
                {/* Orbiting stars */}
                <div className="absolute inset-0 animate-spin-slow">
                  <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-400" />
                  <Sparkles className="absolute top-1/2 -right-2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Sparkles className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 text-accent" />
                  <Sparkles className="absolute top-1/2 -left-2 -translate-y-1/2 w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center space-y-4 mb-10">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <PartyPopper className="w-6 h-6" />
                <span className="text-sm font-black uppercase tracking-widest">
                  Mission Complete
                </span>
                <PartyPopper className="w-6 h-6 scale-x-[-1]" />
              </div>

              <h2 className="text-4xl lg:text-5xl font-black">You Did It!</h2>

              <p className="text-xl font-bold text-muted-foreground max-w-xl mx-auto">
                You just deployed your first Kubernetes pod. That's the
                foundation of everything in K8s!
              </p>
            </div>

            {/* What's Next */}
            <div className="bg-foreground text-background neo-border-thick p-8 mb-10">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                What's Next?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-black">
                    1
                  </span>
                  <div>
                    <div className="font-bold">Deploy a Service</div>
                    <div className="opacity-70">
                      Expose your pod to the network
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-black">
                    2
                  </span>
                  <div>
                    <div className="font-bold">Scale with Deployments</div>
                    <div className="opacity-70">Run multiple replicas</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-black">
                    3
                  </span>
                  <div>
                    <div className="font-bold">Debug Real Issues</div>
                    <div className="opacity-70">
                      Fix production-like problems
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center space-y-6">
              <p className="text-lg font-bold text-muted-foreground">
                Create a free account to unlock 30+ challenges and track your
                progress
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login?next=/challenges"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl font-black text-xl neo-border-thick neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Sparkles className="w-6 h-6" />
                  Create Free Account
                  <Rocket className="w-6 h-6" />
                </Link>
              </div>

              <p className="text-sm text-muted-foreground">
                No credit card required. Start learning immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
