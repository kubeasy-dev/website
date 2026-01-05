import { Menu } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./sign-out-button";
import { UserDropdown } from "./user-dropdown";

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

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background neo-shadow-sm neo-border-thick !border-t-0 !border-l-0 !border-r-0">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-2xl font-black hidden sm:inline">
            {siteConfig.name}
          </span>
          <span className="text-xl font-black sm:hidden">
            {siteConfig.name}
          </span>
        </Link>

        {/* Navigation - visible on medium screens and up */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {routeList.map(({ href, label, external }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-lg bg-background px-4 py-2 text-base font-bold transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu - only on small screens */}
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
                    <Link
                      href="/dashboard"
                      className="font-bold cursor-pointer"
                    >
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
      </div>
    </header>
  );
}
