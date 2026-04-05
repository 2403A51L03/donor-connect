# Donor Connect - Render.com Deployment Guide

## Overview
Donor Connect is a full-stack monorepo application with:
- **Frontend**: React + Vite (TypeScript)
- **Backend**: Express.js API
- **Database**: Supabase (PostgreSQL)

## What Was Fixed

### 1. **Database Configuration** 
- Fixed `__dirname` issue in `lib/db/src/index.ts`
- Proper .env loading for production

### 2. **Frontend Serving**
- Added static file serving to Express server
- Configured SPA fallback for React Router
- Both frontend and backend now run as a single service

### 3. **Render Configuration**
- Created `render.yaml` for proper deployment settings
- Configured build and start commands

## Deployment Steps

### Step 1: Prepare Your Render.com Account
1. Go to [render.com](https://render.com) and sign up/login
2. Connect your GitHub repository
3. Create a new Web Service

### Step 2: Set Environment Variables on Render
In your Render service settings, add these environment variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_SUPABASE_HOST:5432/postgres
NODE_ENV=production
PORT=10000
API_PORT=10000
```

**Where to find these:**
- **DATABASE_URL**: From your [Supabase project settings](https://supabase.com/dashboard) → "Database" → Connection Pooling
- **PORT & API_PORT**: Render assigns ports automatically (usually 10000)

### Step 3: Configure Build & Start Commands
Render should auto-detect from `render.yaml`, but if you need to set manually:

**Build Command:**
```bash
pnpm install && pnpm run build
```

**Start Command:**
```bash
pnpm start
```

### Step 4: Deploy

The app will automatically:
1. ✅ Install dependencies
2. ✅ Build the TypeScript/React code
3. ✅ Build the frontend with Vite
4. ✅ Start the Express server
5. ✅ Serve the frontend from the backend
6. ✅ Route API calls to `/api` endpoints

## Testing After Deployment

Once deployed, your URL will be something like:
```
https://donor-connect-xxxx.onrender.com/
```

### Test Endpoints:
```bash
# Health check
curl https://donor-connect-xxxx.onrender.com/api/healthz

# List donors
curl https://donor-connect-xxxx.onrender.com/api/donors

# Frontend
https://donor-connect-xxxx.onrender.com/
```

## Troubleshooting

### "Cannot GET /" Error
**Cause**: Frontend not being served or built
**Solution**: 
- Check that `pnpm run build` completes successfully
- Verify frontend files exist in `artifacts/blood-donor/dist`
- Check render logs for build errors

### Database Connection Timeout
**Cause**: DATABASE_URL not set or network issue
**Solution**:
- Verify DATABASE_URL is correct in Render environment variables
- Check Supabase is running
- Ensure network access is allowed (Supabase should allow from anywhere)

### Port Error
**Cause**: Application trying to use hardcoded port
**Solution**:
- Render sets the PORT environment variable automatically
- The app correctly reads from `process.env.PORT`

## Local Development

To test locally before deploying:

```bash
# Install dependencies
pnpm install

# Set up .env with Supabase credentials
# Copy .env.example to .env and fill in values

# Development mode (runs both frontend and backend)
pnpm dev

# Or build and run production version
pnpm run build
pnpm start

# Visit http://localhost:5000
```

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express backend
│   │   └── dist/            # Built backend (after pnpm build)
│   └── blood-donor/         # React frontend
│       └── dist/            # Built frontend (after pnpm build)
├── lib/
│   ├── api-spec/           # OpenAPI specification
│   ├── api-client-react/   # Generated API client
│   ├── api-zod/            # Zod validation schemas
│   └── db/                 # Database setup & migrations
├── package.json            # Root monorepo config
└── render.yaml             # Render deployment config
```

## Key Files for Deployment

- `render.yaml` - Render configuration
- `package.json` - Build and start commands
- `artifacts/api-server/build.ts` - Backend build config
- `artifacts/blood-donor/vite.config.ts` - Frontend build config
- `artifacts/api-server/src/app.ts` - Now serves frontend + API

## How It Works

1. **Build Phase** (`pnpm run build`):
   - Builds all TypeScript libraries
   - Builds React app to `artifacts/blood-donor/dist`
   - Bundles Express server to `artifacts/api-server/dist/index.cjs`

2. **Runtime** (`pnpm start`):
   - Starts Express server on PORT (10000)
   - Serves frontend static files from `/`
   - Routes `/api/*` to API endpoints
   - Falls back to `index.html` for React Router

## Environment Variables

| Variable | Required | Where From |
|----------|----------|-----------|
| `DATABASE_URL` | ✅ Yes | Supabase Connection String |
| `PORT` | ✅ Set by Render | Render auto-assigns |
| `API_PORT` | ❌ Optional | Same as PORT |
| `NODE_ENV` | ✅ Set to `production` | Render auto-sets |

## Next Steps

1. Push changes to GitHub (if using repo)
2. Go to Render.com and create new Web Service
3. Select your repository
4. Add DATABASE_URL environment variable
5. Deploy and wait for build to complete (~3-5 minutes)
6. Test the application at your Render URL

## Support

If you encounter issues:
1. Check Render logs (Dashboard → Service → Logs)
2. Check `pnpm run build` output locally
3. Verify DATABASE_URL is correct
4. Ensure all dependencies are in package.json (not package-lock.json)
