"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import useSupabase from "@/hooks/use-supabase";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const supabase = useSupabase();

  const handleLogin = async (provider: "github" | "azure" | "google") => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${next ?? "/"}`,
        ...(provider === "azure" ? { scopes: "email" } : {}),
      },
    });
    setIsLoading(false);
  };

  return (
    <div className='mt-8 space-y-4'>
      <Button className='w-full dark:bg-muted text-white' onClick={() => handleLogin("github")} disabled={isLoading}>
        <Icons.gitHub className='mr-2 h-4 w-4' />
        Sign in with GitHub
      </Button>
      <Button className='w-full dark:bg-muted text-white' onClick={() => handleLogin("azure")} disabled={isLoading}>
        <Icons.microsoft className='mr-2 h-4 w-4' />
        Sign in with Microsoft
      </Button>
      <Button className='w-full dark:bg-muted text-white' onClick={() => handleLogin("google")} disabled={isLoading}>
        <Icons.google className='mr-2 h-4 w-4' />
        Sign in with Google
      </Button>
    </div>
  );
}
