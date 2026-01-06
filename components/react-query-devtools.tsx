"use client";

import { ReactQueryDevtools as Devtools } from "@tanstack/react-query-devtools";

// Client wrapper needed because layout.tsx is a Server Component
// Devtools automatically renders nothing in production
export function ReactQueryDevtools() {
  return <Devtools initialIsOpen={false} />;
}
