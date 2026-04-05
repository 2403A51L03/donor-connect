# Workspace

## Overview

Blood Donor Application — a full-stack web app for connecting blood donors with patients in need. Built on a pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod resolvers
- **Animations**: Framer Motion
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── blood-donor/        # React + Vite frontend (served at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Blood Donor App
- **Dashboard**: Stats (total/available donors, open/critical requests), blood type distribution chart, recent urgent requests
- **Donors Page**: Search and filter donors by blood type and city
- **Register Donor**: Form to register as a blood donor (triggers automatic notifications for matching open requests)
- **Blood Requests**: List all blood requests with urgency indicators (critical/urgent/normal), filter by type/status
- **Create Blood Request**: Form for urgent blood requests (automatically sends notifications to matching donors)
- **Notifications**: In-app notifications when a new blood request matches donor's blood type

### Notification System
When a new blood request is created, the backend automatically notifies all available matching-blood-type donors. When a new donor registers, they receive notifications for all currently open matching requests.

## Database Schema

- `donors` — name, blood_type, phone, email, city, address, is_available, last_donation_date
- `blood_requests` — patient_name, blood_type, units_needed, hospital, city, urgency, status, contact_phone, notes
- `notifications` — donor_id (FK), blood_request_id (FK), message, is_read

## API Routes

- `GET/POST /api/donors` — list/create donors
- `GET/PUT /api/donors/:id` — get/update donor
- `GET/POST /api/blood-requests` — list/create blood requests
- `GET/PUT /api/blood-requests/:id` — get/update request status
- `GET /api/notifications?donorId=X` — get donor notifications
- `PUT /api/notifications/:id/read` — mark notification as read
- `GET /api/stats` — dashboard statistics

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
