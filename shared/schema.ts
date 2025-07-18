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
  totalCount: integer("total_count").default(0).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
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
