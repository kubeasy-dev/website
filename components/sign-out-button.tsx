"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
      }}
      className="w-full flex items-center font-bold text-destructive cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </button>
  );
}
