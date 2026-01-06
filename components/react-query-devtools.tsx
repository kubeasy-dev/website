"use client";

import dynamic from "next/dynamic";

// Only import devtools in development to avoid any production issues
const ReactQueryDevtoolsPanel =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (mod) => mod.ReactQueryDevtools,
          ),
        { ssr: false },
      )
    : () => null;

export function ReactQueryDevtools() {
  // Don't render anything in production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <ReactQueryDevtoolsPanel initialIsOpen={false} />;
}
