"use client";

import { RealtimeProvider } from "@upstash/realtime/client";
import { PostHogIdentify } from "@/components/posthog-identify";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <RealtimeProvider>
      <PostHogIdentify />
      {children}
    </RealtimeProvider>
  );
};
