import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { donorsTable } from "./donors";
import { bloodRequestsTable } from "./blood_requests";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull().references(() => donorsTable.id),
  bloodRequestId: integer("blood_request_id").notNull().references(() => bloodRequestsTable.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
