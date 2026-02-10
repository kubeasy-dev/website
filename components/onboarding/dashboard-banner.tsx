"use client";

import { ChevronRight, Rocket, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DashboardBannerProps {
  userName: string;
}

export function DashboardBanner({ userName }: DashboardBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-primary neo-border-thick neo-shadow p-6 mb-8 relative">
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 text-primary-foreground/60 hover:text-primary-foreground"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-foreground/20 rounded-lg shrink-0">
          <Rocket className="w-6 h-6 text-primary-foreground" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black text-primary-foreground">
            Complete Your Setup, {userName}!
          </h3>
          <p className="text-primary-foreground/80 mt-1">
            You skipped the onboarding wizard. Complete the setup to unlock all
            features and start solving challenges.
          </p>

          <Button
            asChild
            variant="secondary"
            className="mt-4 neo-border font-black"
          >
            <Link href="/onboarding">
              Resume Setup
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
