import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const futureLettersTable = pgTable("future_letters", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  unlockDate: text("unlock_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFutureLetterSchema = createInsertSchema(futureLettersTable).omit({ id: true, createdAt: true });
export type InsertFutureLetter = z.infer<typeof insertFutureLetterSchema>;
export type FutureLetter = typeof futureLettersTable.$inferSelect;
