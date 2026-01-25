import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Demo conversion tracking table
 *
 * Stores long-term stats for demo sessions that may convert to signups.
 * The actual session data is stored in Redis (ephemeral), but we persist
 * key events to PostgreSQL for analytics.
 */
export const demoConversion = pgTable(
  "demo_conversion",
  {
    // The demo token serves as the primary key
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // When the demo was completed (nginx pod running)
    completedAt: timestamp("completed_at"),
    // When the user signed up (converted)
    convertedAt: timestamp("converted_at"),
    // User ID if the demo converted to a signup
    convertedUserId: text("converted_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // UTM tracking parameters
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
  },
  (table) => [
    // Index for finding converted users
    index("demo_conversion_user_id_idx").on(table.convertedUserId),
    // Index for conversion analytics by date
    index("demo_conversion_created_at_idx").on(table.createdAt),
    // Index for UTM campaign analysis
    index("demo_conversion_utm_source_idx").on(table.utmSource),
  ],
);

/**
 * Type for inserting a new demo conversion record
 */
export type NewDemoConversion = typeof demoConversion.$inferInsert;

/**
 * Type for a demo conversion record from the database
 */
export type DemoConversionRecord = typeof demoConversion.$inferSelect;
