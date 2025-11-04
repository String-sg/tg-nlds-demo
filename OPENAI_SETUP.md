# OpenAI Integration - Quick Setup Guide

This guide will help you set up and test the OpenAI integration in under 5 minutes.

---

## Prerequisites

- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))
- Supabase project configured
- Development server running

---

## Step 1: Get OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-...`)

---

## Step 2: Configure Environment

1. Open `.env.local` (or create it if it doesn&apos;t exist):
   ```bash
   # Add this line:
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

---

## Step 3: Run Database Migration

Apply the OpenAI infrastructure migration:

```bash
# Option 1: Using Supabase CLI (recommended)
supabase db push

# Option 2: Manual migration
supabase migration up
```

This creates:
- Storage bucket for student photos
- Rate limiting tables
- Usage tracking tables
- Analytics views

---

## Step 4: Test Image Generation

### Test Single Generation

1. Navigate to a student profile
2. Add the `GeneratePhotoDialog` component:
   ```tsx
   import { GeneratePhotoDialog } from '@/components/student/generate-photo-dialog'

   <GeneratePhotoDialog
     studentId={student.id}
     studentName={student.name}
     currentPhotoUrl={student.profile_photo}
     gender={student.gender}
   />
   ```
3. Click "Generate Photo"
4. Wait 5-10 seconds
5. Photo should appear!

### Test Batch Generation

1. Navigate to class view
2. Add the `BatchGenerateDialog` component:
   ```tsx
   import { BatchGenerateDialog } from '@/components/student/batch-generate-dialog'

   <BatchGenerateDialog
     studentIds={students.map(s => s.id)}
     classNameDisplay={className}
   />
   ```
3. Click "Generate All Student Photos"
4. Start with 5 students to test
5. Review results

---

## Step 5: Test Assistant Chat

1. Open assistant panel (bottom-right icon)
2. Type: "Hello, can you help me?"
3. Watch response stream in real-time ✨
4. Try PTM command: "/ptm" or "prepare for parent teacher meeting"
5. Verify PTM data + AI response both appear

---

## Verification Checklist

After setup, verify everything works:

- [ ] Environment variable set correctly
- [ ] Server restarted
- [ ] Database migration applied successfully
- [ ] Storage bucket `student-photos` exists in Supabase
- [ ] Assistant chat responds with streaming text
- [ ] Single image generation works
- [ ] Generated images appear in Supabase Storage
- [ ] Database updates with image URLs
- [ ] Rate limiting triggers (test with 6+ quick requests)

---

## Quick Troubleshooting

### "Missing OPENAI_API_KEY"
- Double-check `.env.local` has the key
- Restart development server
- Key should start with `sk-proj-`

### "Failed to upload image"
- Check Supabase Storage bucket exists: `student-photos`
- Verify bucket is public
- Check RLS policies via migration

### Chat not streaming
- Check browser console for errors
- Verify `/api/chat/stream` endpoint exists
- Try refreshing the page

### Rate limit exceeded
- Wait 1 minute
- Limits: 10 chat/min, 5 images/min per user

---

## Cost Monitoring

Monitor your usage:

```sql
-- View usage summary
SELECT * FROM openai_usage_summary;

-- View daily costs
SELECT * FROM openai_daily_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
```

**Expected Costs**:
- Chat: ~$0.00026 per message
- Images: $0.04 per image
- Monthly estimate: ~$3.73 for typical usage

---

## Next Steps

Once everything works:

1. ✅ Test with small batches first (5-10 students)
2. ✅ Monitor costs for first few days
3. ✅ Gather teacher feedback
4. ✅ Roll out to more classes
5. ✅ Consider fine-tuning for your school context

---

## Support

- **Full Documentation**: `.agent/Tasks/openai-implementation-summary.md`
- **Implementation Plan**: `.agent/Tasks/openai-integration-plan.md`
- **OpenAI Docs**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**Ready to test!** 🚀
