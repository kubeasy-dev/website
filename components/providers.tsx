"use client";

import { RealtimeProvider } from "@upstash/realtime/client";
import { PostHogIdentify } from "@/components/posthog-identify";
import { DemoConversionProvider } from "@/hooks/use-demo-conversion";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <RealtimeProvider>
      <PostHogIdentify />
      <DemoConversionProvider>{children}</DemoConversionProvider>
    </RealtimeProvider>
  );
};
