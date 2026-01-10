"use client";

import type { User } from "better-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { UserDropdown } from "./user-dropdown";

/**
 * Skeleton component that matches the structure of the actual content
 * to prevent React hydration mismatches between SSR and client render.
 */
function HeaderActionsSkeleton({ user }: { user: User | null }) {
  return (
    <div className="flex items-center gap-3">
      {/* Skeleton for mobile menu - matches MobileMenu structure */}
      <div className="md:hidden w-10 h-10 bg-muted rounded animate-pulse" />

      {/* Skeleton for desktop actions - matches UserDropdown/buttons structure */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
        ) : (
          <>
            <div className="w-16 h-9 bg-muted rounded animate-pulse" />
            <div className="w-24 h-9 bg-muted rounded animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
}

export function HeaderActions({ user }: { user: User | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render identical skeleton on both server and client (before hydration)
  // This prevents React hydration mismatch errors
  if (!mounted) {
    return <HeaderActionsSkeleton user={user} />;
  }

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
              <Link href="/challenges">Get Started</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
