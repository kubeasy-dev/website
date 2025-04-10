"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}

