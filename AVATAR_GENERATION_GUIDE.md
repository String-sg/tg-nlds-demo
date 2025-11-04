# Student Avatar Generation Guide

## Overview

This guide explains how to generate and use student avatars in the application. We support both AI-generated photorealistic avatars (via OpenAI DALL-E 3) and free placeholder avatars (via DiceBear API).

## Two Types of Avatar Generation

### 1. Sample Avatars (Demo/Fallback) ⚡
- **Purpose**: Placeholder avatars for students without photos
- **Script**: `scripts/generate-sample-avatars.ts` or `scripts/generate-placeholder-avatars.ts`
- **Storage**: `public/avatars/students/` (local files)
- **Names**: Hardcoded (Wei Ming, Aisha, Ravi, Emma, Arjun)
- **Cost**: Free (placeholder) or $0.20 (AI, 5 images)
- **Usage**: Automatic fallback in the app

### 2. Real Student Avatars (Production) ⭐
- **Purpose**: Generate avatars for actual students in your database
- **Script**: `scripts/generate-student-avatars-from-db.ts`
- **Storage**: Supabase Storage (`student-photos` bucket)
- **Names**: Real student data from database
- **Cost**: $0.04 per student
- **Usage**: Updates `profile_photo` field in database

👉 **See [GENERATE_REAL_STUDENT_AVATARS.md](./GENERATE_REAL_STUDENT_AVATARS.md) for detailed guide on generating real student avatars**

## Current Setup

✅ **5 Sample avatars generated** and stored in `public/avatars/students/`
- Sample 1: Wei Ming (Chinese, Male, 11)
- Sample 2: Aisha (Malay, Female, 12)
- Sample 3: Ravi (Indian, Male, 11)
- Sample 4: Emma (Chinese, Female, 12)
- Sample 5: Arjun (Indian, Male, 11)

## Quick Start

### Using Existing Avatars

```tsx
import { getStudentAvatarUrl } from '@/lib/avatars/sample-avatars'

function StudentProfile({ student }) {
  const avatarUrl = getStudentAvatarUrl(
    student.profile_photo,    // Student's actual photo (if any)
    student.gender,            // For fallback matching
    student.nationality        // For fallback matching
  )

  return <img src={avatarUrl} alt={student.name} />
}
```

### Direct Image Usage

```tsx
<img src="/avatars/students/sample-1.png" alt="Wei Ming" className="size-12 rounded-full" />
```

## Two Avatar Generation Methods

### Method 1: Free Placeholder Avatars (Current)

**Pros:**
- ✅ Completely free
- ✅ No API key needed
- ✅ Instant generation
- ✅ Unlimited usage

**Cons:**
- ❌ Cartoon-style (not photorealistic)
- ❌ Limited customization

**Usage:**
```bash
npx tsx scripts/generate-placeholder-avatars.ts
```

### Method 2: AI-Generated Photorealistic Avatars

**Pros:**
- ✅ Photorealistic quality
- ✅ Highly customizable
- ✅ Professional appearance

**Cons:**
- ❌ Costs $0.04 per image
- ❌ Requires OpenAI API credit
- ❌ Rate limited (5-20 images/minute depending on tier)

**Current Status:**
⚠️ **OpenAI rate limit reached** - Your account has no quota for image generation.

**To use AI generation:**
1. Add credit to your OpenAI account at https://platform.openai.com/account/billing
2. Minimum $5 deposit recommended
3. Run the generation script:
   ```bash
   npx tsx scripts/generate-sample-avatars.ts
   ```

## File Structure

```
public/
└── avatars/
    ├── README.md                      # Avatar documentation
    ├── RATE_LIMIT_INFO.md            # OpenAI rate limit info
    └── students/
        ├── sample-1.png              # Wei Ming avatar
        ├── sample-2.png              # Aisha avatar
        ├── sample-3.png              # Ravi avatar
        ├── sample-4.png              # Emma avatar
        ├── sample-5.png              # Arjun avatar
        └── metadata.json             # Avatar metadata

src/
├── lib/
│   └── avatars/
│       └── sample-avatars.ts         # Avatar utility functions
└── components/
    └── examples/
        └── student-avatar-example.tsx # Usage examples

scripts/
├── generate-sample-avatars.ts        # AI generation (requires OpenAI credit)
└── generate-placeholder-avatars.ts   # Free placeholder generation
```

## Available Utility Functions

### `getStudentAvatarUrl(photo, gender, ethnicity)`
Returns student's photo or matching fallback avatar.

```tsx
const url = getStudentAvatarUrl(
  student.profile_photo,  // string | null | undefined
  student.gender,         // 'male' | 'female' | 'other' | undefined
  student.nationality     // string | undefined
)
```

### `getRandomSampleAvatar()`
Returns a random sample avatar.

```tsx
const avatar = getRandomSampleAvatar()
// { id, name, gender, ethnicity, age, imagePath }
```

### `getSampleAvatarById(id)`
Get specific avatar by ID.

```tsx
const avatar = getSampleAvatarById('sample-1')
```

### `getSampleAvatarsByGender(gender)`
Filter avatars by gender.

```tsx
const maleAvatars = getSampleAvatarsByGender('male')
const femaleAvatars = getSampleAvatarsByGender('female')
```

