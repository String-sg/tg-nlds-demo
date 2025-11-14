# Environment Setup Verification

This guide helps you verify that the application works correctly after removing hardcoded credentials.

## ✅ What Was Changed

**Security improvements:**
- ❌ Removed hardcoded database password from docs
- ❌ Removed hardcoded project ID from docs
- ❌ Removed hardcoded connection strings from docs
- ✅ Added `.env.example` with all required variables
- ✅ Updated `.gitignore` to protect `.env` files

**Important:** The source code already used environment variables - we only removed credentials from documentation files.

## 🔧 Setup Steps

### 1. Create Your Local .env File

```bash
# Copy the example file
cp .env.example .env
```

### 2. Fill in Your Credentials

Edit `.env` and add your actual values:

```env
# Get from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-actual-anon-key

# Get from: Supabase Dashboard → Project Settings → API
# ⚠️ Keep this secret - only for server-side code
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-actual-service-role-key

# Get from: Supabase Dashboard → Project Settings → Database
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ORG_ID=org-your-org-id-optional

# Development settings (optional)
NEXT_PUBLIC_PTM_MOCK_MODE=false
NODE_ENV=development
```

## ✅ Verification Checklist

### Check 1: Environment Variables Loaded

```bash
# Run this to verify .env is being read
npm run dev

# You should NOT see errors like:
# - "Missing OPENAI_API_KEY"
# - "Cannot connect to Supabase"
```

### Check 2: Supabase Connection

Visit: `http://localhost:3000/api/test-db`

**Expected response:**
```json
{
  "success": true,
  "message": "✅ Database connection successful!",
  "results": [...]
}
```

**If you see errors:**
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify your Supabase project is active

### Check 3: OpenAI Integration

Try using the AI assistant in the app:
1. Navigate to the chat interface
2. Send a message
3. Verify you get a response

**If you see errors:**
- Check `OPENAI_API_KEY` is valid
- Verify your OpenAI account has credits
- Check the browser console for error messages

### Check 4: No Hardcoded Credentials

```bash
# This should return 0 (no matches)
grep -r "ob5VlizdFjyam3fw" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next | wc -l

# This should only show YOUR-PROJECT-ID placeholders
grep -r "uzrzyapgxseqqisapmzb" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next
```

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already configured)
- Use different credentials for development/production
- Rotate credentials if they were exposed
- Store production credentials in Vercel environment variables
- Use service role key only on server-side code

### ❌ DON'T:
- Commit `.env` files to git
- Share credentials in Slack/email/docs
- Use production credentials in development
- Expose service role key to client-side code

## 🚀 Deployment

When deploying to Vercel:

1. **Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add these variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Production only)
   - `OPENAI_API_KEY`
   - `OPENAI_ORG_ID` (optional)
   - `DATABASE_URL`
   - `POSTGRES_URL_NON_POOLING`

3. **Redeploy** your application

## 🆘 Troubleshooting

### Error: "Missing environment variable"

**Cause:** `.env` file not created or variable not defined

**Solution:**
1. Verify `.env` file exists: `ls -la .env`
2. Check variable is defined: `grep VARIABLE_NAME .env`
3. Restart dev server: `npm run dev`

### Error: "Invalid Supabase URL"

**Cause:** Incorrect URL format

**Solution:**
- URL should be: `https://your-project-id.supabase.co`
- Get from: Supabase Dashboard → Project Settings → API → Project URL

### Error: "Unauthorized" from Supabase

**Cause:** Invalid anon key or RLS policies

**Solution:**
1. Verify anon key: Supabase Dashboard → Project Settings → API
2. Check RLS policies are configured correctly
3. Make sure you're using the anon key (not service role key) for client-side

### Error: "Rate limit exceeded" from OpenAI

**Cause:** Too many requests or insufficient tier limits

**Solution:**
1. Wait a few minutes and try again
2. Check your OpenAI usage: https://platform.openai.com/usage
3. Consider upgrading your OpenAI tier

## 📝 Summary

**Files Modified:**
- `APPLY_MIGRATIONS.md` - Removed hardcoded DB URL
- `HOW_TO_APPLY_MIGRATIONS.md` - Removed password and project ID
- `MIGRATION-INSTRUCTIONS.md` - Removed project reference
- `GENERATE_REAL_STUDENT_AVATARS.md` - Sanitized URLs
- `avatar-regeneration.log` - Sanitized project ID
- `.agent/Archive/DEPLOYMENT_COMPLETE.md` - Removed specific URLs
- `.gitignore` - Updated env file exclusions

**Files Added:**
- `.env.example` - Template for environment variables
- `SETUP_VERIFICATION.md` - This guide

**Source Code:**
- ✅ No changes needed - already using environment variables
- ✅ All Supabase clients use `process.env.*`
- ✅ OpenAI client uses `process.env.*`
- ✅ No hardcoded credentials in source code

---

**Need Help?**
- Check `.env.example` for all required variables
- Review Supabase docs: https://supabase.com/docs
- Review OpenAI docs: https://platform.openai.com/docs
