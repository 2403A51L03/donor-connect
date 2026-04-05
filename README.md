<<<<<<< HEAD
# Donor Connect

A blood donor management system built with React, TypeScript, and Node.js.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up the database:
   - For local development, start PostgreSQL with Docker:
     ```bash
     docker run --name donor-connect-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=donor_connect -p 5432:5432 -d postgres:15
     ```
   - Or use a cloud database like Neon (https://neon.tech) and set DATABASE_URL in .env

3. Run database migrations:
   ```bash
   cd lib/db
   pnpm run push
   ```

## Quick Start

To run the entire project with one command:

```bash
pnpm run dev
```

Or double-click the `start-dev.bat` file on Windows.

This will start both the API server (port 5000) and frontend (port 3000) simultaneously.

## Manual Start

If you prefer to run them separately:

1. Start the API server:
   ```bash
   cd artifacts/api-server
   pnpm run dev
   ```

2. Start the frontend (in a new terminal):
   ```bash
   cd artifacts/blood-donor
   pnpm run dev
   ```

## Deployment

### Backend (Railway)
1. Go to [Railway.app](https://railway.app) and create an account
2. Create a new project
3. Connect your GitHub repo or deploy manually
4. Set environment variables:
   - `DATABASE_URL`: Your Neon database URL
   - `PORT`: 5000
5. Deploy the `artifacts/api-server` directory

### Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and create an account
2. Import your GitHub repo
3. Set build settings:
   - Root directory: `artifacts/blood-donor`
   - Build command: `pnpm run build`
   - Output directory: `dist/public`
4. Update `vercel.json` with your Railway API URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-railway-app.up.railway.app/api/:path*"
       }
     ]
   }
   ```
5. Deploy

### Database
- Use Neon.tech for PostgreSQL
- Set `DATABASE_URL` in both Railway and local .env

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (5000 for API, 3000 for frontend)
- `BASE_PATH`: Base path for frontend (/)

For production, set `VITE_API_BASE_URL` in frontend for API calls.
=======
# donor-connect
AI_Assisted_Coding  - 3_2 Project
>>>>>>> cc1f336bd6253e174355e67cf18a10c57d453abd
