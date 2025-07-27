"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogInIcon, Menu } from "lucide-react";
import { ModeSwitcher } from "./mode-switcher";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { UserDropdown } from "./user-dropdown";
import { FeaturedChallenges } from "./challenges/featured-challenges";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface RouteProps {
  href: string;
  label: string;
  content?: React.ReactNode;
}

const routeList: RouteProps[] = [
  {
    href: "/challenges",
    label: "Challenges",
    content: <FeaturedChallenges />,
  },
  {
    href: "/docs/user",
    label: "Documentation",
  },
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/about",
    label: "About",
  },
];

export function SiteHeader() {
  const router = useRouter();
  const { data: user } = useUser();

  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className='sticky top-0 z-50 w-full'>
      <div className='absolute inset-0 bg-background/80 backdrop-blur-md border-b' />
      <Container className='relative'>
        <header className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2 font-bold text-xl transition-colors hover:text-primary'>
            <span>Kubeasy</span>
          </Link>

          {/* Mobile Menu */}
          <div className='flex items-center lg:hidden'>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='lg:hidden'>
                  <Menu className='h-5 w-5' />
                  <span className='sr-only'>Toggle menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side='left' className='w-80'>
                <div className='flex flex-col h-full'>
                  <SheetHeader className='border-b pb-4'>
                    <SheetTitle>
                      <Link href='/' className='flex items-center space-x-2 text-xl font-bold'>
                        <span>Kubeasy</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <nav className='flex-1 py-4'>
                    <div className='flex flex-col space-y-1'>
                      {routeList.map(({ href, label }) => (
                        <Button key={href} onClick={() => setIsOpen(false)} asChild variant='ghost' className='justify-start h-auto py-2 px-3 font-normal'>
                          <Link href={href}>{label}</Link>
                        </Button>
                      ))}
                    </div>
                  </nav>

                  <SheetFooter className='border-t pt-4'>
                    <div className='flex w-full items-center justify-between'>
                      {user ? (
                        <UserDropdown />
                      ) : (
                        <Button
                          variant='outline'
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/login");
                          }}
                          className='w-full'
                        >
                          <LogInIcon className='mr-2 h-4 w-4' />
                          Sign In
                        </Button>
                      )}
                      <div className='ml-4'>
                        <ModeSwitcher />
                      </div>
                    </div>
                  </SheetFooter>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className='hidden lg:flex'>
            <NavigationMenuList>
              {routeList.map(({ href, label, content }) => (
                <NavigationMenuItem key={href}>
                  {content ? (
                    <NavigationMenuTrigger className='h-9 px-4 py-2'>
                      <Link href={href} className='font-medium'>
                        {label}
                      </Link>
                    </NavigationMenuTrigger>
                  ) : (
                    <NavigationMenuLink
                      href={href}
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      )}
                    >
                      {label}
                    </NavigationMenuLink>
                  )}
                  {content && (
                    <NavigationMenuContent>
                      <Suspense
                        fallback={
                          <div className='w-[400px] p-4'>
                            <div className='animate-pulse space-y-2'>
                              <div className='h-4 bg-muted rounded w-3/4'></div>
                              <div className='h-4 bg-muted rounded w-1/2'></div>
                            </div>
                          </div>
                        }
                      >
                        {content}
                      </Suspense>
                    </NavigationMenuContent>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Actions */}
          <div className='hidden lg:flex items-center space-x-2'>
            {user ? (
              <UserDropdown />
            ) : (
              <div className='flex items-center space-x-2'>
                <Button variant='ghost' onClick={() => router.push("/login")} className='h-9'>
                  <LogInIcon className='mr-2 h-4 w-4' />
                  Sign In
                </Button>
                <ModeSwitcher />
              </div>
            )}
          </div>
        </header>
      </Container>
    </div>
  );
}
