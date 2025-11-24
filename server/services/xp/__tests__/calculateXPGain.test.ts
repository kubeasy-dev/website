/**
 * Tests for calculateXPGain function
 *
 * Tests XP calculation based on difficulty, first challenge bonus, and streak bonus
 */

import { describe, expect, it } from "vitest";
import { calculateXPGain } from "../calculateXPGain";

describe("calculateXPGain", () => {
  describe("Base XP by difficulty", () => {
    it("should return 50 XP for easy challenge with no bonuses", () => {
      const result = calculateXPGain({
        difficulty: "easy",
        isFirstChallenge: false,
        currentStreak: 0,
      });

      expect(result.baseXP).toBe(50);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(0);
      expect(result.total).toBe(50);
    });

    it("should return 100 XP for medium challenge with no bonuses", () => {
      const result = calculateXPGain({
        difficulty: "medium",
        isFirstChallenge: false,
        currentStreak: 0,
      });

      expect(result.baseXP).toBe(100);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(0);
      expect(result.total).toBe(100);
    });

    it("should return 200 XP for hard challenge with no bonuses", () => {
      const result = calculateXPGain({
        difficulty: "hard",
        isFirstChallenge: false,
        currentStreak: 0,
      });

      expect(result.baseXP).toBe(200);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(0);
      expect(result.total).toBe(200);
    });
  });

  describe("First challenge bonus", () => {
    it("should add 50 XP bonus for first easy challenge", () => {
      const result = calculateXPGain({
        difficulty: "easy",
        isFirstChallenge: true,
        currentStreak: 0,
      });

      expect(result.baseXP).toBe(50);
      expect(result.firstChallengeBonus).toBe(50);
      expect(result.streakBonus).toBe(0);
      expect(result.total).toBe(100); // 50 base + 50 bonus
    });

    it("should add 50 XP bonus for first medium challenge", () => {
      const result = calculateXPGain({
        difficulty: "medium",
        isFirstChallenge: true,
        currentStreak: 0,
      });

      expect(result.baseXP).toBe(100);
      expect(result.firstChallengeBonus).toBe(50);
      expect(result.streakBonus).toBe(0);
      expect(result.total).toBe(150); // 100 base + 50 bonus
    });

    it("should add 50 XP bonus for first hard challenge", () => {
      const result = calculateXPGain({
        difficulty: "hard",
        isFirstChallenge: true,
        currentStreak: 0,
      });

      expect(result.baseXP).toBe(200);
      expect(result.firstChallengeBonus).toBe(50);
      expect(result.streakBonus).toBe(0);
      expect(result.total).toBe(250); // 200 base + 50 bonus
    });
  });

  describe("Streak bonus", () => {
    it("should add 10 XP per day for 1-day streak", () => {
      const result = calculateXPGain({
        difficulty: "easy",
        isFirstChallenge: false,
        currentStreak: 1,
      });

      expect(result.baseXP).toBe(50);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(10); // 1 day * 10 XP
      expect(result.total).toBe(60); // 50 base + 10 streak
    });

    it("should add 50 XP for 5-day streak", () => {
      const result = calculateXPGain({
        difficulty: "medium",
        isFirstChallenge: false,
        currentStreak: 5,
      });

      expect(result.baseXP).toBe(100);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(50); // 5 days * 10 XP
      expect(result.total).toBe(150); // 100 base + 50 streak
    });

    it("should add 100 XP for 10-day streak", () => {
      const result = calculateXPGain({
        difficulty: "hard",
        isFirstChallenge: false,
        currentStreak: 10,
      });

      expect(result.baseXP).toBe(200);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(100); // 10 days * 10 XP
      expect(result.total).toBe(300); // 200 base + 100 streak
    });

    it("should add 300 XP for 30-day streak", () => {
      const result = calculateXPGain({
        difficulty: "medium",
        isFirstChallenge: false,
        currentStreak: 30,
      });

      expect(result.baseXP).toBe(100);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(300); // 30 days * 10 XP
      expect(result.total).toBe(400); // 100 base + 300 streak
    });
  });

  describe("Combined bonuses", () => {
    it("should combine first challenge bonus and streak bonus", () => {
      const result = calculateXPGain({
        difficulty: "easy",
        isFirstChallenge: true,
        currentStreak: 3,
      });

      expect(result.baseXP).toBe(50);
      expect(result.firstChallengeBonus).toBe(50);
      expect(result.streakBonus).toBe(30); // 3 days * 10 XP
      expect(result.total).toBe(130); // 50 base + 50 first + 30 streak
    });

    it("should combine all bonuses for medium difficulty", () => {
      const result = calculateXPGain({
        difficulty: "medium",
        isFirstChallenge: true,
        currentStreak: 7,
      });

      expect(result.baseXP).toBe(100);
      expect(result.firstChallengeBonus).toBe(50);
      expect(result.streakBonus).toBe(70); // 7 days * 10 XP
      expect(result.total).toBe(220); // 100 base + 50 first + 70 streak
    });

    it("should combine all bonuses for hard difficulty with long streak", () => {
      const result = calculateXPGain({
        difficulty: "hard",
        isFirstChallenge: true,
        currentStreak: 15,
      });

      expect(result.baseXP).toBe(200);
      expect(result.firstChallengeBonus).toBe(50);
      expect(result.streakBonus).toBe(150); // 15 days * 10 XP
      expect(result.total).toBe(400); // 200 base + 50 first + 150 streak
    });
  });

  describe("Edge cases", () => {
    it("should handle zero streak correctly", () => {
      const result = calculateXPGain({
        difficulty: "medium",
        isFirstChallenge: false,
        currentStreak: 0,
      });

      expect(result.streakBonus).toBe(0);
      expect(result.total).toBe(100); // Base only
    });

    it("should work with very long streak (90 days)", () => {
      const result = calculateXPGain({
        difficulty: "hard",
        isFirstChallenge: false,
        currentStreak: 90,
      });

      expect(result.baseXP).toBe(200);
      expect(result.firstChallengeBonus).toBe(0);
      expect(result.streakBonus).toBe(900); // 90 days * 10 XP
      expect(result.total).toBe(1100); // 200 base + 900 streak
    });

    it("should handle maximum possible XP (hard + first + 90-day streak)", () => {
      const result = calculateXPGain({
        difficulty: "hard",
        isFirstChallenge: true,
        currentStreak: 90,
      });

      expect(result.baseXP).toBe(200);
      expect(result.firstChallengeBonus).toBe(50);
      expect(result.streakBonus).toBe(900); // 90 days * 10 XP
      expect(result.total).toBe(1150); // 200 + 50 + 900
    });

    it("should handle minimum possible XP (easy + no bonuses)", () => {
      const result = calculateXPGain({
        difficulty: "easy",
        isFirstChallenge: false,
        currentStreak: 0,
      });

      expect(result.total).toBe(50); // Minimum XP
    });
  });
});
