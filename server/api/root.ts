import { challengeRouter } from "@/server/api/routers/challenge";
import { createTRPCRouter } from "@/server/api/trpc";
import { apiKeyRouter } from "./routers/apiKey";
import { emailPreferenceRouter } from "./routers/emailPreference";
import { onboardingRouter } from "./routers/onboarding";
import { themeRouter } from "./routers/theme";
import { typeRouter } from "./routers/type";
import { userRouter } from "./routers/user";
import { userProgressRouter } from "./routers/userProgress";
import { xpTransactionRouter } from "./routers/xpTransaction";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  apiKey: apiKeyRouter,
  challenge: challengeRouter,
  theme: themeRouter,
  type: typeRouter,
  user: userRouter,
  userProgress: userProgressRouter,
  xpTransaction: xpTransactionRouter,
  emailPreference: emailPreferenceRouter,
  onboarding: onboardingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
