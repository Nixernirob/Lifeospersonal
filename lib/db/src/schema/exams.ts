import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subjectId: integer("subject_id"),
  subjectName: text("subject_name"),
  examDate: text("exam_date").notNull(),
  category: text("category").notNull().default("midterm"),
  semester: integer("semester"),
  grade: text("grade"),
  gradePoint: real("grade_point"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExamSchema = createInsertSchema(examsTable).omit({ id: true, createdAt: true });
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof examsTable.$inferSelect;
