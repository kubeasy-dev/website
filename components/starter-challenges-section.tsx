import { ArrowRight, Clock, Rocket, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { DifficultyBadge } from "@/components/dificulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { getStarterChallenges } from "@/server/db/queries";

type StarterChallenge = Awaited<
  ReturnType<typeof getStarterChallenges>
>[number];

interface StarterChallengesSectionProps {
  challenges: StarterChallenge[];
}

export function StarterChallengesSection({
  challenges,
}: Readonly<StarterChallengesSectionProps>) {
  if (challenges.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg neo-border">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Start Here</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Perfect challenges for beginners
            </p>
          </div>
        </div>
        <Button variant="outline" className="neo-border font-bold" asChild>
          <Link href="/get-started">
            Setup Guide
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge, index) => (
          <Link
            key={challenge.slug}
            href={`/challenges/${challenge.slug}`}
            className="group"
          >
            <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-4 border-black neo-shadow p-5 hover:neo-shadow-lg transition-all h-full">
              {/* Recommended badge for first challenge */}
              {index === 0 && (
                <div className="absolute -top-3 -right-3">
                  <Badge className="bg-primary text-primary-foreground neo-border font-black text-xs flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Recommended
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-black group-hover:text-primary transition-colors pr-16">
                  {challenge.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                  {challenge.description}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge
                    difficulty={challenge.difficulty}
                    size="sm"
                  />
                  <Badge
                    variant="secondary"
                    className="text-xs font-bold neo-border"
                  >
                    {challenge.theme}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{challenge.estimatedTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HowToRunChallenge() {
  return (
    <section className="mb-12">
      <div className="bg-secondary border-4 border-black neo-shadow p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary text-primary-foreground rounded-lg neo-border flex-shrink-0">
            <Rocket className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-black">How to Run a Challenge</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Use the Kubeasy CLI to start, solve, and submit challenges
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-foreground text-background p-4 rounded-lg neo-border font-mono text-sm">
                <div className="text-xs text-muted-foreground mb-1 font-sans font-bold">
                  1. Start
                </div>
                <div>
                  <span className="text-green-400">$</span> kubeasy challenge
                  start <span className="text-primary">&lt;slug&gt;</span>
                </div>
              </div>
              <div className="bg-foreground text-background p-4 rounded-lg neo-border font-mono text-sm">
                <div className="text-xs text-muted-foreground mb-1 font-sans font-bold">
                  2. Debug
                </div>
                <div>
                  <span className="text-green-400">$</span> kubectl get pods
                </div>
              </div>
              <div className="bg-foreground text-background p-4 rounded-lg neo-border font-mono text-sm">
                <div className="text-xs text-muted-foreground mb-1 font-sans font-bold">
                  3. Submit
                </div>
                <div>
                  <span className="text-green-400">$</span> kubeasy challenge
                  submit <span className="text-primary">&lt;slug&gt;</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="neo-border font-bold" asChild>
                <Link href="/get-started">
                  Full Setup Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
