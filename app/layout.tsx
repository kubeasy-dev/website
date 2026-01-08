import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import type React from "react";
import { Suspense } from "react";
import {
  generateMetadata,
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebsiteSchema,
  stringifyJsonLd,
} from "@/lib/seo";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

// Lazy load ReactQueryDevtools to avoid hydration mismatch
// Only loads in development mode
const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools,
    ),
  { ssr: false },
);

export const metadata: Metadata = generateMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  const softwareApplicationSchema = generateSoftwareApplicationSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe JSON-LD structured data
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe JSON-LD structured data
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe JSON-LD structured data
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(softwareApplicationSchema),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <TRPCReactProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <Providers>
            <Suspense fallback={null}>{children}</Suspense>
          </Providers>
          <Toaster richColors position="bottom-right" />
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
