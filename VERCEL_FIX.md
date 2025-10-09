# Quick Fix: Vercel Production Database Error

## Problem
Production deployment shows "Failed to fetch class data" error when accessing Class 5A page.

## Root Cause
Missing or incorrect PostgreSQL database configuration in Vercel environment variables.

## Immediate Solution (5 minutes)

### Step 1: Set up PostgreSQL Database

**Easiest option - Vercel Postgres:**

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Click **Create** and wait for provisioning (~2 minutes)

**Alternative - Supabase (free tier):**

1. Go to https://supabase.com
2. Create new project
3. Wait for database to provision
4. Go to **Project Settings** → **Database**
5. Copy the **Connection string** (URI format)

### Step 2: Verify Environment Variable in Vercel

1. In Vercel, go to **Settings** → **Environment Variables**
2. Confirm `DATABASE_URL` exists (if using Vercel Postgres, it should be auto-added)
3. If missing or using Supabase, add it:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://user:pass@host:5432/db?sslmode=require`
   - **Environments**: Check all boxes (Production, Preview, Development)

### Step 3: Apply Database Migrations

**Option A - Using Vercel CLI (Recommended):**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env

# Run migrations
npx prisma migrate deploy

# Seed database with initial data
npx prisma db seed
```

**Option B - Manual (if CLI doesn't work):**

```bash
# Replace with your actual DATABASE_URL from Vercel
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

### Step 4: Trigger Redeployment

1. In Vercel dashboard, go to **Deployments**
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait for build to complete (~2-3 minutes)

### Step 5: Test

1. Visit your production URL
2. Navigate to **Classroom** → **Class 5A**
3. Page should now load with student data

## Expected Result

✅ Class Overview page loads
✅ Student list displays
✅ No "Failed to fetch class data" error

## Still Not Working?

### Check 1: Build Logs
```
Vercel Dashboard → Deployments → Latest → View Build Logs
Look for: "✓ Generated Prisma Client"
```

### Check 2: Function Logs
```
Vercel Dashboard → Deployments → Latest → View Function Logs
Look for Prisma connection errors
```

### Check 3: Test Database Connection
```bash
# With DATABASE_URL from Vercel
DATABASE_URL="postgresql://..." npx prisma db pull

# Should complete without errors
```

### Check 4: Verify Schema
```bash
# Generate Prisma Client locally
npx prisma generate

# Should show: "Generated Prisma Client"
```

## Common Errors & Fixes

| Error | Solution |
|-------|----------|
| "PrismaClient is unable to connect" | DATABASE_URL not set or incorrect |
| "Table does not exist" | Run `npx prisma migrate deploy` |
| "prisma is not defined" | Run `npm install` to trigger postinstall |
| "Invalid DATABASE_URL" | Check format includes `?sslmode=require` |

## Files Changed in This Fix

- ✅ `prisma/schema.prisma` - Changed provider to PostgreSQL
- ✅ `package.json` - Added postinstall script
- ✅ `.env.example` - Created with sample config
- ✅ `DEPLOYMENT.md` - Full deployment guide

## Need More Help?

See `DEPLOYMENT.md` for comprehensive deployment guide.
