"use client";

import { useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";

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
        <JotaiProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </JotaiProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
