"use client";

import dynamic from "next/dynamic";

const ReactQueryDevtoolsPanel = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools,
    ),
  { ssr: false },
);

export function ReactQueryDevtools() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <ReactQueryDevtoolsPanel initialIsOpen={false} />;
}
