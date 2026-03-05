import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background neo-shadow-sm neo-border-thick !border-t-0 !border-l-0 !border-r-0">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={siteConfig.name}
                width={40}
                height={40}
                className="h-10 w-10"
                priority
              />
              <span className="text-2xl font-black hidden sm:inline">
                {siteConfig.name}
              </span>
            </Link>
            <Badge variant="secondary" className="font-black text-xs">
              Admin
            </Badge>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/admin/challenges", label: "Challenges" },
                { href: "/admin/users", label: "Users" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-background px-4 py-2 text-base font-bold transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 pt-32 pb-20">{children}</main>
    </div>
  );
}
