"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TerminalCommandProps {
  command: string;
  onCopy?: () => void;
  className?: string;
}

/**
 * Reusable terminal command display component with copy functionality.
 * Styled as a macOS-like terminal window with traffic light buttons.
 *
 * @component
 * @example
 * <TerminalCommand
 *   command="kubeasy login"
 *   onCopy={() => trackCommandCopied("kubeasy login", "onboarding")}
 * />
 */
export function TerminalCommand({
  command,
  onCopy,
  className,
}: TerminalCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, [command, onCopy]);

  return (
    <div
      className={cn(
        "w-full neo-border-thick neo-shadow-lg rounded-xl overflow-hidden",
        className,
      )}
    >
      {/* Terminal Header */}
      <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-zinc-400 text-xs font-mono ml-2">terminal</span>
      </div>
      {/* Terminal Content */}
      <div className="bg-zinc-900 p-4">
        <div className="flex items-start justify-between gap-4">
          <code className="text-green-400 font-mono text-sm break-all whitespace-pre-wrap flex-1">
            <span className="text-zinc-500">$</span> {command}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label={
              copied ? "Copied to clipboard" : "Copy command to clipboard"
            }
            className={cn(
              "shrink-0 transition-all",
              copied
                ? "text-green-400 bg-green-400/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700",
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
