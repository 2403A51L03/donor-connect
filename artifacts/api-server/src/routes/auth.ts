import { Router, type IRouter } from "express";
import { db, donorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const [donor] = await db
      .select()
      .from(donorsTable)
      .where(eq(donorsTable.email, email.trim().toLowerCase()));

    if (!donor) {
      res.status(404).json({ error: "No donor account found with this email address." });
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
    res.status(500).json({ error: String(err) });
  }
});

export default router;
