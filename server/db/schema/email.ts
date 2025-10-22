import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Email categories for managing user email preferences
 * Each category can be linked to a Resend audience
 */
export const emailCategory = pgTable("email_category", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  audienceId: uuid("audience_id"), // Resend audience ID
  forceSubscription: boolean("force_subscription").default(false).notNull(), // True for transactional emails
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * User email preferences
 * Links users to email categories and tracks their subscription status
 */
export const userEmailPreference = pgTable(
  "user_email_preference",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => emailCategory.id, { onDelete: "cascade" }),
    subscribed: boolean("subscribed").default(true).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    contactId: uuid("contact_id"), // Resend contact ID
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.categoryId] }),
  }),
);
