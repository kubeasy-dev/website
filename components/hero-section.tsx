"use client";

import { Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { trackCtaClicked } from "@/lib/analytics";
import { Icons } from "./icons";
import { InteractiveTerminal } from "./interactive-terminal";

export function HeroSection() {
  const handleCtaClick = (ctaText: string, targetUrl: string) => {
    trackCtaClicked(ctaText, "hero", targetUrl);
  };

  return (
    <section className="relative pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-bold neo-border neo-shadow">
              <Terminal className="h-4 w-4" />
              <span>Free & Open Source</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-balance">
              Master Kubernetes <span className="text-primary">by Doing</span>
            </h1>

            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-xl">
              Learn Kubernetes by solving real-world challenges on your local
              machine. From pods to production-ready deployments, build your
              skills step by step.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-base font-bold neo-border-thick neo-shadow-lg"
                asChild
              >
                <Link
                  href="/get-started"
                  onClick={() => handleCtaClick("Get Started", "/get-started")}
                >
                  Get Started
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base font-bold bg-white neo-border-thick neo-shadow-lg"
                asChild
              >
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  onClick={() =>
                    handleCtaClick("View on GitHub", siteConfig.links.github)
                  }
                >
                  <Icons.gitHub className="mr-2 h-5 w-5" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 w-full">
            <InteractiveTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