### `getMatchingSampleAvatar({ gender, ethnicity })`
Get avatar matching criteria.

```tsx
const avatar = getMatchingSampleAvatar({
  gender: 'female',
  ethnicity: 'Chinese'
})
```

## Usage Examples

### Example 1: Basic Student Card

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getStudentAvatarUrl } from '@/lib/avatars/sample-avatars'

function StudentCard({ student }) {
  const avatarUrl = getStudentAvatarUrl(
    student.profile_photo,
    student.gender,
    student.nationality
  )

  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src={avatarUrl} alt={student.name} />
        <AvatarFallback>{student.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h3>{student.name}</h3>
        <p>{student.gender}, {student.age} years old</p>
      </div>
    </div>
  )
}
```

### Example 2: Avatar Gallery

```tsx
import { SAMPLE_AVATARS } from '@/lib/avatars/sample-avatars'

function AvatarGallery() {
  return (
    <div className="flex gap-4">
      {SAMPLE_AVATARS.map(avatar => (
        <img
          key={avatar.id}
          src={avatar.imagePath}
          alt={avatar.name}
          className="size-16 rounded-full"
        />
      ))}
    </div>
  )
}
```

### Example 3: Random Avatar

```tsx
import { getRandomSampleAvatar } from '@/lib/avatars/sample-avatars'

function RandomAvatar() {
  const avatar = getRandomSampleAvatar()
  return <img src={avatar.imagePath} alt={avatar.name} />
}
```

## Regenerating Avatars

### Regenerate All Avatars (Free)
```bash
# Delete existing avatars
rm -rf public/avatars/students/*.png

# Generate new ones
npx tsx scripts/generate-placeholder-avatars.ts
```

### Regenerate Specific Avatar
```bash
# Delete specific file
rm public/avatars/students/sample-1.png

# Run script - it will skip existing ones
npx tsx scripts/generate-placeholder-avatars.ts
```

### Switch to AI-Generated Avatars

1. **Add OpenAI credit:**
   - Visit https://platform.openai.com/account/billing
   - Add minimum $5 credit

2. **Delete placeholder avatars:**
   ```bash
   rm public/avatars/students/*.png
   ```

3. **Generate AI avatars:**
   ```bash
   npx tsx scripts/generate-sample-avatars.ts
   ```

4. **Cost:** $0.04 × 5 avatars = **$0.20 total**

## Adding More Avatars

### Edit the Sample Students List

Open `scripts/generate-placeholder-avatars.ts` (or `generate-sample-avatars.ts`) and add to the array:

```typescript
const sampleStudents: SampleStudent[] = [
  // ... existing students
  {
    id: 'sample-6',
    name: 'New Student',
    gender: 'female',
    ethnicity: 'Malay',
    age: 11,
  },
]
```

Then run the script to generate the new avatar.

### Update the Utility Functions

Don't forget to update `src/lib/avatars/sample-avatars.ts` with the new avatar:

```typescript
export const SAMPLE_AVATARS: SampleAvatar[] = [
  // ... existing avatars
  {
    id: 'sample-6',
    name: 'New Student',
    gender: 'female',
    ethnicity: 'Malay',
    age: 11,
    imagePath: '/avatars/students/sample-6.png',
  },
]
```

## Best Practices

1. **Always use the utility functions** instead of hardcoding paths
2. **Commit generated avatars to Git** so the team can reuse them
3. **Use sample avatars for demos** to avoid repeated API costs
4. **Provide fallback** with AvatarFallback component
5. **Store one-time generated avatars** in the public folder for reuse

## Costs Comparison

| Method | Setup Cost | Per Image | 5 Avatars | 100 Avatars |
|--------|------------|-----------|-----------|-------------|
| Placeholder (DiceBear) | $0 | $0 | $0 | $0 |
| AI (DALL-E 3) | $5 min | $0.04 | $0.20 | $4.00 |

## Troubleshooting

### Issue: OpenAI Rate Limit Error

**Error:** `Rate limit exceeded for images per minute`

**Solutions:**
1. Add credit to OpenAI account
2. Use placeholder avatars instead (free)
3. Wait for rate limit to reset
4. Upgrade OpenAI tier for higher limits

### Issue: Avatars Not Showing

**Check:**
1. Files exist in `public/avatars/students/`
2. Path starts with `/avatars/students/` (not `public/`)
3. Next.js dev server is running
4. Browser cache cleared

### Issue: Want Different Avatar Style

**Options:**
1. **DiceBear styles:** Change in `generate-placeholder-avatars.ts`
   - `avataaars` (current - Bitmoji-style)
   - `bottts` (robot style)
   - `personas` (abstract faces)
   - `lorelei` (illustrated portraits)

2. **Custom prompts:** Edit `buildStudentPortraitPrompt()` in `generate-sample-avatars.ts`

## See Also

- `/public/avatars/README.md` - Avatar directory documentation
- `/public/avatars/RATE_LIMIT_INFO.md` - OpenAI rate limit details
- `/src/components/examples/student-avatar-example.tsx` - Usage examples
- [DiceBear API Documentation](https://dicebear.com)
- [OpenAI Image Generation Guide](https://platform.openai.com/docs/guides/images)
