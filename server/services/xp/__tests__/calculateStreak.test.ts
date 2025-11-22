/**
 * Tests for calculateStreak function
 *
 * Tests the streak calculation logic based on daily_streak transactions
 */

import { nanoid } from "nanoid";
import { beforeEach, describe, expect, it } from "vitest";
import db from "@/server/db";
import { user, userXpTransaction } from "@/server/db/schema";
import { calculateStreak } from "../calculateStreak";

// Helper to create test user
async function createTestUser(id = nanoid()) {
  await db.insert(user).values({
    id,
    name: "Test User",
    email: `test-${id}@example.com`,
    emailVerified: true,
  });
  return id;
}

describe("calculateStreak", () => {
  beforeEach(async () => {
    // Clean up transactions first (due to foreign key)
    await db.delete(userXpTransaction);
    await db.delete(user);
  });

  it("should return 0 for user with no daily_streak transactions", async () => {
    const userId = await createTestUser();

    const streak = await calculateStreak(userId);

    expect(streak).toBe(0);
  });

  it("should return 1 for user with only today's streak", async () => {
    const userId = await createTestUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.insert(userXpTransaction).values({
      userId,
      action: "daily_streak",
      xpAmount: 10,
      challengeId: null,
      description: "1 day streak",
      createdAt: today,
    });

    const streak = await calculateStreak(userId);

    expect(streak).toBe(1);
  });

  it("should calculate consecutive days correctly", async () => {
    const userId = await createTestUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Create 3-day streak
    await db.insert(userXpTransaction).values([
      {
        userId,
        action: "daily_streak",
        xpAmount: 10,
        challengeId: null,
        description: "Day 1",
        createdAt: twoDaysAgo,
      },
      {
        userId,
        action: "daily_streak",
        xpAmount: 20,
        challengeId: null,
        description: "Day 2",
        createdAt: yesterday,
      },
      {
        userId,
        action: "daily_streak",
        xpAmount: 30,
        challengeId: null,
        description: "Day 3",
        createdAt: today,
      },
    ]);

    const streak = await calculateStreak(userId);

    expect(streak).toBe(3);
  });

  it("should break streak on missing day", async () => {
    const userId = await createTestUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Gap in streak (missing 2 days)
    await db.insert(userXpTransaction).values([
      {
        userId,
        action: "daily_streak",
        xpAmount: 10,
        challengeId: null,
        description: "Old streak",
        createdAt: threeDaysAgo,
      },
      {
        userId,
        action: "daily_streak",
        xpAmount: 10,
        challengeId: null,
        description: "New streak",
        createdAt: today,
      },
    ]);

    const streak = await calculateStreak(userId);

    // Should only count today (new streak started)
    expect(streak).toBe(1);
  });

  it("should ignore transactions beyond 90-day window", async () => {
    const userId = await createTestUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days91Ago = new Date(today);
    days91Ago.setDate(days91Ago.getDate() - 91);

    await db.insert(userXpTransaction).values({
      userId,
      action: "daily_streak",
      xpAmount: 10,
      challengeId: null,
      description: "Too old",
      createdAt: days91Ago,
    });

    const streak = await calculateStreak(userId);

    // Should ignore old transaction
    expect(streak).toBe(0);
  });

  it("should handle streak including yesterday but not today", async () => {
    const userId = await createTestUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Streak up to yesterday, but not completed today yet
    await db.insert(userXpTransaction).values([
      {
        userId,
        action: "daily_streak",
        xpAmount: 10,
        challengeId: null,
        description: "Day 1",
        createdAt: twoDaysAgo,
      },
      {
        userId,
        action: "daily_streak",
        xpAmount: 20,
        challengeId: null,
        description: "Day 2",
        createdAt: yesterday,
      },
    ]);

    const streak = await calculateStreak(userId);

    // Should count up to yesterday (active streak)
    expect(streak).toBe(2);
  });

  it("should ignore non-daily_streak transactions", async () => {
    const userId = await createTestUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.insert(userXpTransaction).values([
      {
        userId,
        action: "challenge_completed",
        xpAmount: 50,
        challengeId: null,
        description: "Challenge XP",
        createdAt: today,
      },
      {
        userId,
        action: "first_challenge",
        xpAmount: 50,
        challengeId: null,
        description: "First challenge bonus",
        createdAt: today,
      },
      {
        userId,
        action: "daily_streak",
        xpAmount: 10,
        challengeId: null,
        description: "Streak",
        createdAt: today,
      },
    ]);

    const streak = await calculateStreak(userId);

    // Should only count the daily_streak transaction
    expect(streak).toBe(1);
  });

  it("should handle multiple transactions on same day (count as 1 day)", async () => {
    const userId = await createTestUser();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Multiple completions on same day
    await db.insert(userXpTransaction).values([
      {
        userId,
        action: "daily_streak",
        xpAmount: 10,
        challengeId: null,
        description: "First completion",
        createdAt: today,
      },
      {
        userId,
        action: "daily_streak",
        xpAmount: 10,
        challengeId: null,
        description: "Second completion",
        createdAt: new Date(today.getTime() + 1000 * 60 * 60), // 1 hour later
      },
    ]);

    const streak = await calculateStreak(userId);

    // Should count as 1 day (same calendar day)
    expect(streak).toBe(1);
  });
});
