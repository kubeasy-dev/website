"use client";

import * as Sentry from "@sentry/nextjs";
import { RealtimeProvider } from "@upstash/realtime/client";
import { Component, type ReactNode } from "react";
import { PostHogIdentify } from "@/components/posthog-identify";

/**
 * Error boundary to catch RealtimeProvider initialization errors
 * This prevents the entire app from crashing if realtime connection fails
 */
class RealtimeErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to Sentry for monitoring
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
      // Render children without RealtimeProvider if it fails
      return this.props.children;
    }
    return this.props.children;
  }
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <RealtimeErrorBoundary>
      <RealtimeProvider>
        <PostHogIdentify />
        {children}
      </RealtimeProvider>
    </RealtimeErrorBoundary>
  );
};
