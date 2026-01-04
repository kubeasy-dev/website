import { and, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { challengeFiltersSchema } from "@/schemas/challengeFilters";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { getChallengeBySlug, getThemeBySlug } from "@/server/db/queries";
import {
  challenge,
  challengeObjective,
  challengeTheme,
  challengeType,
  userProgress,
} from "@/server/db/schema";

export const challengeRouter = createTRPCRouter({
  list: publicProcedure
    .input(challengeFiltersSchema)
    .query(async ({ ctx, input }) => {
      const filters = [];
      if (input.difficulty) {
        filters.push(eq(challenge.difficulty, input.difficulty));
      }
      if (input.type) {
        filters.push(eq(challenge.type, input.type));
      }
      if (input.theme) {
        filters.push(eq(challenge.theme, input.theme));
      }
      if (input.search) {
        filters.push(ilike(challenge.title, `%${input.search}%`));
      }

      const userId = ctx.user?.id;

      // Build conditions for userProgress join
      const userProgressConditions = userId
        ? and(
            eq(challenge.id, userProgress.challengeId),
            eq(userProgress.userId, userId),
          )
        : eq(challenge.id, userProgress.challengeId);

      if (input.showCompleted === false && userId) {
        const completedChallenges = await ctx.db
          .select({ challengeId: userProgress.challengeId })
          .from(userProgress)
          .where(
            and(
              eq(userProgress.userId, userId),
              eq(userProgress.status, "completed"),
            ),
          );

        const completedChallengeIds = completedChallenges.map(
          (c) => c.challengeId,
        );

        if (completedChallengeIds.length > 0) {
          filters.push(
            sql`${challenge.id} NOT IN (${sql.join(
              completedChallengeIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          );
        }
      }

      const challenges = await ctx.db
        .select({
          id: challenge.id,
          slug: challenge.slug,
          title: challenge.title,
          description: challenge.description,
          theme: challengeTheme.name,
          themeSlug: challenge.theme,
          difficulty: challenge.difficulty,
          type: challengeType.name,
          typeSlug: challenge.type,
          estimatedTime: challenge.estimatedTime,
          initialSituation: challenge.initialSituation,
          objective: challenge.objective,
          ofTheWeek: challenge.ofTheWeek,
          createdAt: challenge.createdAt,
          updatedAt: challenge.updatedAt,
          completedCount: sql<number>`CAST(COUNT(CASE WHEN ${userProgress.status} = 'completed' THEN 1 END) AS INTEGER)`,
          userStatus: userId
            ? sql<string>`COALESCE(MAX(CASE WHEN ${userProgress.userId} = ${userId} THEN ${userProgress.status} END), 'not_started')`
            : sql<null>`NULL`,
        })
        .from(challenge)
        .innerJoin(challengeTheme, eq(challenge.theme, challengeTheme.slug))
        .innerJoin(challengeType, eq(challenge.type, challengeType.slug))
        .leftJoin(userProgress, userProgressConditions)
        .where(and(...filters))
        .groupBy(challenge.id, challengeTheme.name, challengeType.name);

      return {
        challenges,
        count: challenges.length,
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const challenge = await getChallengeBySlug(input.slug);
      return { challenge };
    }),

  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        theme: z.string().min(1),
        difficulty: z.enum(["easy", "medium", "hard"]),
        estimatedTime: z.number().int().positive(),
        initialSituation: z.string().min(1),
        objective: z.string().min(1),
        ofTheWeek: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if theme exists
      const themeExists = await getThemeBySlug(input.theme);

      if (!themeExists) {
        throw new Error(`Theme with slug "${input.theme}" does not exist`);
      }

      // Check if a challenge with this slug already exists
      const existing = await getChallengeBySlug(input.slug);

      if (existing) {
        // Upsert: Update existing challenge
        const [updated] = await ctx.db
          .update(challenge)
          .set({
            title: input.title,
            description: input.description,
            theme: input.theme,
            difficulty: input.difficulty,
            estimatedTime: input.estimatedTime,
            initialSituation: input.initialSituation,
            objective: input.objective,
            ofTheWeek: input.ofTheWeek,
          })
          .where(eq(challenge.slug, input.slug))
          .returning();

        return {
          success: true,
          challenge: updated,
          action: "updated" as const,
        };
      }

      // Insert new challenge
      const [created] = await ctx.db
        .insert(challenge)
        .values({
          slug: input.slug,
          title: input.title,
          description: input.description,
          theme: input.theme,
          difficulty: input.difficulty,
          estimatedTime: input.estimatedTime,
          initialSituation: input.initialSituation,
          objective: input.objective,
          ofTheWeek: input.ofTheWeek,
        })
        .returning();

      return {
        success: true,
        challenge: created,
        action: "created" as const,
      };
    }),

  delete: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if challenge exists
      const existing = await getChallengeBySlug(input.slug);

      if (!existing) {
        throw new Error(`Challenge with slug "${input.slug}" does not exist`);
      }

      // Delete the challenge (cascading will handle related records)
      await ctx.db.delete(challenge).where(eq(challenge.slug, input.slug));

      return {
        success: true,
        message: `Challenge "${input.slug}" has been deleted`,
      };
    }),

  /**
   * Get objectives for a challenge by its slug.
   * Returns the list of validation objectives that must be completed.
   * Used by frontend to display the "todo list" checklist.
   */
  getObjectives: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      // First get the challenge to ensure it exists and get its ID
      const challengeData = await getChallengeBySlug(input.slug);

      if (!challengeData) {
        return { objectives: [] };
      }

      // Fetch objectives ordered by displayOrder
      const objectives = await ctx.db
        .select({
          id: challengeObjective.id,
          objectiveKey: challengeObjective.objectiveKey,
          title: challengeObjective.title,
          description: challengeObjective.description,
          category: challengeObjective.category,
          displayOrder: challengeObjective.displayOrder,
        })
        .from(challengeObjective)
        .where(eq(challengeObjective.challengeId, challengeData.id))
        .orderBy(challengeObjective.displayOrder);

      return { objectives };
    }),
});
