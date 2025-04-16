"use client"

import { useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

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
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </NextThemesProvider>
    </QueryClientProvider>
  )
}

