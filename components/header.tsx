import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { UserDropdown } from "./user-dropdown";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-border bg-background neo-shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Kubeasy"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-2xl font-black">Kubeasy</span>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-9 px-4 py-2">
                <Link
                  href={"/challenges"}
                  className="text-base font-bold hover:text-primary transition-colors"
                >
                  Challenges
                </Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/challenges">
                        <div className="font-medium">All challenges</div>
                        <div className="text-muted-foreground">
                          Browse all challenges in the catalog.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/themes">
                        <div className="font-medium">Themes</div>
                        <div className="text-muted-foreground">
                          Explore challenges by themes.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href={"https://docs.kubeasy.dev"}
                className={cn(
                  "text-base font-bold hover:text-primary transition-colors",
                )}
              >
                Documentation
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href={"/about"}
                className={cn(
                  "text-base font-bold hover:text-primary transition-colors",
                )}
              >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          {session ? (
            <UserDropdown user={session.user} />
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
    </header>
  );
}
