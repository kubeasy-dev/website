"use client";

import type { User } from "better-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { UserDropdown } from "./user-dropdown";

export function HeaderActions({ user }: { user: User | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        {/* Placeholder for mobile menu */}
        <div className="md:hidden w-10 h-10" />

        {/* Placeholder for desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="w-10 h-10" />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold invisible"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                className="neo-border neo-shadow font-bold invisible"
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
