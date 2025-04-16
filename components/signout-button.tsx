"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";

export default function SignOutButton() {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <Button size='icon' variant='ghost' onClick={() => handleSignOut()}>
      <LogOutIcon />
    </Button>
  );
}
