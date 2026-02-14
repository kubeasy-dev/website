"use client";

import { CheckCircle2, Download, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackCommandCopied } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { INSTALL_COMMANDS, PLATFORMS, type Platform } from "./constants";
import { TerminalCommand } from "./terminal-command";

interface StepCliInstallProps {
  onContinue: () => void;
  onBack: () => void;
}

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "mac";

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "mac";
}

/**
 * CLI installation step for onboarding wizard.
 * Detects user's platform and shows the appropriate install command.
 */
export function StepCliInstall({ onContinue, onBack }: StepCliInstallProps) {
  const [platform, setPlatform] = useState<Platform>("mac");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative p-4 bg-gradient-to-br from-zinc-800 to-zinc-900 neo-border-thick rounded-2xl">
            <Terminal className="w-10 h-10 text-green-400" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-black">Install the CLI</h2>
        <p className="text-lg text-foreground/70 max-w-md">
          Your gateway to real Kubernetes challenges
        </p>
      </div>

      {/* Platform Tabs */}
      <div
        className="w-full"
        role="tablist"
        aria-label="Select your operating system"
      >
        <div className="flex neo-border-thick rounded-xl overflow-hidden">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={platform === p}
              aria-controls={`panel-${p}`}
              onClick={() => setPlatform(p)}
              className={cn(
                "flex-1 px-4 py-3 font-bold transition-all flex items-center justify-center gap-2",
                platform === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-secondary text-foreground/70 hover:text-foreground",
              )}
            >
              <span className="text-lg" aria-hidden="true">
                {INSTALL_COMMANDS[p].icon}
              </span>
              <span className="hidden sm:inline">
                {INSTALL_COMMANDS[p].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Command */}
      <div
        id={`panel-${platform}`}
        role="tabpanel"
        aria-labelledby={`tab-${platform}`}
        className="w-full"
      >
        <TerminalCommand
          command={INSTALL_COMMANDS[platform].command}
          onCopy={() =>
            trackCommandCopied(
              INSTALL_COMMANDS[platform].command,
              "onboarding_cli_install",
            )
          }
        />
      </div>

      {/* Verification Box */}
      <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg w-full">
        <div className="p-2 bg-accent/20 rounded-lg" aria-hidden="true">
          <CheckCircle2 className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">Verify installation</p>
          <code className="text-xs font-mono text-foreground/60">
            kubeasy --version
          </code>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 w-full">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="neo-border font-bold hover:bg-secondary"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          size="lg"
          className="group neo-border neo-shadow font-black flex-1 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <Download
            className="w-5 h-5 mr-2 group-hover:motion-safe:animate-bounce"
            aria-hidden="true"
          />
          I've Installed It
        </Button>
      </div>
    </div>
  );
}
