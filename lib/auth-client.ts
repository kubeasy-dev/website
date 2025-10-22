import { adminClient, apiKeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
  plugins: [apiKeyClient(), adminClient()],
});

export const signInWithSocialProvider = async (
  provider: string,
  callbackUrl = "/dashboard",
) => {
  try {
    const data = await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl,
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
