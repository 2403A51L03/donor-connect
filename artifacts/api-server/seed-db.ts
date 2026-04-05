import { config } from "dotenv";
config({ path: "./.env" });

import { db, donorsTable, bloodRequestsTable } from "@workspace/db";

async function main() {
  const donors = [
    {
      name: "donor1",
      bloodType: "A+",
      phone: "03000000001",
      email: "donor1@donor.com",
      city: "Lahore",
      address: "123 Donor Street",
      isAvailable: true,
      lastDonationDate: null,
    },
    {
      name: "donor2",
      bloodType: "B-",
      phone: "03000000002",
      email: "donor2@donor.com",
      city: "Karachi",
      address: "456 Blood Avenue",
      isAvailable: false,
      lastDonationDate: "2024-03-15",
    },
    {
      name: "donor3",
      bloodType: "O+",
      phone: "03000000003",
      email: "donor3@donor.com",
      city: "Islamabad",
      address: "789 Plasma Road",
      isAvailable: true,
      lastDonationDate: "2024-01-20",
    },
  ];

  const insertedDonors = await db.insert(donorsTable).values(donors).returning();
  console.log("Inserted donors:", insertedDonors);

  const bloodRequests = [
    {
      patientName: "Patient One",
      bloodType: "A+",
      unitsNeeded: 2,
      hospital: "General Hospital",
      city: "Lahore",
      urgency: "high",
      status: "open",
      contactPhone: "03110001111",
      notes: "Urgent A+ units needed.",
      requestedByDonorId: insertedDonors[0]?.id ?? null,
    },
    {
      patientName: "Patient Two",
      bloodType: "B-",
      unitsNeeded: 3,
      hospital: "City Hospital",
      city: "Karachi",
      urgency: "normal",
      status: "open",
      contactPhone: "03220002222",
      notes: "Rare B- units required.",
      requestedByDonorId: insertedDonors[1]?.id ?? null,
    },
    {
      patientName: "Patient Three",
      bloodType: "O+",
      unitsNeeded: 1,
      hospital: "National Medical Center",
      city: "Islamabad",
      urgency: "high",
      status: "open",
      contactPhone: "03330003333",
      notes: "One unit O+ needed urgently.",
      requestedByDonorId: insertedDonors[2]?.id ?? null,
    },
  ];

  const insertedRequests = await db.insert(bloodRequestsTable).values(bloodRequests).returning();
  console.log("Inserted blood requests:", insertedRequests);
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
