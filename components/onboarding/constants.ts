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
  npm: {
    command: `npm install -g @kubeasy-dev/kubeasy-cli@latest`,
    label: "npm",
    icon: "⋂₱₥",
  },
} as const;

/** Polling interval for async step detection (in ms) */
export const POLLING_INTERVAL = 2000;

export type Method = keyof typeof INSTALL_COMMANDS;

/** Available methods for CLI installation */
export const METHODS: Method[] = ["npm"];
