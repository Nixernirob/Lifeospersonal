import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const friendsTable = pgTable("friends", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department"),
  birthday: text("birthday"),
  firstMet: text("first_met"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFriendSchema = createInsertSchema(friendsTable).omit({ id: true, createdAt: true });
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type Friend = typeof friendsTable.$inferSelect;
