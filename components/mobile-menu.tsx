"use client";

import type { User } from "better-auth";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";

interface RouteProps {
  href: string;
  label: string;
  external?: boolean;
}

const routeList: RouteProps[] = [
  {
    href: "/challenges",
    label: "Challenges",
  },
  {
    href: "https://docs.kubeasy.dev",
    label: "Documentation",
    external: true,
  },
  {
    href: "/about",
    label: "About",
  },
];

export function MobileMenu({ user }: { user: User | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {routeList.map(({ href, label, external }) => (
          <DropdownMenuItem key={href} asChild>
            <Link
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="font-bold cursor-pointer"
            >
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="font-bold cursor-pointer">
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="font-bold cursor-pointer">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <SignOutButton />
            </DropdownMenuItem>
          </>
        )}
        {!user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="font-bold cursor-pointer">
                Get Started
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
