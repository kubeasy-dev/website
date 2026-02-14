import type { LucideIcon } from "lucide-react";

/**
 * Step advancement strategy types
 */
export type StepAdvancement =
  | { type: "manual" }
  | { type: "auto-on-copy" }
  | { type: "realtime"; eventType: string };

/**
 * Color scheme for workflow steps
 */
export type StepColor = "primary" | "accent" | "green" | "amber";

/**
 * Base workflow step definition
 */
export interface WorkflowStep {
  /** Unique key for the step (used for tracking and events) */
  key: string;
  /** Step number (1-indexed, for display) */
  number: number;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Color scheme for the step */
  color: StepColor;
  /** How the step advances to the next one */
  advancement: StepAdvancement;
  /** CLI command for copy-based steps */
  command?: string;
  /** External resource links */
  links?: Array<{ text: string; url: string }>;
}

/**
 * Workflow definition containing all steps and metadata
 */
export interface WorkflowDefinition {
  /** Unique workflow identifier */
  id: string;
  /** Human-readable workflow name */
  name: string;
  /** Channel pattern for realtime events (e.g., "demo:{token}" or "onboarding:{userId}") */
  channelPattern: string;
  /** All steps in the workflow */
  steps: WorkflowStep[];
  /** All realtime event types this workflow listens to */
  events: string[];
}

/**
 * Options for the useWorkflowStep hook
 */
export interface UseWorkflowStepOptions {
  /** Realtime channel to subscribe to */
  channel: string;
  /** Event type to listen for */
  eventType: string;
  /** Optional filter function for event data */
  eventFilter?: (data: unknown) => boolean;
  /** Initial completed state */
  initialCompleted: boolean;
  /** Callback when step is completed */
  onComplete?: () => void;
  /** Query keys to invalidate on completion */
  invalidateQueryKeys?: unknown[][];
  /** Whether the hook is enabled */
  enabled?: boolean;
}

/**
 * Result from the useWorkflowStep hook
 */
export interface UseWorkflowStepResult {
  /** Whether the step is completed */
  isCompleted: boolean;
  /** Realtime connection status */
  status: "connecting" | "connected" | "disconnected";
}

/**
 * Step color scheme configuration
 */
export const STEP_COLORS = {
  primary: {
    bg: "bg-primary",
    bgLight: "bg-primary/5",
    text: "text-primary",
    textOnBg: "text-primary-foreground",
  },
  accent: {
    bg: "bg-accent",
    bgLight: "bg-accent/10",
    text: "text-accent",
    textOnBg: "text-foreground",
  },
  green: {
    bg: "bg-green-500",
    bgLight: "bg-green-50",
    text: "text-green-500",
    textOnBg: "text-white",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-500",
    textOnBg: "text-white",
  },
} as const;
