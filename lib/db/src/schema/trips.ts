import { pgTable, serial, text, numeric, integer, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  budget: numeric("budget", { precision: 10, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  budgetStatus: text("budget_status").notNull(),
  plan: jsonb("plan").notNull(),
  request: jsonb("request").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Owner of the trip (users.id). Nullable so trips saved before this column
  // existed keep working; they simply don't belong to anybody.
  userId: varchar("user_id"),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({ id: true, createdAt: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof tripsTable.$inferSelect;