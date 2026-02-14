import { Key, LogIn, Rocket, Server, Terminal, Trophy } from "lucide-react";
import type { WorkflowDefinition, WorkflowStep } from "../types";

/**
 * Onboarding challenge slug used for the challenge steps
 */
export const ONBOARDING_CHALLENGE = "pod-evicted";

/**
 * CLI commands used in onboarding steps
 */
export const ONBOARDING_CLI_COMMANDS = {
  login: "kubeasy login",
  setup: "kubeasy setup",
  challengeStart: `kubeasy challenge start ${ONBOARDING_CHALLENGE}`,
  challengeSubmit: `kubeasy challenge submit ${ONBOARDING_CHALLENGE}`,
} as const;

/**
 * Onboarding step keys that map to realtime events
 */
export type OnboardingStepKey =
  | "cliAuthenticated"
  | "clusterInitialized"
  | "hasStartedChallenge"
  | "hasCompletedChallenge";

/**
 * All onboarding step keys for analytics
 */
export type OnboardingAnalyticsStep =
  | "welcome"
  | "cli_install"
  | "api_token"
  | "cli_login"
  | "cli_setup"
  | "challenge_start"
  | "challenge_complete";

/**
 * Onboarding workflow steps definition
 * Note: Steps 1-3 are manual (UI interaction), steps 4-7 are realtime (CLI events)
 */
export const ONBOARDING_STEPS: WorkflowStep[] = [
  {
    key: "welcome",
    number: 1,
    title: "Welcome",
    description: "Introduction to Kubeasy and what you'll learn.",
    icon: Rocket,
    color: "primary",
    advancement: { type: "manual" },
  },
  {
    key: "cli_install",
    number: 2,
    title: "Install CLI",
    description: "Download and install the Kubeasy CLI for your platform.",
    icon: Terminal,
    color: "accent",
    advancement: { type: "manual" },
  },
  {
    key: "api_token",
    number: 3,
    title: "API Token",
    description: "Create an API token to authenticate your CLI.",
    icon: Key,
    color: "green",
    advancement: { type: "manual" },
  },
  {
    key: "cli_login",
    number: 4,
    title: "Login to CLI",
    description: "Connect your CLI to your Kubeasy account.",
    command: ONBOARDING_CLI_COMMANDS.login,
    icon: LogIn,
    color: "primary",
    advancement: { type: "realtime", eventType: "onboarding.stepCompleted" },
  },
  {
    key: "cli_setup",
    number: 5,
    title: "Setup Cluster",
    description: "Initialize your local Kubernetes cluster.",
    command: ONBOARDING_CLI_COMMANDS.setup,
    icon: Server,
    color: "accent",
    advancement: { type: "realtime", eventType: "onboarding.stepCompleted" },
  },
  {
    key: "challenge_start",
    number: 6,
    title: "Start Challenge",
    description: "Start your first Kubernetes challenge.",
    command: ONBOARDING_CLI_COMMANDS.challengeStart,
    icon: Rocket,
    color: "green",
    advancement: { type: "realtime", eventType: "onboarding.stepCompleted" },
  },
  {
    key: "challenge_complete",
    number: 7,
    title: "Complete Challenge",
    description: "Solve the challenge and submit your solution.",
    command: ONBOARDING_CLI_COMMANDS.challengeSubmit,
    icon: Trophy,
    color: "amber",
    advancement: { type: "realtime", eventType: "onboarding.stepCompleted" },
  },
];

/**
 * Mapping from step key to realtime event step identifier
 */
export const STEP_KEY_TO_EVENT_STEP: Record<string, OnboardingStepKey | null> =
  {
    welcome: null,
    cli_install: null,
    api_token: null,
    cli_login: "cliAuthenticated",
    cli_setup: "clusterInitialized",
    challenge_start: "hasStartedChallenge",
    challenge_complete: "hasCompletedChallenge",
  };

/**
 * Create the onboarding workflow definition.
 * @param userId - User ID for channel subscription
 */
export function createOnboardingWorkflow(userId: string): WorkflowDefinition {
  return {
    id: "onboarding",
    name: "Onboarding",
    channelPattern: `onboarding:${userId}`,
    steps: ONBOARDING_STEPS,
    events: ["onboarding.stepCompleted"],
  };
}

/**
 * Onboarding workflow event types for type safety
 */
export const ONBOARDING_EVENTS = {
  STEP_COMPLETED: "onboarding.stepCompleted",
} as const;

/**
 * Total number of onboarding steps
 */
export const ONBOARDING_TOTAL_STEPS = 7;

/**
 * Analytics step keys array (for tracking)
 */
export const ONBOARDING_ANALYTICS_STEP_KEYS: OnboardingAnalyticsStep[] = [
  "welcome",
  "cli_install",
  "api_token",
  "cli_login",
  "cli_setup",
  "challenge_start",
  "challenge_complete",
];
