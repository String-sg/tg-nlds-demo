# 🚀 Deployment Checklist

Quick checklist for deploying Supabase with your Vercel app.

## Part 1: Create Supabase Project (5 minutes)

- [ ] Go to https://app.supabase.com
- [ ] Click **"New Project"**
- [ ] Enter project details:
  - [ ] Name: `moe-tg-vx`
  - [ ] Database Password: *(Generate & Save)*
  - [ ] Region: `Southeast Asia (Singapore)`
- [ ] Wait ~2 minutes for project creation
- [ ] Copy credentials from **Project Settings → API**:
  - [ ] `Project URL`
  - [ ] `anon public key`
  - [ ] `service_role key`
  - [ ] `Project Ref`

## Part 2: Run Database Migrations (5 minutes)

### Option A: Via CLI (Recommended)

- [ ] Login: `npx supabase login`
- [ ] Link: `npx supabase link --project-ref YOUR_REF`
- [ ] Push: `npx supabase db push`
- [ ] Verify: Check **Table Editor** in Supabase (19 tables)

### Option B: Manual (via Dashboard)

- [ ] Go to **SQL Editor** in Supabase
- [ ] Run each migration file in order (0000 → 0006)
- [ ] Verify: Check **Table Editor** (19 tables)

## Part 3: Connect to Vercel (3 minutes)

### Option A: Vercel Integration (Automatic)

- [ ] Go to https://vercel.com/integrations/supabase
- [ ] Click **"Add Integration"**
- [ ] Select your Vercel project: `moe-tg-vx`
- [ ] Select your Supabase project: `moe-tg-vx`
- [ ] Click **"Connect"** and **"Install"**
- [ ] Verify: Check **Environment Variables** in Vercel

### Option B: Manual

- [ ] Go to Vercel Project → **Settings → Environment Variables**
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` = `your-service-key` (Production only)

## Part 4: Deploy & Test (2 minutes)

- [ ] Redeploy Vercel (push commit or click "Redeploy")
- [ ] Wait for deployment to finish
- [ ] Visit your production URL
- [ ] Open browser DevTools console
- [ ] Check for errors (should be none)
- [ ] Test a database query (if possible)

## Part 5: Update Local Environment

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add your Supabase credentials:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-key
  ```
- [ ] Test locally: `npm run dev`

## Part 6: Verify Everything Works

- [ ] **Supabase Dashboard**:
  - [ ] 19 tables exist in **Table Editor**
  - [ ] RLS policies enabled (**Authentication → Policies**)

- [ ] **Vercel Dashboard**:
  - [ ] Latest deployment successful
  - [ ] Environment variables set
  - [ ] No build errors

- [ ] **Production App**:
  - [ ] App loads without errors
  - [ ] No console errors
  - [ ] Database queries work

## Optional: Seed Data

- [ ] Go to **SQL Editor** in Supabase
- [ ] Add test data:
  ```sql
  -- Test teacher
  INSERT INTO teachers (id, name, email, department)
  VALUES ('11111111-1111-1111-1111-111111111111',
          'Daniel Tan', 'daniel.tan@school.edu.sg', 'Mathematics');
  ```
- [ ] Or run migration script: `npx tsx scripts/migrate-dummy-data.ts`

---

## ✅ You're Done!

**Your stack is now live:**
- 🌐 Frontend: Vercel
- 🗄️ Database: Supabase
- 🔒 Security: RLS enabled

**Next Steps:**
1. Implement authentication
2. Migrate dummy data
3. Build out features
4. Add monitoring

---

## 🆘 Having Issues?

Common problems:

**Build fails**: Ensure all files committed:
```bash
git add .
git commit -m "Add Supabase integration"
git push
```

**Connection errors**: Check environment variables in Vercel settings

**RLS errors**: Ensure policies are enabled in Supabase → Authentication → Policies

**Need help**: See [VERCEL_SUPABASE_DEPLOYMENT.md](./VERCEL_SUPABASE_DEPLOYMENT.md)

---

**Total Time**: ~15 minutes
**Difficulty**: Easy 🟢
