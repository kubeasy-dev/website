"use client";

import { Suspense, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";

function PostHogProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { data: user } = useUser();

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://eu.i.posthog.com",
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
      person_profiles: "identified_only",
      debug: process.env.NODE_ENV === "development",
      disable_session_recording: process.env.NODE_ENV === "development",
    });
  }, []);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.user_metadata.full_name,
      });
    } else {
      posthog.reset(); // clears identity if user logs out
    }
  }, [user]);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += "?" + search;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
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
    <NextThemesProvider attribute='class' defaultTheme='dark' enableSystem={true}>
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
