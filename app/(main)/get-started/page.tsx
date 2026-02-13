import type { Metadata } from "next";
import { DemoContent } from "@/components/demo/demo-content";
import { DemoErrorState } from "@/components/demo/demo-error-state";
import { captureServerException } from "@/lib/analytics-server";
import { isRedisConfigured } from "@/lib/redis";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { createDemoSession } from "@/server/demo-session";

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

export default async function GetStartedPage() {
  if (!isRedisConfigured) {
    return (
      <DemoErrorState error="Demo mode is temporarily unavailable. Please sign in to access the full experience." />
    );
  }

  try {
    const session = await createDemoSession();

    if (!session) {
      return (
        <DemoErrorState error="Failed to create demo session. Please try again later." />
      );
    }

    return <DemoContent token={session.token} />;
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "demo.session.create",
    });
    return (
      <DemoErrorState error="An error occurred while creating the demo session." />
    );
  }
}
