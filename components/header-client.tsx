"use client";

import type { User } from "better-auth";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { UserDropdown } from "./user-dropdown";

interface RouteProps {
  href: string;
  label: string;
  external?: boolean;
  subRoutes?: Array<{
    href: string;
    label: string;
    description: string;
  }>;
}

const routeList: RouteProps[] = [
  {
    href: "/challenges",
    label: "Challenges",
    subRoutes: [
      {
        href: "/challenges",
        label: "All challenges",
        description: "Browse all challenges in the catalog.",
      },
      {
        href: "/themes",
        label: "Themes",
        description: "Explore challenges by themes.",
      },
    ],
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

interface HeaderClientProps {
  user?: User;
}

export function HeaderClient({ user }: HeaderClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
        <span className="text-xl font-black sm:hidden">{siteConfig.name}</span>
      </Link>

      {/* Mobile Menu */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-80">
            <div className="flex flex-col h-full">
              <SheetHeader className="border-b pb-4">
                <SheetTitle>
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Image
                      src="/logo.png"
                      alt={siteConfig.name}
                      width={32}
                      height={32}
                      className="h-8 w-8"
                    />
                    <span className="text-xl font-black">
                      {siteConfig.name}
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex-1 py-4">
                <div className="flex flex-col space-y-2">
                  {routeList.map(({ href, label, external, subRoutes }) => (
                    <div key={href} className="space-y-1">
                      {subRoutes ? (
                        <>
                          {/* Parent label (non-clickable) */}
                          <div className="px-3 py-2 text-sm font-black text-foreground/60 uppercase tracking-wide">
                            {label}
                          </div>
                          {/* Sub-routes directly visible */}
                          {subRoutes.map((subRoute) => (
                            <Button
                              key={subRoute.href}
                              onClick={() => {
                                setIsOpen(false);
                                router.push(subRoute.href);
                              }}
                              variant="ghost"
                              className="justify-start h-auto py-2.5 px-4 font-bold text-base w-full"
                              asChild
                            >
                              <Link href={subRoute.href}>{subRoute.label}</Link>
                            </Button>
                          ))}
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setIsOpen(false);
                            if (external) {
                              window.open(href, "_blank");
                            } else {
                              router.push(href);
                            }
                          }}
                          asChild
                          variant="ghost"
                          className="justify-start h-auto py-2.5 px-4 font-bold text-base w-full"
                        >
                          <Link
                            href={href}
                            target={external ? "_blank" : undefined}
                          >
                            {label}
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </nav>

              <SheetFooter className="border-t pt-4">
                <div className="flex w-full flex-col gap-2">
                  {user ? (
                    <div className="flex items-center justify-between w-full">
                      <UserDropdown user={user} />
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsOpen(false);
                          router.push("/login");
                        }}
                        className="w-full font-bold"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          setIsOpen(false);
                          router.push("/challenges");
                        }}
                        className="w-full neo-border neo-shadow font-bold"
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {routeList.map(({ href, label, external, subRoutes }) => (
            <NavigationMenuItem key={href}>
              {subRoutes ? (
                <>
                  <NavigationMenuTrigger className="h-9 px-4 py-2">
                    <Link
                      href={href}
                      className="text-base font-bold hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-2 p-4">
                      {subRoutes.map((subRoute) => (
                        <li key={subRoute.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={subRoute.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-bold leading-none">
                                {subRoute.label}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {subRoute.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink
                  href={href}
                  target={external ? "_blank" : undefined}
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-base font-bold transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  {label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-3">
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
    </>
  );
}
