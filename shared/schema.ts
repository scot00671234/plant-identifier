import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const plantIdentifications = pgTable("plant_identifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  scientificName: text("scientific_name").notNull(),
  commonName: text("common_name"),
  confidence: integer("confidence").notNull(), // percentage as integer
  family: text("family"),
  description: text("description"),
  origin: text("origin"),
  type: text("type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  dailyCount: integer("daily_count").default(0).notNull(),
  lastResetDate: text("last_reset_date").notNull(), // YYYY-MM-DD format
  isPremium: boolean("is_premium").default(false).notNull(),
});

export const insertPlantIdentificationSchema = createInsertSchema(plantIdentifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserUsageSchema = createInsertSchema(userUsage).omit({
  id: true,
});

export type InsertPlantIdentification = z.infer<typeof insertPlantIdentificationSchema>;
export type PlantIdentification = typeof plantIdentifications.$inferSelect;
export type InsertUserUsage = z.infer<typeof insertUserUsageSchema>;
export type UserUsage = typeof userUsage.$inferSelect;
