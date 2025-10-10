# Deploying Supabase with Vercel

Complete guide to integrate Supabase with your Vercel-deployed Next.js application.

## 🎯 Overview

We'll connect your Vercel deployment to Supabase in two ways:
1. **Vercel Integration** - Automatic environment variable sync (Recommended)
2. **Manual Setup** - Add environment variables manually

## 📋 Prerequisites

- ✅ Vercel project already deployed
- ✅ Supabase migrations created (in `supabase/migrations/`)
- ⬜ Supabase project (we'll create this)

## 🚀 Step-by-Step Deployment

### Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Click **"New Project"**

2. **Fill in Project Details**
   ```
   Organization: Select or create new
   Name: moe-tg-vx (or your preferred name)
   Database Password: [Generate strong password - SAVE THIS!]
   Region: Southeast Asia (Singapore) - Closest to your users
   Pricing Plan: Free (or Pro if needed)
   ```

3. **Wait for Project Creation**
   - Takes ~2 minutes
   - You'll get a project dashboard when ready

4. **Note Your Credentials**
   Once created, go to **Project Settings → API**

   Copy these values:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (keep secret!)
   Project Ref: xxxxxxxxxxxxx
   ```

### Step 2: Run Database Migrations

You have 3 options to apply your migrations:

#### Option A: Via Supabase CLI (Recommended)

```bash
# 1. Login to Supabase CLI
npx supabase login

# 2. Link to your remote project
npx supabase link --project-ref xxxxxxxxxxxxx
# Enter your database password when prompted

# 3. Push all migrations
npx supabase db push

# 4. Verify migrations
npx supabase migration list
```

#### Option B: Via Supabase Dashboard (Manual)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy and paste each migration file in order:
   - `20250110000000_create_core_tables.sql`
   - `20250110000001_create_guardian_student_tables.sql`
   - `20250110000002_create_student_data_tables.sql`
   - `20250110000003_create_social_behaviour_tables.sql`
   - `20250110000004_create_cases_system.sql`
   - `20250110000005_create_reports_system.sql`
   - `20250110000006_create_rls_policies.sql`
4. Run each query (Click **"Run"** or `Cmd/Ctrl + Enter`)

#### Option C: Upload Migration Files

1. Go to **Database → Migrations** in Supabase dashboard
2. Click **"Upload migration"**
3. Upload each `.sql` file in order
4. Migrations will auto-apply

### Step 3: Verify Database Setup

1. Go to **Table Editor** in Supabase Dashboard
2. Check that all 19 tables exist:
   - ✅ teachers, classes, teacher_classes
   - ✅ parents_guardians, students, student_guardians, student_classes
   - ✅ student_overview, student_private_notes, attendance, academic_results, physical_fitness, cce_results
   - ✅ friend_relationships, behaviour_observations
   - ✅ cases, case_issues
   - ✅ reports, report_comments

### Step 4: Connect Vercel to Supabase

#### Option A: Vercel Integration (Automatic - Recommended)

1. **Install Supabase Integration**

   Go to: https://vercel.com/integrations/supabase

   OR

   ```bash
   # Open Vercel project settings
   # Go to: https://vercel.com/your-username/moe-tg-vx/settings/integrations
   ```

2. **Add Integration**
   - Click **"Add Integration"** on Supabase
   - Select your Vercel project: `moe-tg-vx`
   - Click **"Continue"**

3. **Connect Supabase Project**
   - Select your Supabase organization
   - Select your Supabase project: `moe-tg-vx`
   - Click **"Connect"**

4. **Grant Permissions**
   - Allow Vercel to add environment variables
   - Click **"Install"**

5. **Verify Environment Variables**
   - Go to Vercel Project Settings → Environment Variables
   - You should see:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     ```
   - These are automatically synced! ✅

#### Option B: Manual Environment Variables

If you prefer manual setup:

1. **Go to Vercel Project Settings**
   ```
   https://vercel.com/your-username/moe-tg-vx/settings/environment-variables
   ```

2. **Add Environment Variables**

   Click **"Add New"** for each variable:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (your anon key) | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (service role key) | Production only ⚠️ |

   **Important**:
   - ✅ Add `NEXT_PUBLIC_*` to all environments
   - ⚠️ Add `SUPABASE_SERVICE_ROLE_KEY` **ONLY to Production** (keep secret!)

3. **Save Variables**
   - Click **"Save"** for each

### Step 5: Redeploy Vercel Project

After adding environment variables:

```bash
# Option 1: Push a new commit (triggers auto-deploy)
git add .
git commit -m "Add Supabase environment variables"
git push

# Option 2: Redeploy from Vercel Dashboard
# Go to: Deployments → Click "..." → Redeploy
```

Or via Vercel CLI:

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Redeploy
vercel --prod
```

### Step 6: Update Local Environment

Update your local `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...

# For local development admin operations only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
```

### Step 7: Test the Integration

#### Test Local Development

```bash
# Start dev server
npm run dev

# Your app should now connect to remote Supabase
# Check browser console for any connection errors
```

#### Test Production Deployment

1. **Visit your Vercel production URL**
   ```
   https://moe-tg-vx.vercel.app
   ```

2. **Open Browser DevTools Console**
   - Check for Supabase connection errors
   - Network tab should show requests to `supabase.co`

3. **Test a Query** (if you have a test page)
   ```typescript
   // Example: Add this to a test page
   import { createClient } from '@/lib/supabase/client'

   const supabase = createClient()
   const { data, error } = await supabase.from('teachers').select('count')

   console.log('Teachers count:', data)
   console.log('Error:', error)
   ```

## 🔒 Security Best Practices

### Environment Variables

✅ **DO:**
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)
- Store sensitive keys in Vercel environment variables (never commit)
- Use different Supabase projects for dev/staging/prod

❌ **DON'T:**
- Expose service role key in client-side code
- Commit `.env.local` to Git
- Use production credentials in development
- Share service role key publicly

### Row Level Security (RLS)

Your database is protected with RLS policies. Verify they're active:

1. Go to **Authentication → Policies** in Supabase
2. Check each table has policies enabled
3. Test with a non-admin user to ensure access restrictions work

## 🧪 Testing Checklist

After deployment, verify:

- [ ] **Vercel deployment successful** - No build errors
- [ ] **Environment variables set** - Check Vercel settings
- [ ] **Database tables created** - Check Supabase Table Editor (19 tables)
- [ ] **RLS policies active** - Check Supabase Authentication → Policies
- [ ] **Production app loads** - Visit Vercel URL
- [ ] **No console errors** - Check browser DevTools
- [ ] **Database queries work** - Test a simple query
- [ ] **Auth works** (if implemented) - Login/logout flow

## 📊 Optional: Seed Production Data

If you want to add test data to production:

### Option 1: Via Migration Script

```bash
# Run the dummy data migration script
npx tsx scripts/migrate-dummy-data.ts
```

Make sure your `.env.local` has production credentials or update the script to use Vercel environment variables.

### Option 2: Via SQL Editor

1. Go to **SQL Editor** in Supabase
2. Create a new query:

```sql
-- Example: Add a test teacher
INSERT INTO teachers (id, name, email, department, avatar)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Daniel Tan', 'daniel.tan@school.edu.sg', 'Mathematics', 'DT');

-- Example: Add a test class
INSERT INTO classes (id, name, type, year_level, academic_year)
VALUES
  ('22222222-2222-2222-2222-222222222222', '5A', 'form', '5', '2025');

-- Link teacher to class
INSERT INTO teacher_classes (teacher_id, class_id, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'form_teacher');
```

3. Run the query

## 🔧 Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found: Can't resolve '@/lib/supabase/client'`

**Solution**: Ensure all Supabase files are committed:
```bash
git add src/lib/supabase/
git add src/types/database.ts
git commit -m "Add Supabase integration files"
git push
```

### Connection Errors

**Error**: `Invalid Supabase URL` or `Invalid API key`

**Solution**:
1. Verify environment variables in Vercel settings
2. Check for typos in URL/keys
3. Ensure no extra spaces in values
4. Redeploy after fixing

### RLS Policy Errors

**Error**: `Row level security policy violation`

**Solution**:
1. Check if RLS policies are properly applied
2. Ensure user is authenticated
3. Verify teacher ID matches authenticated user UUID
4. Review policies in Supabase Dashboard → Authentication → Policies

### Migration Errors

**Error**: `relation "teachers" already exists`

**Solution**: Migrations already applied. Check migration history:
```bash
npx supabase migration list
```

If corrupted:
```bash
# Reset local database (CAUTION: Destroys local data)
npx supabase db reset

# For production, manually fix via SQL Editor
```

## 🎯 Vercel-Specific Configuration

### Preview Deployments

Each Git branch preview deployment can use the same Supabase:

1. In Vercel settings, environment variables are set to:
   - ✅ **Production** - Main branch uses production Supabase
   - ✅ **Preview** - Feature branches use same Supabase (or create staging Supabase)
   - ✅ **Development** - Local uses `.env.local`

### Recommended: Separate Supabase for Staging

For safer testing:

1. **Create a second Supabase project**: `moe-tg-vx-staging`
2. **Run migrations** on staging project
3. **Update Vercel environment variables**:
   - Production environment → Production Supabase
   - Preview environment → Staging Supabase

### Edge Functions (Optional)

If you use Vercel Edge Functions with Supabase:

```typescript
// app/api/edge-example/route.ts
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase.from('teachers').select('count')
  return Response.json(data)
}
```

## 📈 Monitoring & Analytics

### Supabase Dashboard

Monitor your database:
- **Database → Logs** - Query logs
- **Database → Backups** - Automated backups (Pro plan)
- **Auth → Users** - User activity
- **Storage** - File uploads (if used)

### Vercel Analytics

Enable analytics in Vercel:
- **Analytics** - Page views, performance
- **Speed Insights** - Core Web Vitals
- **Logs** - Function logs, errors

## 🚀 You're Done!

Your Vercel deployment is now connected to Supabase! 🎉

**Quick Links:**
- 🌐 Production App: `https://your-app.vercel.app`
- 🗄️ Supabase Dashboard: `https://app.supabase.com`
- 📊 Vercel Dashboard: `https://vercel.com/dashboard`

**Next Steps:**
1. ✅ Test authentication flow
2. ✅ Add seed data (teachers, students, classes)
3. ✅ Migrate dummy data from mock files
4. ✅ Set up monitoring alerts
5. ✅ Configure Supabase Auth providers (email, Google, etc.)

---

## Quick Reference Commands

```bash
# Supabase CLI
npx supabase login
npx supabase link --project-ref xxxxx
npx supabase db push
npx supabase migration list
npx supabase db reset

# Vercel CLI
vercel --prod
vercel env pull .env.local
vercel logs

# Migration
npx tsx scripts/migrate-dummy-data.ts

# Type Generation
npx supabase gen types typescript --project-id xxxxx > src/types/database.ts
```

---

Need help? Check:
- [SUPABASE_IMPLEMENTATION.md](./SUPABASE_IMPLEMENTATION.md) - Implementation details
- [supabase/SETUP.md](./supabase/SETUP.md) - Database setup
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
