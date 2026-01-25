"use client";

import type { User } from "better-auth";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Dynamic imports to avoid SSR issues with Radix UI on Safari
const MobileMenu = dynamic(
  () => import("./mobile-menu").then((mod) => mod.MobileMenu),
  {
    ssr: false,
    loading: () => (
      <div className="md:hidden w-10 h-10 bg-muted rounded animate-pulse" />
    ),
  },
);

const UserDropdown = dynamic(
  () => import("./user-dropdown").then((mod) => mod.UserDropdown),
  {
    ssr: false,
    loading: () => (
      <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
    ),
  },
);

export function HeaderActions({ user }: { user: User | null }) {
  return (
    <div className="flex items-center gap-3">
      {/* Mobile Menu - only on small screens */}
      <MobileMenu user={user} />

      {/* User dropdown / Auth buttons - visible on medium screens and up */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <UserDropdown user={user} />
        ) : (
          <>
            <Button variant="ghost" size="sm" className="font-bold" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              size="sm"
              className="neo-border neo-shadow font-bold"
              asChild
            >
              <Link href="/get-started">Try Demo</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
