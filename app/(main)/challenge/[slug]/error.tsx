"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ChallengeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className='py-24 lg:py-32'>
      <h2 className='text-xl font-semibold text-destructive mb-4'>Something went wrong loading the challenge progress!</h2>
      <p className='text-muted-foreground mb-4'>An unexpected error occurred. Please try again.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </section>
  );
}
