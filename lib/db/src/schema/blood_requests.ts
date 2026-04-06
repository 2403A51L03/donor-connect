import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bloodRequestsTable = pgTable("blood_requests", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  bloodType: text("blood_type").notNull(),
  unitsNeeded: integer("units_needed").notNull(),
  hospital: text("hospital").notNull(),
  city: text("city").notNull(),
  urgency: text("urgency").notNull().default("normal"),
  status: text("status").notNull().default("open"), // open, fulfilled, cancelled
  contactPhone: text("contact_phone").notNull(),
  notes: text("notes"),
  requestedByDonorId: integer("requested_by_donor_id"),
  fulfilledByDonorId: integer("fulfilled_by_donor_id"), // Donor who fulfilled this request
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBloodRequestSchema = createInsertSchema(bloodRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBloodRequest = z.infer<typeof insertBloodRequestSchema>;
export type BloodRequest = typeof bloodRequestsTable.$inferSelect;
