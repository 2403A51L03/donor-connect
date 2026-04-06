import { Router, type IRouter } from "express";
import { db, bloodRequestsTable, donorsTable, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateBloodRequestBody,
  UpdateBloodRequestBody,
  ListBloodRequestsQueryParams,
  GetBloodRequestParams,
  UpdateBloodRequestParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/blood-requests", async (req, res) => {
  try {
    const query = ListBloodRequestsQueryParams.parse(req.query);
    let conditions = [];

    if (query.bloodType) conditions.push(eq(bloodRequestsTable.bloodType, query.bloodType));
    if (query.urgency) conditions.push(eq(bloodRequestsTable.urgency, query.urgency));
    if (query.status) conditions.push(eq(bloodRequestsTable.status, query.status));

    const requests = await db
      .select()
      .from(bloodRequestsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(bloodRequestsTable.createdAt);

    res.json(
      requests.map((r) => ({
        id: r.id,
        patientName: r.patientName,
        bloodType: r.bloodType,
        unitsNeeded: r.unitsNeeded,
        hospital: r.hospital,
        city: r.city,
        urgency: r.urgency,
        status: r.status,
        contactPhone: r.contactPhone,
        notes: r.notes ?? null,
        requestedByDonorId: r.requestedByDonorId ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }))
    );
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/blood-requests", async (req, res) => {
  try {
    const body = CreateBloodRequestBody.parse(req.body);
    const donorIdHeader = req.headers["x-donor-id"];
    const requestedByDonorId = donorIdHeader ? parseInt(String(donorIdHeader), 10) || null : null;

    // Verify user is authenticated (has a donor account)
    if (!requestedByDonorId) {
      res.status(401).json({ error: "Authentication required. Please log in to create a blood request." });
      return;
    }

    const [request] = await db
      .insert(bloodRequestsTable)
      .values({
        patientName: body.patientName,
        bloodType: body.bloodType,
        unitsNeeded: body.unitsNeeded,
        hospital: body.hospital,
        city: body.city,
        urgency: body.urgency,
        contactPhone: body.contactPhone,
        notes: body.notes ?? null,
        status: "open",
        requestedByDonorId,
      })
      .returning();

    const matchingDonors = await db
      .select()
      .from(donorsTable)
      .where(
        and(
          eq(donorsTable.bloodType, body.bloodType),
          eq(donorsTable.isAvailable, true)
        )
      );

    if (matchingDonors.length > 0) {
      const notifications = matchingDonors.map((donor) => ({
        donorId: donor.id,
        bloodRequestId: request.id,
        message: `${body.urgency.toUpperCase()} blood request for ${body.bloodType} at ${body.hospital}, ${body.city}. ${body.unitsNeeded} unit(s) needed. Contact: ${body.contactPhone}`,
        isRead: false,
      }));
      await db.insert(notificationsTable).values(notifications);
    }

    res.status(201).json({
      id: request.id,
      patientName: request.patientName,
      bloodType: request.bloodType,
      unitsNeeded: request.unitsNeeded,
      hospital: request.hospital,
      city: request.city,
      urgency: request.urgency,
      status: request.status,
      contactPhone: request.contactPhone,
      notes: request.notes ?? null,
      requestedByDonorId: request.requestedByDonorId ?? null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.get("/blood-requests/:id", async (req, res) => {
  try {
    const { id } = GetBloodRequestParams.parse({ id: parseInt(req.params.id) });
    const [request] = await db
      .select()
      .from(bloodRequestsTable)
      .where(eq(bloodRequestsTable.id, id));

    if (!request) {
      res.status(404).json({ error: "Blood request not found" });
      return;
    }

    res.json({
      id: request.id,
      patientName: request.patientName,
      bloodType: request.bloodType,
      unitsNeeded: request.unitsNeeded,
      hospital: request.hospital,
      city: request.city,
      urgency: request.urgency,
      status: request.status,
      contactPhone: request.contactPhone,
      notes: request.notes ?? null,
      requestedByDonorId: request.requestedByDonorId ?? null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.put("/blood-requests/:id", async (req, res) => {
  try {
    const { id } = UpdateBloodRequestParams.parse({ id: parseInt(req.params.id) });
    const body = UpdateBloodRequestBody.parse(req.body);

    const [existing] = await db
      .select()
      .from(bloodRequestsTable)
      .where(eq(bloodRequestsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Blood request not found" });
      return;
    }

    const donorIdHeader = req.headers["x-donor-id"];
    const callerDonorId = donorIdHeader ? parseInt(String(donorIdHeader), 10) || null : null;

    if (!callerDonorId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Authorization logic for status changes
    if (body.status === "cancelled") {
      // Only the request owner can cancel
      if (callerDonorId !== existing.requestedByDonorId) {
        res.status(403).json({ error: "Only the request owner can cancel this request." });
        return;
      }
    } else if (body.status === "fulfilled") {
      // Donors with matching blood type can mark as fulfilled (check donor exists with that blood type)
      const [donor] = await db
        .select()
        .from(donorsTable)
        .where(eq(donorsTable.id, callerDonorId));

      if (!donor) {
        res.status(404).json({ error: "Donor profile not found" });
        return;
      }

      if (donor.bloodType !== existing.bloodType) {
        res.status(403).json({ error: `You can only fulfill requests for your blood type (${donor.bloodType})` });
        return;
      }
    }

    const updates: Partial<typeof bloodRequestsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.status !== undefined) {
      updates.status = body.status;
    }

    if (body.unitsNeeded !== undefined) {
      // Only the request owner can update units needed
      if (callerDonorId !== existing.requestedByDonorId) {
        res.status(403).json({ error: "Only the request owner can update units needed." });
        return;
      }
      updates.unitsNeeded = body.unitsNeeded;
    }

    const [request] = await db
      .update(bloodRequestsTable)
      .set(updates)
      .where(eq(bloodRequestsTable.id, id))
      .returning();

    res.json({
      id: request.id,
      patientName: request.patientName,
      bloodType: request.bloodType,
      unitsNeeded: request.unitsNeeded,
      hospital: request.hospital,
      city: request.city,
      urgency: request.urgency,
      status: request.status,
      contactPhone: request.contactPhone,
      notes: request.notes ?? null,
      requestedByDonorId: request.requestedByDonorId ?? null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
