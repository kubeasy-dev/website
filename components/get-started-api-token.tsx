"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, Copy, Key, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackApiTokenCopied, trackApiTokenCreated } from "@/lib/analytics";
import { authClient } from "@/lib/auth-client";

export function GetStartedApiToken() {
  const [showForm, setShowForm] = useState(false);
  const [tokenName, setTokenName] = useState("kubeasy-cli");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(
    null,
  );

  const { data: tokens, isLoading } = useQuery({
    queryKey: ["apiKey.list"],
    queryFn: async () => {
      const { data, error } = await authClient.apiKey.list();
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await authClient.apiKey.create({ name });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setNewlyCreatedToken(data.key);
      setShowForm(false);
      setTokenName("kubeasy-cli");
      trackApiTokenCreated(data.id);
      toast.success("API token created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create token", {
        description: error.message,
      });
    },
  });

  const handleCreateToken = () => {
    if (!tokenName.trim()) return;
    createMutation.mutate(tokenName.trim());
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    trackApiTokenCopied("kubeasy-cli");
    toast.success("Token copied to clipboard");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Loading tokens...</span>
      </div>
    );
  }

  const hasTokens = tokens && tokens.length > 0;

  // If user just created a token, show it
  if (newlyCreatedToken) {
    return (
      <Alert className="border-4 border-accent bg-accent/10">
        <AlertCircle className="h-5 w-5 text-accent" />
        <AlertDescription className="font-semibold">
          <p className="mb-2">
            Copy your API token now. You won&apos;t be able to see it again!
          </p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm bg-background px-3 py-2 neo-border flex-1 overflow-x-auto">
              {newlyCreatedToken}
            </code>
            <Button
              onClick={() => handleCopyToken(newlyCreatedToken)}
              size="sm"
              className="neo-border shrink-0"
            >
              {copiedToken === newlyCreatedToken ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            onClick={() => setNewlyCreatedToken(null)}
            size="sm"
            variant="outline"
            className="mt-3 neo-border"
          >
            I&apos;ve saved my token
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // If user already has tokens, show a success message
  if (hasTokens) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border-4 border-green-600 rounded-lg">
        <Check className="h-5 w-5 text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-green-800">
            You have {tokens.length} API token{tokens.length > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-green-700">
            Run{" "}
            <code className="font-mono bg-green-100 px-1">kubeasy login</code>{" "}
            and paste your token when prompted.
          </p>
        </div>
      </div>
    );
  }

  // No tokens - show create form
  if (showForm) {
    return (
      <div className="p-4 bg-accent/10 neo-border border-accent rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-accent" />
          <span className="font-bold">Create your API token</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Token name"
            className="neo-border font-bold flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreateToken()}
            disabled={createMutation.isPending}
          />
          <Button
            onClick={handleCreateToken}
            className="bg-accent text-white neo-border font-bold shrink-0"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
          <Button
            onClick={() => setShowForm(false)}
            variant="outline"
            className="neo-border font-bold shrink-0"
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // No tokens - show prompt to create
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50 border-4 border-amber-500 rounded-lg">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-amber-800">
          You need an API token to use the CLI
        </p>
        <p className="text-sm text-amber-700">
          Create one to authenticate with Kubeasy.
        </p>
      </div>
      <Button
        onClick={() => setShowForm(true)}
        size="sm"
        className="bg-amber-500 text-white neo-border border-amber-700 font-bold shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
        Create Token
      </Button>
    </div>
  );
}
