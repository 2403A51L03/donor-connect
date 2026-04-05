import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListNotificationsQueryParams,
  MarkNotificationReadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", async (req, res) => {
  try {
    const query = ListNotificationsQueryParams.parse(req.query);
    let conditions = [eq(notificationsTable.donorId, query.donorId)];

    if (query.unread === true) {
      conditions.push(eq(notificationsTable.isRead, false));
    }

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(and(...conditions))
      .orderBy(notificationsTable.createdAt);

    res.json(
      notifications.map((n) => ({
        id: n.id,
        donorId: n.donorId,
        bloodRequestId: n.bloodRequestId,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = MarkNotificationReadParams.parse({ id: parseInt(req.params.id) });

    const [notification] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();

    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json({
      id: notification.id,
      donorId: notification.donorId,
      bloodRequestId: notification.bloodRequestId,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
