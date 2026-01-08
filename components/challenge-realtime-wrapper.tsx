"use client";

import * as Sentry from "@sentry/nextjs";
import { RealtimeProvider } from "@upstash/realtime/client";
import { Component, type ReactNode } from "react";
import { ChallengeMission } from "./challenge-mission";

/**
 * Error boundary to catch RealtimeProvider initialization errors
 * Renders children without realtime if the connection fails
 */
class RealtimeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        context: "RealtimeProvider initialization",
      },
    });
    console.error("[RealtimeProvider] Connection error:", error);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback (ChallengeMission without realtime)
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface ChallengeRealtimeWrapperProps {
  slug: string;
}

/**
 * Wrapper component that provides RealtimeProvider only for challenge pages
 * This isolates the realtime connection to where it's actually needed
 * and prevents hydration errors on other pages
 */
export function ChallengeRealtimeWrapper({
  slug,
}: ChallengeRealtimeWrapperProps) {
  return (
    <RealtimeErrorBoundary fallback={<ChallengeMission slug={slug} />}>
      <RealtimeProvider>
        <ChallengeMission slug={slug} />
      </RealtimeProvider>
    </RealtimeErrorBoundary>
  );
}
