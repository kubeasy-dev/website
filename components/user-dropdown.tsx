import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import useSupabase from "@/hooks/use-supabase";
import { CompassIcon, LifeBuoyIcon, LogOutIcon, SunMoonIcon, UserIcon } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "./ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { Icons } from "./icons";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";

export function UserDropdown() {
  const supabase = useSupabase();
  const { setTheme, theme } = useTheme();

  const handleSignOut = async () => {
    posthog.capture("user_logout");
    window.location.reload();
    await supabase.auth.signOut();
  };

  const toggleTheme = useCallback(
    (theme: "light" | "dark" | "system") => {
      setTheme(theme);
    },
    [setTheme]
  );

  const { data: profile } = useQuery(queries.profile.get(supabase));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost'>
          <UserIcon />
          {profile?.first_name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href='/profile'>
            <DropdownMenuItem>
              <UserIcon />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link href='/learning-path'>
            <DropdownMenuItem>
              <CompassIcon />
              <span>My journey</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoonIcon />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem checked={theme === "dark"} onCheckedChange={() => toggleTheme("dark")}>
                Dark
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={theme === "light"} onCheckedChange={() => toggleTheme("light")}>
                Light
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={theme === "system"} onCheckedChange={() => toggleTheme("system")}>
                System
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icons.gitHub />
          <span>GitHub</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LifeBuoyIcon />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSignOut()}>
          <LogOutIcon />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
