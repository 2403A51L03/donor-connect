INSERT INTO "donors" ("name", "blood_type", "phone", "email", "city", "address", "is_available", "last_donation_date") VALUES
('donor1', 'A+', '03000000001', 'donor1@donor.com', 'Lahore', '123 Donor Street', true, NULL),
('donor2', 'B-', '03000000002', 'donor2@donor.com', 'Karachi', '456 Blood Avenue', false, '2024-03-15'),
('donor3', 'O+', '03000000003', 'donor3@donor.com', 'Islamabad', '789 Plasma Road', true, '2024-01-20');

INSERT INTO "blood_requests" ("patient_name", "blood_type", "units_needed", "hospital", "city", "urgency", "status", "contact_phone", "notes", "requested_by_donor_id") VALUES
('Patient One', 'A+', 2, 'General Hospital', 'Lahore', 'high', 'open', '03110001111', 'Urgent A+ units needed.', 1),
('Patient Two', 'B-', 3, 'City Hospital', 'Karachi', 'normal', 'open', '03220002222', 'Rare B- units required.', 2),
('Patient Three', 'O+', 1, 'National Medical Center', 'Islamabad', 'high', 'open', '03330003333', 'One unit O+ needed urgently.', 3);
