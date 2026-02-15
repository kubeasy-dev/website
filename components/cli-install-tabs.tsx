"use client";

import { useState } from "react";
import { trackCommandCopied } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { INSTALL_COMMANDS, METHODS, type Method } from "./onboarding/constants";
import { TerminalCommand } from "./onboarding/terminal-command";

interface CliInstallTabsProps {
  analyticsSource?: string;
  className?: string;
}

/**
 * Shared CLI installation tabs component.
 * Shows all available installation methods (npm, homebrew, shell script, scoop)
 * with copy-to-clipboard functionality.
 */
export function CliInstallTabs({
  analyticsSource = "cli_install",
  className,
}: CliInstallTabsProps) {
  const [method, setMethod] = useState<Method>("npm");

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Methods Tabs */}
      <div role="tablist" aria-label="Select installation method">
        <div className="flex neo-border-thick rounded-xl overflow-hidden">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={method === m}
              aria-controls={`panel-${m}`}
              onClick={() => setMethod(m)}
              className={cn(
                "flex-1 px-4 py-3 font-bold transition-all flex items-center justify-center gap-2",
                method === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-secondary text-foreground/70 hover:text-foreground",
              )}
            >
              <span className="text-lg" aria-hidden="true">
                {INSTALL_COMMANDS[m].icon}
              </span>
              <span className="hidden sm:inline">
                {INSTALL_COMMANDS[m].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Command */}
      <div
        id={`panel-${method}`}
        role="tabpanel"
        aria-labelledby={`tab-${method}`}
      >
        <TerminalCommand
          command={INSTALL_COMMANDS[method].command}
          onCopy={() =>
            trackCommandCopied(
              INSTALL_COMMANDS[method].command,
              analyticsSource,
            )
          }
        />
      </div>
    </div>
  );
}
