import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bucketListTable = pgTable("bucket_list", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  checked: boolean("checked").notNull().default(false),
  targetDate: text("target_date"),
  completedAt: text("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBucketListItemSchema = createInsertSchema(bucketListTable).omit({ id: true, createdAt: true });
export type InsertBucketListItem = z.infer<typeof insertBucketListItemSchema>;
export type BucketListItem = typeof bucketListTable.$inferSelect;
