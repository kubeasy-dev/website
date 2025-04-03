import { MainNavItem } from "@/types/nav"

export interface NavConfig {
  mainNav: MainNavItem[]
  appNav: MainNavItem[]
}

export const navConfig: NavConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/app/dashboard",
    },
    {
      title: "Challenge",
      href: "/app/dashboard",
    },
  ],
  appNav: [
    {
      title: "Dashboard",
      href: "/app/dashboard",
    },
    {
      title: "Challenges",
      href: "/app/challenges",
    },
    {
      title: "Profile",
      href: "/app/profile",
    }
  ],
}