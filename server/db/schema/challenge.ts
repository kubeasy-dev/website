import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const challengeTheme = pgTable("challenge_theme", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const challengeDifficultyEnum = pgEnum("challenge_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const challenge = pgTable(
  "challenge",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    theme: text("theme")
      .notNull()
      .references(() => challengeTheme.slug, { onDelete: "cascade" }),
    difficulty: challengeDifficultyEnum("difficulty").notNull(),
    estimatedTime: integer("estimated_time").notNull(),
    initialSituation: text("initial_situation").notNull(),
    objective: text("objective").notNull(),
    ofTheWeek: boolean("of_the_week").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index pour le filtre par difficulté
    index("challenge_difficulty_idx").on(table.difficulty),
    // Index pour le filtre par thème
    index("challenge_theme_idx").on(table.theme),
    // Index composite pour filtres combinés (thème + difficulté)
    index("challenge_theme_difficulty_idx").on(table.theme, table.difficulty),
    // Index pour la recherche par titre avec ILIKE
    index("challenge_title_idx").on(table.title),
    // Index pour le tri par date de création (utilisé dans getLatest)
    index("challenge_created_at_idx").on(table.createdAt),
  ],
);

export const challengeStatusEnum = pgEnum("challenge_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const userProgress = pgTable(
  "user_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    challengeId: integer("challenge_id")
      .notNull()
      .references(() => challenge.id, { onDelete: "cascade" }),
    status: challengeStatusEnum("status").notNull().default("not_started"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index composite critique pour la requête des challenges complétés par utilisateur
    // Utilisé dans la requête: WHERE userId = ? AND status = 'completed'
    index("user_progress_user_status_challenge_idx").on(
      table.userId,
      table.status,
      table.challengeId,
    ),
    // Index composite pour le LEFT JOIN et le COUNT dans la requête principale
    // Utilisé pour: LEFT JOIN userProgress ON challenge.id = userProgress.challengeId
    index("user_progress_challenge_status_idx").on(
      table.challengeId,
      table.status,
    ),
    // Unique constraint: one completion per user per day
    // Prevents race conditions when marking challenges as completed
    // Only applies when status is 'completed' and completedAt is not null
    uniqueIndex("user_progress_user_daily_completion_idx")
      .on(table.userId, sql`date_trunc('day', ${table.completedAt})`)
      .where(
        sql`${table.status} = 'completed' AND ${table.completedAt} IS NOT NULL`,
      ),
  ],
);

export const userSubmission = pgTable("user_submission", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenge.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  staticValidation: boolean("static_validation").notNull().default(false),
  dynamicValidation: boolean("dynamic_validation").notNull().default(false),
  payload: json("payload").notNull(),
});

export const xpActionEnum = pgEnum("xp_action", [
  "challenge_completed",
  "daily_streak",
  "first_challenge",
  "milestone_reached",
  "bonus",
]);

// Table to store user's total XP
export const userXp = pgTable(
  "user_xp",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    totalXp: integer("total_xp").notNull().default(0),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index pour les requêtes de classement
    index("user_xp_total_xp_idx").on(table.totalXp),
  ],
);

// Table to store XP transaction history
export const userXpTransaction = pgTable(
  "user_xp_transaction",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: xpActionEnum("action").notNull(),
    xpAmount: integer("xp_amount").notNull(),
    challengeId: integer("challenge_id").references(() => challenge.id, {
      onDelete: "set null",
    }),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index pour récupérer l'historique d'un utilisateur
    index("user_xp_transaction_user_id_idx").on(table.userId),
    // Index composite pour les requêtes filtrées par action
    index("user_xp_transaction_user_action_idx").on(table.userId, table.action),
  ],
);
