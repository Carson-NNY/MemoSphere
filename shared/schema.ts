import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Journal entries
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  isPublic: boolean("is_public").default(false).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentimentAnalysis: json("sentiment_analysis"),
});

export const insertEntrySchema = createInsertSchema(entries).pick({
  userId: true,
  title: true,
  content: true,
  mood: true,
  isPublic: true,
  imageUrl: true,
});

// Anonymous entries (stored in browser localStorage)
export const anonymousEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  mood: z.string().optional(),
  createdAt: z.string(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  user: one(users, { fields: [entries.userId], references: [users.id] }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type AnonymousEntry = z.infer<typeof anonymousEntrySchema>;
