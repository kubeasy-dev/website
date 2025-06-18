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
    <header className='shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-background'>
      <Link href='/' className='font-bold text-lg flex items-center text-xl'>
        Kubeasy
      </Link>
      {/* <!-- Mobile --> */}
      <div className='flex items-center lg:hidden'>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu onClick={() => setIsOpen(!isOpen)} className='cursor-pointer lg:hidden' />
          </SheetTrigger>

          <SheetContent side='left' className='flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary'>
            <div>
              <SheetHeader className='mb-4 ml-4'>
                <SheetTitle className='flex items-center'>
                  <Link href='/' className='flex items-center text-xl'>
                    Kubeasy
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className='flex flex-col gap-2'>
                {routeList.map(({ href, label }) => (
                  <Button key={href} onClick={() => setIsOpen(false)} asChild variant='ghost' className='justify-start text-base'>
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className='flex-col sm:flex-col justify-start items-start'>
              <Separator className='mb-2' />
              <ModeSwitcher />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* <!-- Desktop --> */}
      <NavigationMenu className='hidden lg:block mx-auto'>
        <NavigationMenuList>
          {routeList.map(({ href, label, content }) => (
            <NavigationMenuItem key={href}>
              {content ? (
                <NavigationMenuTrigger>
                  <Link href={href} className='text-base px-2 font-normal'>
                    {label}
                  </Link>
                </NavigationMenuTrigger>
              ) : (
                <NavigationMenuLink href={href} className='text-base px-2'>
                  {label}
                </NavigationMenuLink>
              )}
              {content && (
                <NavigationMenuContent>
                  <Suspense fallback={<div>Loading...</div>}>{content}</Suspense>
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className='hidden lg:flex'>
        {user ? (
          <UserDropdown />
        ) : (
          <div className='flex items-center space-x-2'>
            <Button variant='ghost' onClick={() => router.push("/login")}>
              <LogInIcon />
              Sign In
            </Button>
            <ModeSwitcher />
          </div>
        )}
      </div>
    </header>
  );
}
