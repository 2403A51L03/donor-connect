import { Router, type IRouter } from "express";
import { db, donorsTable, notificationsTable, bloodRequestsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { ZodError } from "zod/v4";
import {
  CreateDonorBody,
  UpdateDonorBody,
  ListDonorsQueryParams,
  GetDonorParams,
  UpdateDonorParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/donors", async (req, res) => {
  try {
    const query = ListDonorsQueryParams.parse(req.query);
    let conditions = [];

    if (query.bloodType) conditions.push(eq(donorsTable.bloodType, query.bloodType));
    if (query.city) conditions.push(eq(donorsTable.city, query.city));
    if (query.available !== undefined) conditions.push(eq(donorsTable.isAvailable, query.available));

    const donors = await db
      .select()
      .from(donorsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(donorsTable.createdAt);

    return res.json(
      donors.map((d) => ({
        id: d.id,
        name: d.name,
        bloodType: d.bloodType,
        phone: d.phone,
        email: d.email,
        city: d.city,
        address: d.address ?? undefined,
        isAvailable: d.isAvailable,
        lastDonationDate: d.lastDonationDate ?? null,
        createdAt: d.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues });
    }

    const error = err instanceof Error ? err : new Error(String(err));
    const cause = (error as any).cause;
    return res.status(500).json({
      error: error.message,
      cause: cause ? String(cause) : undefined,
    });
  }
});

router.post("/donors", async (req, res) => {
  try {
    const body = CreateDonorBody.parse(req.body);
    const [donor] = await db
      .insert(donorsTable)
      .values({
        name: body.name,
        bloodType: body.bloodType,
        phone: body.phone,
        email: body.email,
        city: body.city,
        address: body.address ?? null,
        lastDonationDate: body.lastDonationDate ?? null,
        isAvailable: true,
      })
      .returning();

    const matchingRequests = await db
      .select()
      .from(bloodRequestsTable)
      .where(
        and(
          eq(bloodRequestsTable.bloodType, body.bloodType),
          eq(bloodRequestsTable.status, "open")
        )
      );

    if (matchingRequests.length > 0) {
      const notifications = matchingRequests.map((req) => ({
        donorId: donor.id,
        bloodRequestId: req.id,
        message: `Urgent blood request for ${req.bloodType} at ${req.hospital}, ${req.city}. ${req.unitsNeeded} unit(s) needed.`,
        isRead: false,
      }));
      await db.insert(notificationsTable).values(notifications);
    }

    res.status(201).json({
      id: donor.id,
      name: donor.name,
      bloodType: donor.bloodType,
      phone: donor.phone,
      email: donor.email,
      city: donor.city,
      address: donor.address ?? undefined,
      isAvailable: donor.isAvailable,
      lastDonationDate: donor.lastDonationDate ?? null,
      createdAt: donor.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.get("/donors/:id", async (req, res) => {
  try {
    const { id } = GetDonorParams.parse({ id: parseInt(req.params.id) });
    const [donor] = await db.select().from(donorsTable).where(eq(donorsTable.id, id));

    if (!donor) {
      res.status(404).json({ error: "Donor not found" });
      return;
    }

    res.json({
      id: donor.id,
      name: donor.name,
      bloodType: donor.bloodType,
      phone: donor.phone,
      email: donor.email,
      city: donor.city,
      address: donor.address ?? undefined,
      isAvailable: donor.isAvailable,
      lastDonationDate: donor.lastDonationDate ?? null,
      createdAt: donor.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.put("/donors/:id", async (req, res) => {
  try {
    const { id } = UpdateDonorParams.parse({ id: parseInt(req.params.id) });
    const body = UpdateDonorBody.parse(req.body);

    const updates: Partial<typeof donorsTable.$inferInsert> = {};
    if (body.isAvailable !== undefined) updates.isAvailable = body.isAvailable;
    if (body.lastDonationDate !== undefined) updates.lastDonationDate = body.lastDonationDate ?? null;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.city !== undefined) updates.city = body.city;
    if (body.address !== undefined) updates.address = body.address ?? null;

    const [donor] = await db
      .update(donorsTable)
      .set(updates)
      .where(eq(donorsTable.id, id))
      .returning();

    if (!donor) {
      res.status(404).json({ error: "Donor not found" });
      return;
    }

    res.json({
      id: donor.id,
      name: donor.name,
      bloodType: donor.bloodType,
      phone: donor.phone,
      email: donor.email,
      city: donor.city,
      address: donor.address ?? undefined,
      isAvailable: donor.isAvailable,
      lastDonationDate: donor.lastDonationDate ?? null,
      createdAt: donor.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [totalDonors] = await db.select({ count: sql<number>`count(*)::int` }).from(donorsTable);
    const [availableDonors] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(donorsTable)
      .where(eq(donorsTable.isAvailable, true));

    const [totalRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bloodRequestsTable);
    const [openRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bloodRequestsTable)
      .where(eq(bloodRequestsTable.status, "open"));
    const [criticalRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bloodRequestsTable)
      .where(and(eq(bloodRequestsTable.urgency, "critical"), eq(bloodRequestsTable.status, "open")));

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const bloodTypeStats = await Promise.all(
      bloodTypes.map(async (bt) => {
        const [dc] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(donorsTable)
          .where(eq(donorsTable.bloodType, bt));
        const [rc] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(bloodRequestsTable)
          .where(and(eq(bloodRequestsTable.bloodType, bt), eq(bloodRequestsTable.status, "open")));
        return { bloodType: bt, donorCount: dc.count, requestCount: rc.count };
      })
    );

    res.json({
      totalDonors: totalDonors.count,
      availableDonors: availableDonors.count,
      totalRequests: totalRequests.count,
      openRequests: openRequests.count,
      criticalRequests: criticalRequests.count,
      bloodTypeStats,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
