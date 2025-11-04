# Sample Student Avatars

This directory contains pre-generated AI student avatars for use in development, demos, and as fallback images.

## Directory Structure

```
avatars/
└── students/
    ├── sample-1.png    # Wei Ming (Chinese, Male, 11)
    ├── sample-2.png    # Aisha (Malay, Female, 12)
    ├── sample-3.png    # Ravi (Indian, Male, 11)
    ├── sample-4.png    # Emma (Chinese, Female, 12)
    ├── sample-5.png    # Arjun (Indian, Male, 11)
    └── metadata.json   # Avatar metadata
```

## Generation

Avatars are generated using OpenAI DALL-E 3 API. To regenerate or add more:

```bash
npx tsx scripts/generate-sample-avatars.ts
```

**Note:** This will skip existing avatars. Delete files to regenerate specific ones.

## Usage in Components

### Direct Usage

```tsx
// Simple image tag
<img src="/avatars/students/sample-1.png" alt="Student avatar" className="size-10 rounded-full" />
```

### Using Utility Functions

```tsx
import { getStudentAvatarUrl, getRandomSampleAvatar } from '@/lib/avatars/sample-avatars'

// Get student avatar with fallback to sample
function StudentCard({ student }) {
  const avatarUrl = getStudentAvatarUrl(
    student.profile_photo,
    student.gender,
    student.nationality
  )

  return <img src={avatarUrl} alt={student.name} />
}

// Get a random sample avatar
function RandomAvatar() {
  const avatar = getRandomSampleAvatar()
  return <img src={avatar.imagePath} alt={avatar.name} />
}
```

### Available Utility Functions

- `getRandomSampleAvatar()` - Get any random avatar
- `getSampleAvatarById(id)` - Get specific avatar by ID
- `getSampleAvatarsByGender(gender)` - Filter by gender
- `getMatchingSampleAvatar({ gender, ethnicity })` - Get matching avatar
- `getStudentAvatarUrl(photo, gender, ethnicity)` - Get student photo or fallback

## Avatar Details

| ID | Name | Gender | Ethnicity | Age | Path |
|----|------|--------|-----------|-----|------|
| sample-1 | Wei Ming | Male | Chinese | 11 | `/avatars/students/sample-1.png` |
| sample-2 | Aisha | Female | Malay | 12 | `/avatars/students/sample-2.png` |
| sample-3 | Ravi | Male | Indian | 11 | `/avatars/students/sample-3.png` |
| sample-4 | Emma | Female | Chinese | 12 | `/avatars/students/sample-4.png` |
| sample-5 | Arjun | Male | Indian | 11 | `/avatars/students/sample-5.png` |

## Cost

- Each DALL-E 3 image: $0.04 (standard quality, 1024x1024)
- Total for 5 avatars: $0.20
- These avatars can be reused indefinitely without additional cost

## Best Practices

1. **Always use sample avatars for demos** - Don't generate new images repeatedly
2. **Use the utility functions** - They handle fallback logic automatically
3. **Respect rate limits** - When generating new avatars, script includes 2s delay between requests
4. **Store in public folder** - These are static assets, not user data
5. **Version control** - Commit generated avatars to Git so team can reuse

## Regeneration

To regenerate all avatars:

```bash
# Delete existing avatars
rm -rf public/avatars/students/*.png

# Regenerate
npx tsx scripts/generate-sample-avatars.ts
```

To add more avatars, edit `scripts/generate-sample-avatars.ts` and add to `sampleStudents` array.
