CREATE TABLE "blood_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_name" text NOT NULL,
	"blood_type" text NOT NULL,
	"units_needed" integer NOT NULL,
	"hospital" text NOT NULL,
	"city" text NOT NULL,
	"urgency" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"contact_phone" text NOT NULL,
	"notes" text,
	"requested_by_donor_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"blood_type" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"last_donation_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "donors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" integer NOT NULL,
	"blood_request_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_donor_id_donors_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_blood_request_id_blood_requests_id_fk" FOREIGN KEY ("blood_request_id") REFERENCES "public"."blood_requests"("id") ON DELETE no action ON UPDATE no action;