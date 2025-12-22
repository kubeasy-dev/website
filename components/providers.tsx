"use client";

import { RealtimeProvider } from "@upstash/realtime/client";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <RealtimeProvider>{children}</RealtimeProvider>;
};
