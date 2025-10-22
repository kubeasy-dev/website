import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type React from "react";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kubeasy - Learn Kubernetes Through Interactive Challenges",
  description:
    "Master Kubernetes with hands-on CLI challenges. Free, open-source learning platform for developers.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <TRPCReactProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
          <Toaster richColors position="bottom-right" />
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
