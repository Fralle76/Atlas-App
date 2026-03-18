import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transitionsTable = pgTable("transitions", {
  id: serial("id").primaryKey(),
  childName: text("child_name").notNull(),
  fromActivity: text("from_activity").notNull(),
  toActivity: text("to_activity").notNull(),
  warningMinutes: integer("warning_minutes").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransitionSchema = createInsertSchema(transitionsTable).omit({ id: true, createdAt: true });
export type InsertTransition = z.infer<typeof insertTransitionSchema>;
export type Transition = typeof transitionsTable.$inferSelect;
