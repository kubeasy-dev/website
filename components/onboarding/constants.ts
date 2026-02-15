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

/** Installation commands per method */
export const INSTALL_COMMANDS = {
  npm: {
    command: "npm install -g @kubeasy-dev/kubeasy-cli@latest",
    label: "npm",
    icon: "📦",
  },
  homebrew: {
    command: "brew install kubeasy-dev/tap/kubeasy",
    label: "Homebrew",
    icon: "🍺",
  },
  script: {
    command: "curl -fsSL https://download.kubeasy.dev/install.sh | sh",
    label: "Shell",
    icon: "🐚",
  },
  scoop: {
    command:
      "scoop bucket add kubeasy https://github.com/kubeasy-dev/scoop-bucket && scoop install kubeasy",
    label: "Scoop",
    icon: "🪣",
  },
} as const;

/** Polling interval for async step detection (in ms) */
export const POLLING_INTERVAL = 2000;

export type Method = keyof typeof INSTALL_COMMANDS;

/** Available methods for CLI installation */
export const METHODS: Method[] = ["npm", "homebrew", "script", "scoop"];
