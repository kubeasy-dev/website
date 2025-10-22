import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getThemeBySlug, getThemes } from "@/server/db/queries";

export const themeRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return getThemes();
  }),
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getThemeBySlug(input.slug);
    }),
});
