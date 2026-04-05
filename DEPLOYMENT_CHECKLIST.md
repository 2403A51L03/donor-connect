# Pre-Deployment Checklist ✓

## 1. Local Setup
- [ ] Clone repository locally
- [ ] Run `pnpm install` successfully
- [ ] Copy `.env.example` to `.env`
- [ ] Add `DATABASE_URL` from Supabase to `.env`
- [ ] Test locally: `pnpm run build && pnpm start`
- [ ] Visit http://localhost:5000 and verify:
  - [ ] Frontend loads (you see the Donor Connect UI)
  - [ ] API works: http://localhost:5000/api/healthz returns JSON
  - [ ] Can register a donor
  - [ ] Can create blood request

## 2. Supabase Setup
- [ ] Have active Supabase project
- [ ] Tables created (donors, blood_requests, notifications)
- [ ] Got Connection Pooling URL (not regular URL)
- [ ] Database URL format: `postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres`

## 3. GitHub (if using GitHub-based Render deployment)
- [ ] Push all changes to GitHub
- [ ] Ensure `.gitignore` excludes:
  - [ ] `.env` (local credentials)
  - [ ] `node_modules/`
  - [ ] `dist/` folders
  - [ ] `.DS_Store`
  - [ ] `.vscode/`

## 4. Render.com Setup
- [ ] Account created at render.com
- [ ] Connected to GitHub (if using repo)
- [ ] New Web Service created
- [ ] Build command set to: `pnpm install && pnpm run build`
- [ ] Start command set to: `pnpm start`
- [ ] Environment variable added:
  - [ ] `DATABASE_URL` = your Supabase connection string

## 5. Post-Deployment
- [ ] Wait 3-5 minutes for build to complete
- [ ] Check Render Logs for any errors
- [ ] Visit your Render URL (e.g., https://donor-connect-xxxx.onrender.com/)
- [ ] Test functionality:
  - [ ] Page loads without "Cannot GET /" error
  - [ ] Can navigate between pages
  - [ ] API endpoints accessible at `/api/healthz`
  - [ ] Can register as donor
  - [ ] Can create blood request

## 6. Troubleshooting
If something doesn't work:

1. **"Cannot GET /" error**
   - Check Render build logs for errors
   - Ensure `pnpm run build` completes successfully
   - Verify frontend exists in `artifacts/blood-donor/dist`

2. **Database connection error**
   - Double-check DATABASE_URL in Render environment
   - Test the connection string locally
   - Ensure Supabase project is active

3. **Build fails**
   - Run `pnpm install` locally and check for errors
   - Run `pnpm run build` locally and check output
   - Ensure all dependencies are in package.json

4. **Slow loading**
   - Free tier Render services may spin down after inactivity
   - First request after sleep may take 30+ seconds
   - This is normal behavior

## 7. Performance Tips (Optional)
- [ ] Upgrade Render plan if needing better performance
- [ ] Seed database with test data if needed: `pnpm seed:db`
- [ ] Monitor logs regularly for errors
- [ ] Set up email notifications on Render for deployment alerts

## 8. Security Checklist
- [ ] ✅ DATABASE_URL never committed to git
- [ ] ✅ `.env` file ignored in `.gitignore`
- [ ] ✅ Use Supabase's connection pooling (not direct connection)
- [ ] ✅ SSL required for Supabase connection

---

## Ready to Deploy? 🚀

When all checkboxes above are completed:
1. Push code to GitHub (if using repo-based deployment)
2. Or manually deploy using Render CLI
3. Monitor deployment in Render dashboard
4. Test your live application

**Expected result:** A fully functional full-stack app at your Render URL! ✨
