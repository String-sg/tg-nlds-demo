# OpenAI Rate Limit Issue

## Current Status

Your OpenAI account has hit the rate limit for DALL-E image generation:
- **Limit**: 0 images per minute (indicates no quota or tier restriction)
- **Error**: `Rate limit exceeded for images per minute in organization`

## Solutions

### Option 1: Upgrade Your OpenAI Account (Recommended)

Visit [OpenAI Platform](https://platform.openai.com/account/limits) to:
1. Add credit to your account (minimum $5)
2. Upgrade to a paid tier
3. Wait for your tier limits to refresh

### Option 2: Use Pre-Made Placeholder Avatars

Instead of generating with AI, use free placeholder services:

1. **UI Avatars** (Free, no API key needed)
   ```
   https://ui-avatars.com/api/?name=Wei+Ming&size=256&background=random
   ```

2. **DiceBear** (Free, locally stored SVGs)
   ```
   https://api.dicebear.com/7.x/avataaars/svg?seed=WeiMing
   ```

3. **Boring Avatars** (Free, geometric patterns)
   ```
   https://source.boringavatars.com/beam/256/WeiMing
   ```

### Option 3: Download from Stock Photo Sites

Free stock photo sites with student images:
- **Unsplash**: https://unsplash.com/s/photos/student-portrait
- **Pexels**: https://www.pexels.com/search/student/
- **Pixabay**: https://pixabay.com/images/search/student/

Download 5 diverse student portraits and save them as:
- `public/avatars/students/sample-1.png`
- `public/avatars/students/sample-2.png`
- `public/avatars/students/sample-3.png`
- `public/avatars/students/sample-4.png`
- `public/avatars/students/sample-5.png`

### Option 4: Wait and Retry Later

If you just need to wait for rate limits to reset:

```bash
# Try again after 1 minute per image (5-10 minutes total)
npx tsx scripts/generate-sample-avatars.ts
```

The script will skip already-generated avatars, so you can run it multiple times.

## Rate Limits by Tier

| Tier | Images/Minute | Cost per Image |
|------|---------------|----------------|
| Free | 0-5 | $0.04 |
| Tier 1 | 5 | $0.04 |
| Tier 2 | 10 | $0.04 |
| Tier 3+ | 20+ | $0.04 |

## Alternative: Use the Placeholder Script

We've created a script that generates avatars using free services without OpenAI:

```bash
npx tsx scripts/generate-placeholder-avatars.ts
```

This will download avatars from free APIs and save them locally.
