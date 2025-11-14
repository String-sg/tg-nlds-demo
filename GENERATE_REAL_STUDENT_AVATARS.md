# Generate Avatars for Real Students from Database

This guide explains how to generate AI avatars for actual students in your database using OpenAI DALL-E 3.

## Overview

There are **two different scripts**:

### 1. Sample Avatars (Demo/Fallback)
**Script**: `scripts/generate-sample-avatars.ts`
- Generates 5 placeholder avatars with hardcoded names
- Saves to `public/avatars/students/`
- Used as fallback when students don't have photos
- **Does NOT use real student data**

### 2. Real Student Avatars (Production)
**Script**: `scripts/generate-student-avatars-from-db.ts` ⭐ **NEW**
- Fetches real students from Supabase database
- Generates avatars based on actual student data
- Uploads to Supabase Storage (`student-photos` bucket)
- Updates student records with photo URLs
- **Uses real student names, gender, nationality, age**

## Prerequisites

✅ OpenAI account upgraded to Tier 1+ (DALL-E access enabled)
✅ Supabase credentials configured in `.env`
✅ `student-photos` bucket exists in Supabase Storage

## Usage

### Basic Usage (Generate for all students without photos)

```bash
npx tsx scripts/generate-student-avatars-from-db.ts
```

This will:
1. Fetch all students without `profile_photo`
2. Generate avatars (max 50 by default)
3. Upload to Supabase Storage
4. Update database records

### Advanced Options

#### Generate for specific class only

```bash
npx tsx scripts/generate-student-avatars-from-db.ts --class-id=<class-uuid>
```

Example:
```bash
npx tsx scripts/generate-student-avatars-from-db.ts --class-id=abc123-def456-ghi789
```

#### Limit number of students

```bash
npx tsx scripts/generate-student-avatars-from-db.ts --limit=10
```

#### Preview without generating (Dry run)

```bash
npx tsx scripts/generate-student-avatars-from-db.ts --dry-run
```

This shows:
- List of students that would be processed
- Estimated cost
- Estimated time
- **No avatars are generated**

#### Combine options

```bash
npx tsx scripts/generate-student-avatars-from-db.ts \
  --class-id=abc123 \
  --limit=20 \
  --dry-run
```

## How It Works

### 1. Data Fetching
```sql
SELECT id, student_id, name, gender, nationality, date_of_birth, profile_photo
FROM students
WHERE profile_photo IS NULL
ORDER BY name ASC
LIMIT 50;
```

### 2. Avatar Generation

For each student:
1. **Calculate age** from `date_of_birth`
2. **Determine ethnicity** from `nationality` field
3. **Build AI prompt** with:
   - Gender (male/female)
   - Ethnicity (Chinese, Malay, Indian, etc.)
   - Age (calculated)
   - Singapore school uniform style
4. **Generate image** with DALL-E 3
5. **Upload to Supabase Storage** (`student-photos` bucket)
6. **Update database** with public URL

### 3. Database Update
```sql
UPDATE students
SET profile_photo = 'https://...supabase.co/storage/.../student-photos/uuid-timestamp.png'
WHERE id = 'student-uuid';
```

## Cost & Performance

| Students | Cost | Time (est.) |
|----------|------|-------------|
| 10 | $0.40 | ~1 minute |
| 50 | $2.00 | ~5 minutes |
| 100 | $4.00 | ~10 minutes |
| 500 | $20.00 | ~45 minutes |

**Rate Limits:**
- Free tier: 0 images/min (not supported)
- Tier 1: 5 images/min
- Tier 2: 10 images/min
- Tier 3+: 20 images/min

Script includes 2-second delays between requests to respect rate limits.

## Example Output

```
🚀 Starting student avatar generation from database...
📦 Settings:
   - Max students: 50
   - Class filter: All classes
   - Dry run: No

📥 Fetching students from database...

✅ Found 48 students without profile photos

📋 Students to process:
   1. Aisha Tan (S2023001) - female, Malay
   2. Benjamin Ng (S2023002) - male, Chinese
   3. Chen Wei (S2023003) - male, Chinese
   ...

💰 Estimated cost: $1.92 (48 × $0.04)
⏱️  Estimated time: ~2 minutes


[1/48] Processing Aisha Tan...

🎨 Generating avatar for Aisha Tan (S2023001)...
📝 Gender: female, Ethnicity: Malay, Age: 12
⏱️  Generated in 3421ms
🔗 Image URL: https://oaidalleapiprodscus.blob.core.windows.net...
⬇️  Downloading image...
☁️  Uploading to Supabase Storage...
💾 Updating student record...
✅ Successfully generated and saved avatar
📊 File size: 287.34 KB
🔗 URL: https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/student-photos/abc-123.png
⏳ Waiting 2 seconds before next generation...

[2/48] Processing Benjamin Ng...
...

✨ Avatar generation complete!
✅ Success: 48
❌ Failures: 0
💰 Actual cost: $1.92
```

