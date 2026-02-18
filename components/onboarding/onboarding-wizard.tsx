"use client";

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type OnboardingStep,
  trackOnboardingCompleted,
  trackOnboardingSkipped,
  trackOnboardingStarted,
  trackOnboardingStepCompleted,
} from "@/lib/analytics";
import { useTRPC } from "@/trpc/client";
import { OnboardingProgress } from "./onboarding-progress";
import { StepApiToken } from "./step-api-token";
import { StepChallengeComplete } from "./step-challenge-complete";
import { StepChallengeStart } from "./step-challenge-start";
import { StepCliInstall } from "./step-cli-install";
import { StepCliLogin } from "./step-cli-login";
import { StepCliSetup } from "./step-cli-setup";
import { StepWelcome } from "./step-welcome";

interface OnboardingWizardProps {
  userName: string;
  userId: string;
  initialStatus: {
    steps: {
      hasApiToken: boolean;
      cliAuthenticated: boolean;
      clusterInitialized: boolean;
      hasStartedChallenge: boolean;
      hasCompletedChallenge: boolean;
    };
    currentStep: number;
    isComplete: boolean;
    isSkipped: boolean;
  };
}

const STEP_KEYS: OnboardingStep[] = [
  "welcome",
  "cli_install",
  "api_token",
  "cli_login",
  "cli_setup",
  "challenge_start",
  "challenge_complete",
];

/**
 * Main onboarding wizard component.
 * Manages step navigation and tracks progress through the onboarding flow.
 */
export function OnboardingWizard({
  userName,
  userId,
  initialStatus,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStatus.currentStep);
  const [steps, setSteps] = useState(initialStatus.steps);
  const initializedRef = useRef(false);

  const trpc = useTRPC();

  const initializeMutation = useMutation(
    trpc.onboarding.initialize.mutationOptions(),
  );

  const completeMutation = useMutation(
    trpc.onboarding.complete.mutationOptions(),
  );

  // Initialize onboarding record on mount (using ref to prevent re-runs)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeMutation.mutate();
      trackOnboardingStarted();
    }
  }, [initializeMutation]);

  const handleStepComplete = useCallback((stepNumber: number) => {
    trackOnboardingStepCompleted(STEP_KEYS[stepNumber - 1], stepNumber);
    setCurrentStep(stepNumber + 1);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }, []);

  // Just redirect to dashboard - onboarding auto-completes when user does the steps
  const handleFinishLater = useCallback(() => {
    trackOnboardingSkipped(STEP_KEYS[currentStep - 1], currentStep);
    router.push("/dashboard");
  }, [currentStep, router]);

  const handleComplete = useCallback(async () => {
    trackOnboardingCompleted();
    await completeMutation.mutateAsync();
    router.push("/dashboard");
  }, [completeMutation, router]);

  // Update steps when polling detects changes
  const _updateSteps = useCallback(
    (newSteps: typeof steps) => {
      setSteps(newSteps);
      // Auto-advance if current step is now completed
      if (currentStep === 4 && newSteps.cliAuthenticated) {
        handleStepComplete(4);
      } else if (currentStep === 5 && newSteps.clusterInitialized) {
        handleStepComplete(5);
      } else if (currentStep === 6 && newSteps.hasStartedChallenge) {
        handleStepComplete(6);
      }
    },
    [currentStep, handleStepComplete],
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with logo and progress */}
      <header className="py-4 px-4 border-b neo-border-thick bg-secondary/50">
        <div className="relative flex items-center justify-center min-h-[48px]">
          {/* Logo - positioned left */}
          <Link href="/" className="absolute left-4 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Kubeasy"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-2xl font-black hidden sm:inline">
              Kubeasy
            </span>
          </Link>

          {/* Progress bar - centered */}
          <div className="max-w-3xl w-full px-4 hidden md:block">
            <OnboardingProgress currentStep={currentStep} />
          </div>

          {/* Finish later button - positioned right */}
          <Link
            href="/dashboard"
            className="absolute right-4 text-sm font-bold text-foreground/50 hover:text-foreground/70 transition-colors"
          >
            Finish later
          </Link>
        </div>
      </header>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-card neo-border-thick shadow-xl rounded-2xl p-6 md:p-10">
          {currentStep === 1 && (
            <StepWelcome
              userName={userName}
              onContinue={() => handleStepComplete(1)}
              onSkip={handleFinishLater}
            />
          )}

          {currentStep === 2 && (
            <StepCliInstall
              onContinue={() => handleStepComplete(2)}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <StepApiToken
              hasExistingToken={steps.hasApiToken}
              onContinue={() => handleStepComplete(3)}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <StepCliLogin
              userId={userId}
              isCompleted={steps.cliAuthenticated}
              onContinue={() => handleStepComplete(4)}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <StepCliSetup
              userId={userId}
              isCompleted={steps.clusterInitialized}
              onContinue={() => handleStepComplete(5)}
              onBack={handleBack}
            />
          )}

          {currentStep === 6 && (
            <StepChallengeStart
              userId={userId}
              isCompleted={steps.hasStartedChallenge}
              onContinue={() => handleStepComplete(6)}
              onBack={handleBack}
            />
          )}

          {currentStep === 7 && (
            <StepChallengeComplete
              userId={userId}
              isCompleted={steps.hasCompletedChallenge}
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
