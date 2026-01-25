import type { Metadata } from "next";
import { DemoContent } from "@/components/demo/demo-content";
import { isRedisConfigured } from "@/lib/redis";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = generateSEOMetadata({
  title: "Get Started with Kubeasy",
  description:
    "Start learning Kubernetes hands-on. Create your first pod and see your results in real-time. No account required.",
  url: "/get-started",
  keywords: [
    "kubeasy",
    "get started kubernetes",
    "kubernetes tutorial",
    "learn kubernetes free",
    "kubernetes hands-on",
    "kubernetes playground",
  ],
});

export default function GetStartedPage() {
  if (!isRedisConfigured) {
    return (
      <div className="container mx-auto px-4 max-w-4xl text-center py-20">
        <h1 className="text-3xl font-black mb-4">Demo Mode Unavailable</h1>
        <p className="text-muted-foreground font-bold mb-8">
          Demo mode is temporarily unavailable. Please sign in to access the
          full experience.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-lg neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <HydrateClient>
      <DemoContent />
    </HydrateClient>
  );
}
