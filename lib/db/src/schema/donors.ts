import { pgTable, serial, text, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donorsTable = pgTable("donors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bloodType: text("blood_type").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  city: text("city").notNull(),
  address: text("address"),
  isAvailable: boolean("is_available").notNull().default(true),
  lastDonationDate: date("last_donation_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDonorSchema = createInsertSchema(donorsTable).omit({ id: true, createdAt: true });
export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donorsTable.$inferSelect;
