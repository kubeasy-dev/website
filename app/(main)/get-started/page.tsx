import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Rocket,
  Terminal,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GetStartedSteps } from "@/components/challenge-selector";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { requireAuth } from "@/lib/require-auth";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getStarterChallenges } from "@/server/db/queries";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = generateSEOMetadata({
  title: "Get Started",
  description:
    "Get started with Kubeasy quickly. Install the CLI, set up your local Kubernetes cluster, and start your first challenge.",
  url: "/get-started",
  keywords: [
    "kubeasy tutorial",
    "kubernetes getting started",
    "kubeasy install",
    "kubernetes cli",
    "learn kubernetes",
    "kubernetes setup",
  ],
});

const prerequisites = [
  {
    name: "Docker",
    description: "Required to run Kind clusters",
    link: "https://docs.docker.com/get-docker/",
  },
  {
    name: "kubectl",
    description: "Kubernetes CLI for cluster interaction",
    link: "https://kubernetes.io/docs/tasks/tools/",
  },
];

const troubleshooting = [
  {
    error: "Docker daemon not running",
    solution: "Start Docker Desktop or run `sudo systemctl start docker`",
  },
  {
    error: "Kind cluster creation failed",
    solution:
      "Ensure Docker has enough resources (4GB RAM recommended). Try `kubeasy cleanup` then `kubeasy setup` again.",
  },
  {
    error: "kubectl: command not found",
    solution:
      "Install kubectl following the official guide: kubernetes.io/docs/tasks/tools/",
  },
  {
    error: "Permission denied on npm install",
    solution:
      "Use `sudo npm install -g @kubeasy-dev/kubeasy-cli` or configure npm for global installs without sudo.",
  },
  {
    error: "Challenge stuck in deploying state",
    solution:
      "Wait for ArgoCD sync to complete. Check with `kubectl get applications -n argocd`.",
  },
];

export default async function GetStartedPage() {
  await requireAuth();
  const starterChallenges = await getStarterChallenges(5);

  // Prefetch objectives for all starter challenges
  await Promise.all(
    starterChallenges.map((challenge) =>
      prefetch(
        trpc.challenge.getObjectives.queryOptions({ slug: challenge.slug }),
      ),
    ),
  );

  return (
    <HydrateClient>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Rocket className="h-4 w-4" />
            <span>Quick Setup</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-balance">
            Get Started with Kubeasy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-bold">
            Set up your local environment and start your first challenge. Follow
            this guide to begin your Kubernetes learning journey.
          </p>
        </div>

        {/* Prerequisites */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Prerequisites
          </h2>
          <div className="grid gap-4">
            {prerequisites.map((prereq) => (
              <div
                key={prereq.name}
                className="flex items-center justify-between p-4 bg-secondary border-4 border-black neo-shadow"
              >
                <div>
                  <div className="font-black text-lg">{prereq.name}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {prereq.description}
                  </div>
                </div>
                <TrackedOutboundLink
                  href={prereq.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  linkType="docs"
                  location="get_started_prerequisites"
                  className="flex items-center gap-1 text-primary font-bold hover:underline"
                >
                  Install
                  <ExternalLink className="h-4 w-4" />
                </TrackedOutboundLink>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            Step-by-Step Guide
          </h2>
          <GetStartedSteps challenges={starterChallenges} />
        </section>

        {/* Next Steps */}
        <section className="mb-12">
          <div className="bg-blue-100 border-4 border-blue-600 neo-shadow p-8 text-center">
            <Rocket className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-blue-800 mb-2">
              Ready to Solve Challenges?
            </h3>
            <p className="text-blue-700 font-bold mb-6">
              Once you fix the issue and submit, you&apos;ll earn XP and unlock
              new challenges.
            </p>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 bg-blue-600 text-white border-4 border-blue-800 px-6 py-3 font-black neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Browse All Challenges
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Common Issues
          </h2>
          <div className="space-y-4">
            {troubleshooting.map((item) => (
              <details
                key={item.error}
                className="bg-white border-4 border-black neo-shadow group"
              >
                <summary className="p-4 cursor-pointer font-black flex items-center gap-2 hover:bg-secondary/50 transition-colors">
                  <ChevronRight className="h-5 w-5 group-open:rotate-90 transition-transform" />
                  <span className="text-red-600 font-mono text-sm">
                    {item.error}
                  </span>
                </summary>
                <div className="p-4 pt-0 border-t-2 border-black">
                  <p className="font-medium text-muted-foreground">
                    {item.solution}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="mb-12">
          <div className="bg-secondary border-4 border-black neo-shadow p-8 text-center">
            <h3 className="text-xl font-black mb-2">Still stuck?</h3>
            <p className="text-muted-foreground font-bold mb-4">
              Open an issue on GitHub and we&apos;ll help you out.
            </p>
            <TrackedOutboundLink
              href="https://github.com/kubeasy-dev/kubeasy-cli/issues"
              target="_blank"
              rel="noopener noreferrer"
              linkType="github"
              location="get_started_help"
              className="inline-flex items-center gap-2 text-primary font-black hover:underline"
            >
              Report an Issue
              <ExternalLink className="h-4 w-4" />
            </TrackedOutboundLink>
          </div>
        </section>
      </div>
    </HydrateClient>
  );
}
