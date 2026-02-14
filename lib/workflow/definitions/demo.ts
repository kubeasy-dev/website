import { ArrowRight, Rocket, Terminal, Zap } from "lucide-react";
import type { WorkflowDefinition, WorkflowStep } from "../types";

/**
 * Create demo workflow steps with the provided token.
 * The token is required for step 2's command.
 */
export function createDemoSteps(token: string): WorkflowStep[] {
  return [
    {
      key: "install",
      number: 1,
      title: "Install the CLI",
      description: "Install the Kubeasy CLI globally using npm.",
      command: "npm install -g @kubeasy-dev/kubeasy-cli",
      icon: Terminal,
      color: "primary",
      advancement: { type: "auto-on-copy" },
      links: [
        {
          text: "Install npm",
          url: "https://docs.npmjs.com/downloading-and-installing-node-js-and-npm",
        },
      ],
    },
    {
      key: "start",
      number: 2,
      title: "Start the Demo",
      description: "Sets up a local Kind cluster and creates a demo namespace.",
      command: `kubeasy demo start --token=${token}`,
      icon: Rocket,
      color: "accent",
      advancement: { type: "realtime", eventType: "demo.started" },
    },
    {
      key: "create-pod",
      number: 3,
      title: "Create the nginx Pod",
      description: "Run a simple nginx pod in the demo namespace.",
      command: "kubectl run nginx --image=nginx -n demo",
      icon: Zap,
      color: "green",
      advancement: { type: "auto-on-copy" },
    },
    {
      key: "submit",
      number: 4,
      title: "Submit Your Solution",
      description:
        "Validate that the pod is running and see your results update live.",
      command: "kubeasy demo submit",
      icon: ArrowRight,
      color: "amber",
      advancement: { type: "realtime", eventType: "validation.update" },
    },
  ];
}

/**
 * Create the demo workflow definition.
 * @param token - Demo session token for channel subscription
 */
export function createDemoWorkflow(token: string): WorkflowDefinition {
  return {
    id: "demo",
    name: "Demo",
    channelPattern: `demo:${token}`,
    steps: createDemoSteps(token),
    events: ["demo.started", "validation.update"],
  };
}

/**
 * Demo workflow event types for type safety
 */
export const DEMO_EVENTS = {
  STARTED: "demo.started",
  VALIDATION_UPDATE: "validation.update",
} as const;

/**
 * Total number of demo steps
 */
export const DEMO_TOTAL_STEPS = 4;
