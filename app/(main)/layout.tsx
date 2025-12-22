import type React from "react";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-border bg-background neo-shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-foreground/10 rounded animate-pulse" />
          <div className="w-32 h-6 bg-foreground/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-foreground/10 rounded animate-pulse" />
          <div className="w-10 h-10 bg-foreground/10 rounded-lg animate-pulse" />
        </div>
      </div>
    </header>
  );
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      <main className="pt-32 pb-20">{children}</main>
      <Footer />
    </>
  );
}