## Safety Features

✅ **Skip existing photos**: Only generates for students with `profile_photo = NULL`
✅ **Rate limiting**: 2-second delay between requests
✅ **Error handling**: Continues on failure instead of stopping
✅ **Dry run mode**: Preview before spending money
✅ **Limit protection**: Default max 50 students per run

## Database Schema Requirements

Students must have these fields:
- `id` (UUID) - Primary key
- `student_id` (TEXT) - Student number
- `name` (TEXT) - Full name
- `gender` (TEXT) - 'male', 'female', or null
- `nationality` (TEXT) - e.g., 'Chinese', 'Malay', 'Indian'
- `date_of_birth` (DATE) - For age calculation
- `profile_photo` (TEXT) - URL to photo (nullable)

## Troubleshooting

### Issue: "Missing Supabase credentials"

**Solution**: Ensure `.env` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Issue: "Rate limit exceeded"

**Solution**: Your OpenAI tier has hit the limit
- Tier 1: Wait 1 minute, then resume
- Or upgrade to higher tier for more images/min
- Script will continue from where it left off

### Issue: "Upload failed: Bucket not found"

**Solution**: Create `student-photos` bucket in Supabase:
1. Go to Supabase Dashboard > Storage
2. Create new bucket: `student-photos`
3. Set to **Public** access
4. Run migration: `20251104160000_create_openai_infrastructure.sql`

### Issue: "No students found"

**Possible causes:**
- All students already have `profile_photo` (check database)
- Wrong `--class-id` specified
- No students in database

**Solution**: Run with `--dry-run` first to check

## Regenerating Avatars

To regenerate avatar for a student who already has one:

```sql
-- Remove existing photo
UPDATE students
SET profile_photo = NULL
WHERE name = 'Student Name';

-- Then run script
npx tsx scripts/generate-student-avatars-from-db.ts
```

Or regenerate for entire class:

```sql
UPDATE students
SET profile_photo = NULL
WHERE form_class_id = 'class-uuid';
```

## Comparison: Sample vs Real Student Avatars

| Feature | Sample Avatars | Real Student Avatars |
|---------|----------------|----------------------|
| **Script** | `generate-sample-avatars.ts` | `generate-student-avatars-from-db.ts` |
| **Data Source** | Hardcoded names | Supabase database |
| **Names Used** | Wei Ming, Aisha, Ravi, Emma, Arjun | Actual student names |
| **Storage** | `public/avatars/students/` | Supabase Storage |
| **Database Update** | No | Yes (`profile_photo` field) |
| **Purpose** | Fallback/demo | Production use |
| **Cost** | Free (placeholder) or $0.20 (AI) | $0.04 per student |
| **Generated Images** | 5 fixed avatars | Dynamic per student |

## Best Practices

1. **Start with dry run**
   ```bash
   npx tsx scripts/generate-student-avatars-from-db.ts --dry-run
   ```

2. **Test with small batch first**
   ```bash
   npx tsx scripts/generate-student-avatars-from-db.ts --limit=5
   ```

3. **Generate by class** (for better organization)
   ```bash
   npx tsx scripts/generate-student-avatars-from-db.ts --class-id=<id> --limit=30
   ```

4. **Monitor costs** - Check OpenAI usage dashboard

5. **Backup database** before bulk operations

## Next Steps

After generating avatars:
1. Check Supabase Storage bucket for uploaded images
2. Verify database records have `profile_photo` URLs
3. Test student profile pages to see avatars
4. Sample avatars will still be used for any students without photos

## See Also

- `AVATAR_GENERATION_GUIDE.md` - Complete avatar system guide
- `OPENAI_DALLE_SETUP.md` - How to enable DALL-E on your account
- `scripts/generate-sample-avatars.ts` - Sample avatar generation
- `public/avatars/README.md` - Sample avatars documentation
