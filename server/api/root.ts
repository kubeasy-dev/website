import { challengeRouter } from "@/server/api/routers/challenge";
import { createTRPCRouter } from "@/server/api/trpc";
import { emailPreferenceRouter } from "./routers/emailPreference";
import { themeRouter } from "./routers/theme";
import { userRouter } from "./routers/user";
import { userProgressRouter } from "./routers/userProgress";
import { xpTransactionRouter } from "./routers/xpTransaction";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  challenge: challengeRouter,
  theme: themeRouter,
  user: userRouter,
  userProgress: userProgressRouter,
  xpTransaction: xpTransactionRouter,
  emailPreference: emailPreferenceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
