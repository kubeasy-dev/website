/**
 * Tests for calculateLevel function
 *
 * Tests the level/rank calculation logic based on total XP
 */

import { nanoid } from "nanoid";
import { beforeEach, describe, expect, it } from "vitest";
import db from "@/server/db";
import { user, userXpTransaction } from "@/server/db/schema";
import { calculateLevel } from "../calculateLevel";

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

describe("calculateLevel", () => {
  beforeEach(async () => {
    // Clean up transactions first (due to foreign key)
    await db.delete(userXpTransaction);
    await db.delete(user);
  });

  it("should return Novice rank for user with 0 XP", async () => {
    const userId = await createTestUser();

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Novice");
    expect(rankInfo.minXp).toBe(0);
    expect(rankInfo.nextRankXp).toBe(300);
    expect(rankInfo.progress).toBe(0);
  });

  it("should return Novice rank for user with 150 XP (50% progress)", async () => {
    const userId = await createTestUser();

    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 150,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Novice");
    expect(rankInfo.minXp).toBe(0);
    expect(rankInfo.nextRankXp).toBe(300);
    expect(rankInfo.progress).toBe(50); // 150/300 = 50%
  });

  it("should return Beginner rank for user with exactly 300 XP", async () => {
    const userId = await createTestUser();

    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 300,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Beginner");
    expect(rankInfo.minXp).toBe(300);
    expect(rankInfo.nextRankXp).toBe(1200);
    expect(rankInfo.progress).toBe(0); // Just reached this rank
  });

  it("should return Beginner rank for user with 750 XP (50% progress)", async () => {
    const userId = await createTestUser();

    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 750,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Beginner");
    expect(rankInfo.minXp).toBe(300);
    expect(rankInfo.nextRankXp).toBe(1200);
    // Progress from 300 to 1200: (750-300)/(1200-300) = 450/900 = 50%
    expect(rankInfo.progress).toBe(50);
  });

  it("should return Advanced rank for user with 2000 XP", async () => {
    const userId = await createTestUser();

    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 2000,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Advanced");
    expect(rankInfo.minXp).toBe(1200);
    expect(rankInfo.nextRankXp).toBe(3500);
    // Progress from 1200 to 3500: (2000-1200)/(3500-1200) = 800/2300 ≈ 34.78% → rounds to 35%
    expect(rankInfo.progress).toBe(35);
  });

  it("should return Expert rank for user with 5000 XP", async () => {
    const userId = await createTestUser();

    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 5000,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Expert");
    expect(rankInfo.minXp).toBe(3500);
    expect(rankInfo.nextRankXp).toBe(7000);
    // Progress from 3500 to 7000: (5000-3500)/(7000-3500) = 1500/3500 ≈ 42.86% → rounds to 43%
    expect(rankInfo.progress).toBe(43);
  });

  it("should return Master rank for user with 10000 XP", async () => {
    const userId = await createTestUser();

    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 10000,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Master");
    expect(rankInfo.minXp).toBe(7000);
    expect(rankInfo.nextRankXp).toBe(12000);
    // Progress from 7000 to 12000: (10000-7000)/(12000-7000) = 3000/5000 = 60%
    expect(rankInfo.progress).toBe(60);
  });

  it("should return Legend rank for user with 12000+ XP (max rank)", async () => {
    const userId = await createTestUser();

    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 15000,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Legend");
    expect(rankInfo.minXp).toBe(12000);
    expect(rankInfo.nextRankXp).toBeNull(); // No next rank (max level)
    expect(rankInfo.progress).toBe(100); // Max progress
  });

  it("should sum multiple transactions correctly", async () => {
    const userId = await createTestUser();

    // Add multiple transactions totaling 3500 XP (exactly Expert threshold)
    await db.insert(userXpTransaction).values([
      {
        userId,
        action: "challenge_completed",
        xpAmount: 1000,
        challengeId: null,
        description: "Challenge 1",
        createdAt: new Date(),
      },
      {
        userId,
        action: "daily_streak",
        xpAmount: 500,
        challengeId: null,
        description: "Streak bonus",
        createdAt: new Date(),
      },
      {
        userId,
        action: "challenge_completed",
        xpAmount: 2000,
        challengeId: null,
        description: "Challenge 2",
        createdAt: new Date(),
      },
    ]);

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Expert");
    expect(rankInfo.minXp).toBe(3500);
    expect(rankInfo.nextRankXp).toBe(7000);
    expect(rankInfo.progress).toBe(0); // Exactly at threshold
  });

  it("should handle edge case at exact rank thresholds", async () => {
    const userId = await createTestUser();

    // Exactly at Beginner threshold (300 XP)
    await db.insert(userXpTransaction).values({
      userId,
      action: "challenge_completed",
      xpAmount: 300,
      challengeId: null,
      description: "Test XP",
      createdAt: new Date(),
    });

    const rankInfo = await calculateLevel(userId);

    expect(rankInfo.name).toBe("Beginner");
    expect(rankInfo.progress).toBe(0);
  });
});
