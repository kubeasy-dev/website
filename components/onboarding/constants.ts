/**
 * Constants for the onboarding wizard
 *
 * Re-exports from the centralized workflow definitions for backward compatibility.
 */

import {
  ONBOARDING_CHALLENGE as _ONBOARDING_CHALLENGE,
  ONBOARDING_CLI_COMMANDS,
} from "@/lib/workflow";

/** The recommended challenge for onboarding */
export const ONBOARDING_CHALLENGE = _ONBOARDING_CHALLENGE;

/** CLI commands used in onboarding */
export const CLI_COMMANDS = ONBOARDING_CLI_COMMANDS;

/** Installation commands per platform - from GitHub releases */
export const INSTALL_COMMANDS = {
  mac: {
    command: `curl -LO https://github.com/kubeasy-dev/kubeasy-cli/releases/latest/download/kubeasy-darwin-arm64
chmod +x kubeasy-darwin-arm64
sudo mv kubeasy-darwin-arm64 /usr/local/bin/kubeasy`,
    label: "macOS",
    icon: "🍎",
  },
  linux: {
    command: `curl -LO https://github.com/kubeasy-dev/kubeasy-cli/releases/latest/download/kubeasy-linux-amd64
chmod +x kubeasy-linux-amd64
sudo mv kubeasy-linux-amd64 /usr/local/bin/kubeasy`,
    label: "Linux",
    icon: "🐧",
  },
  windows: {
    command:
      "# Download from https://github.com/kubeasy-dev/kubeasy-cli/releases/latest",
    label: "Windows",
    icon: "🪟",
  },
} as const;

/** Polling interval for async step detection (in ms) */
export const POLLING_INTERVAL = 2000;

export type Platform = keyof typeof INSTALL_COMMANDS;

/** Available platforms for CLI installation */
export const PLATFORMS: Platform[] = ["mac", "linux", "windows"];
