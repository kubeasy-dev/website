"use client";

import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  Copy,
  Key,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackApiTokenCopied, trackApiTokenCreated } from "@/lib/analytics";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface StepApiTokenProps {
  hasExistingToken: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const TOKEN_FEATURES = [
  { icon: Shield, text: "Securely track your progress" },
  { icon: Sparkles, text: "Submit solutions and earn XP" },
  { icon: Lock, text: "Sync across all your devices" },
];

/**
 * API token creation step for onboarding wizard.
 * Handles creating and displaying the token with proper security warnings.
 */
export function StepApiToken({
  hasExistingToken,
  onContinue,
  onBack,
}: StepApiTokenProps) {
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await authClient.apiKey.create({ name });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCreatedToken(data.key);
      trackApiTokenCreated();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create token");
    },
  });

  const handleCreateToken = useCallback(() => {
    setError(null);
    createMutation.mutate("Kubeasy CLI");
  }, [createMutation]);

  const handleCopy = useCallback(async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      setCopied(true);
      trackApiTokenCopied("Kubeasy CLI");
      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy token:", err);
    }
  }, [createdToken]);

  // If user already has a token, show a simplified view
  if (hasExistingToken && !createdToken) {
    return (
      <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div
              className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"
              aria-hidden="true"
            />
            <div className="relative p-4 bg-gradient-to-br from-green-500 to-green-600 neo-border-thick rounded-2xl">
              <Check className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black">Token Ready</h2>
          <p className="text-lg text-foreground/70">
            You already have an API token configured
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
          <div className="p-3 bg-green-500 rounded-full" aria-hidden="true">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-black">Token exists</p>
            <p className="text-sm text-foreground/60">
              Continue with your existing token or create a new one
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="neo-border font-bold hover:bg-secondary"
          >
            Back
          </Button>
          <Button
            onClick={handleCreateToken}
            variant="outline"
            size="lg"
            className="neo-border font-bold"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2
                className="w-4 h-4 motion-safe:animate-spin mr-2"
                aria-hidden="true"
              />
            ) : (
              <Key className="w-4 h-4 mr-2" aria-hidden="true" />
            )}
            Create New Token
          </Button>
          <Button
            onClick={onContinue}
            size="lg"
            className="group neo-border neo-shadow font-black flex-1 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Token created - show copy view
  if (createdToken) {
    return (
      <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div
              className="absolute inset-0 bg-primary/20 blur-xl rounded-full motion-safe:animate-pulse"
              aria-hidden="true"
            />
            <div className="relative p-4 bg-gradient-to-br from-primary to-primary-dark neo-border-thick rounded-2xl">
              <Sparkles className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black">Token Created!</h2>
          <p className="text-lg text-foreground/70">
            Copy it now — you won't see it again
          </p>
        </div>

        {/* Token Display */}
        <div className="w-full neo-border-thick neo-shadow-lg rounded-xl overflow-hidden">
          <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-zinc-400" aria-hidden="true" />
              <span className="text-zinc-400 text-xs font-mono">API Token</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              aria-label={copied ? "Token copied" : "Copy token to clipboard"}
              className={cn(
                "transition-all",
                copied
                  ? "text-green-400 bg-green-400/10"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700",
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="bg-zinc-900 p-4">
            <code className="text-green-400 font-mono text-sm break-all select-all">
              {createdToken}
            </code>
          </div>
        </div>

        {/* Warning */}
        <div
          className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg"
          role="alert"
        >
          <AlertTriangle
            className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold">Save this token securely</p>
            <p className="text-sm text-foreground/60">
              Store it in a password manager or secure note. This is the only
              time you'll see the full token.
            </p>
          </div>
        </div>

        <Button
          onClick={onContinue}
          size="lg"
          className="group neo-border neo-shadow font-black w-full py-6 text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <Lock className="w-5 h-5 mr-2" aria-hidden="true" />
          I've Saved My Token
        </Button>
      </div>
    );
  }

  // Create token view
  return (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div
            className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
            aria-hidden="true"
          />
          <div className="relative p-4 bg-gradient-to-br from-primary to-primary-dark neo-border-thick rounded-2xl">
            <Key className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-black">Create API Token</h2>
        <p className="text-lg text-foreground/70">
          Authenticate the CLI with your account
        </p>
      </div>

      {/* Features */}
      <div className="w-full">
        <h3 className="font-bold text-sm text-foreground/60 mb-4 text-center">
          Why do you need a token?
        </h3>
        <div className="grid gap-3">
          {TOKEN_FEATURES.map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg"
            >
              <div className="p-2 bg-primary/10 rounded-lg" aria-hidden="true">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="w-full bg-red-50 neo-border-destructive p-4 rounded-xl"
          role="alert"
        >
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

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
          onClick={handleCreateToken}
          size="lg"
          className="group neo-border neo-shadow font-black flex-1 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <>
              <Loader2
                className="w-5 h-5 motion-safe:animate-spin mr-2"
                aria-hidden="true"
              />
              Creating...
            </>
          ) : (
            <>
              <Key
                className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
                aria-hidden="true"
              />
              Generate Token
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
