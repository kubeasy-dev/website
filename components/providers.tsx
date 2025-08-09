"use client";

import { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useUser } from "@/hooks/use-user";

function PostHogProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { data: user } = useUser();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line
      (window as any).__PH_INIT__ = true;
      // eslint-disable-next-line
      if (!(window as any).__PH_INIT__) {
        // eslint-disable-next-line
        (window as any).__PH_INIT__ = true;
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: "/ingest",
          persistence: "localStorage+cookie",
          ui_host: "https://eu.i.posthog.com",
          capture_pageview: true,
          capture_pageleave: true,
          person_profiles: "always",
          debug: process.env.NODE_ENV === "development",
          disable_session_recording: process.env.NODE_ENV === "development",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Identify if the distinct ID has changed
      if (posthog.get_distinct_id() !== user.id) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.user_metadata.full_name,
        });
      }
    }
  }, [user]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            gcTime: Infinity,
          },
        },
      })
  );

  return (
    <NextThemesProvider attribute='class' enableSystem={true}>
      <QueryClientProvider client={queryClient}>
        <PostHogProvider>
          <JotaiProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            {children}
          </JotaiProvider>
        </PostHogProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
