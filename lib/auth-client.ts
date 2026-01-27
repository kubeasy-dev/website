import { adminClient, apiKeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { resetAnalytics } from "@/lib/analytics";

export const authClient = createAuthClient({
  plugins: [apiKeyClient(), adminClient()],
});

export const signInWithSocialProvider = async (
  provider: string,
  callbackUrl = "/dashboard",
) => {
  try {
    // Retrieve demo token from localStorage if it exists (for conversion tracking)
    const demoToken =
      typeof window !== "undefined"
        ? localStorage.getItem("kubeasy_demo_token")
        : null;

    const data = await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl,
      // Pass demo token via additionalData (preserved through OAuth redirect)
      ...(demoToken && {
        additionalData: { demoToken },
      }),
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to sign in with ${provider}`);
  }
};

export const signOut = async () => {
  try {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Reset PostHog to anonymous state before page reload
          // This must happen before redirect as the page reload would prevent
          // the PostHogIdentify useEffect from detecting the session change
          resetAnalytics();

          // Force a full page reload to ensure all state is cleared
          window.location.href = "/";
        },
      },
    });
  } catch (error) {
    console.error("Error signing out:", error);
    throw new Error("Failed to sign out");
  }
};
