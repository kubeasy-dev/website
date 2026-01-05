import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getTypeBySlug, getTypes } from "@/server/db/queries";

export const typeRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return getTypes();
  }),
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getTypeBySlug(input.slug);
    }),
});
