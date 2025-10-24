"use client";

import type { User } from "better-auth";
import { LogOut, Menu } from "lucide-react";
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
                    <div key={href}>
                      <Button
                        onClick={() => {
                          if (!subRoutes) {
                            setIsOpen(false);
                            if (external) {
                              window.open(href, "_blank");
                            } else {
                              router.push(href);
                            }
                          }
                        }}
                        asChild={!subRoutes}
                        variant="ghost"
                        className="justify-start h-auto py-2 px-3 font-bold w-full"
                      >
                        {subRoutes ? (
                          <span>{label}</span>
                        ) : (
                          <Link
                            href={href}
                            target={external ? "_blank" : undefined}
                          >
                            {label}
                          </Link>
                        )}
                      </Button>
                      {subRoutes && (
                        <div className="ml-4 mt-1 space-y-1">
                          {subRoutes.map((subRoute) => (
                            <Button
                              key={subRoute.href}
                              onClick={() => {
                                setIsOpen(false);
                                router.push(subRoute.href);
                              }}
                              variant="ghost"
                              className="justify-start h-auto py-2 px-3 font-medium text-sm w-full"
                              asChild
                            >
                              <Link href={subRoute.href}>{subRoute.label}</Link>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </nav>

              <SheetFooter className="pt-4">
                <div className="flex w-full flex-col gap-2">
                  {user ? (
                    <>
                      {/* User menu items directly visible */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/dashboard");
                          }}
                          className="justify-start font-bold w-full"
                          asChild
                        >
                          <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/profile");
                          }}
                          className="justify-start font-bold w-full"
                          asChild
                        >
                          <Link href="/profile">Profile</Link>
                        </Button>
                      </div>

                      {/* User info section */}
                      <div className="px-3 py-2 border-t flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground mt-1">
                            {user.email}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={async () => {
                            setIsOpen(false);
                            const { signOut } = await import(
                              "@/lib/auth-client"
                            );
                            await signOut();
                          }}
                          className="text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/login");
                      }}
                      className="w-full neo-border neo-shadow font-bold"
                    >
                      Get Started
                    </Button>
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
                    <ul className="grid w-[300px] gap-4">
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
