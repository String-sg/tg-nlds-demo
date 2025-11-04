# How to Enable DALL-E 3 Image Generation

## Current Issue

Your OpenAI account shows:
```
Rate limit exceeded for images per minute
Limit: 0/1min. Current: 1/1min
```

This means **DALL-E is not enabled** on your account, even though you have $100 credit.

## Why This Happens

OpenAI has different rate limits for different usage tiers:

| Tier | DALL-E Images/Min | How to Get It |
|------|-------------------|---------------|
| **Free** | 0 | Default (no DALL-E access) |
| **Tier 1** | 5 | $5+ paid, some API usage |
| **Tier 2** | 10 | $50+ paid + 7 days |
| **Tier 3** | 20 | $100+ paid + 7 days |
| **Tier 4** | 30 | $500+ paid + 14 days |

Your account is currently on the **Free tier**, which has **0 DALL-E access**.

## Steps to Enable DALL-E 3

### Step 1: Check Your Current Tier

1. Go to: https://platform.openai.com/account/limits
2. Look for "Usage tier" section
3. Check your current tier and DALL-E limits

### Step 2: Verify Payment Method

1. Go to: https://platform.openai.com/account/billing/overview
2. Click "Payment methods"
3. Ensure you have a valid credit card added
4. Check that your balance shows the $100 credit

### Step 3: Make Initial API Calls (To Unlock Tier 1)

You need to:
1. **Add at least $5 to your account** (you said you have $100, so this should be done)
2. **Make some API calls** to establish usage history
3. **Wait for automatic tier upgrade** (usually happens within a few hours)

To establish usage, you can:
```bash
# Make a few GPT API calls first (these usually work on all tiers)
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Step 4: Contact OpenAI Support (If Needed)

If you've added $100 and still have Tier 0 after 24 hours:

1. Go to: https://help.openai.com/en/
2. Click "Contact Us" in bottom right
3. Select "API" > "Account & Billing"
4. Explain:
   ```
   I have $100 credit in my account but my usage tier shows Tier 0
   with 0 DALL-E images/minute limit. I need DALL-E 3 access enabled.

   Organization ID: org-GFUeJVtgpNt0whiDT43kPVme
   Project ID: proj_eeAATzcg6kc2KYDUhwFnXZoP
   ```

### Step 5: Wait for Tier Upgrade

- **Tier 1** (5 images/min): Available immediately after $5+ payment
- Usually takes **1-24 hours** after first payment
- Check your limits page for updates

## Alternative: Manual Photo Upload

While waiting for DALL-E access, you can:

### Option 1: Download Reference-Style Photos

Based on your reference images (Singapore school style), download similar photos from:

1. **Unsplash** (free): https://unsplash.com/s/photos/student-portrait
2. **Pexels** (free): https://www.pexels.com/search/asian-student/
3. **Pixabay** (free): https://pixabay.com/images/search/student-portrait/

Search for:
- "asian student portrait"
- "singapore student"
- "school id photo"
- "student headshot"

### Option 2: Use AI Stock Photo Services

These services have pre-generated photorealistic faces:

1. **This Person Does Not Exist**: https://thispersondoesnotexist.com/
   - Free, photorealistic AI faces
   - Refresh for different faces
   - Right-click to save

2. **Generated Photos**: https://generated.photos/
   - AI-generated diverse faces
   - Free tier available
   - Filtered by age, ethnicity, gender

### Option 3: Commission from Freelance Designers

On Fiverr or Upwork:
- Search "AI portrait generation"
- Cost: $5-20 for 5 portraits
- Provide your reference images
- Get photorealistic results in 1-2 days

## Once DALL-E is Enabled

After your account is upgraded to Tier 1+:

```bash
# Delete placeholder avatars
rm public/avatars/students/*.png

# Generate photorealistic avatars
npx tsx scripts/generate-sample-avatars.ts
```

**Cost**: $0.04 × 5 = **$0.20 total**

## Checking Your Tier Status

Run this check periodically:

```bash
curl https://api.openai.com/v1/organization/limits \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Or visit: https://platform.openai.com/account/limits

## Troubleshooting

### Issue: "You do not have access to this model"

**Solution**: Your API key doesn't have DALL-E permissions
- Regenerate API key in project settings
- Ensure it's created under the correct organization

### Issue: "Billing hard limit reached"

**Solution**: Increase your billing limit
1. Go to: https://platform.openai.com/account/billing/limits
2. Increase "Hard limit" (default is $100/month)

### Issue: "Invalid organization"

**Solution**: Your `.env` has wrong org ID
1. Go to: https://platform.openai.com/account/organization
2. Copy correct Organization ID
3. Update `OPENAI_ORG_ID` in `.env`

## Current Workaround

For now, you have **cartoon-style placeholder avatars** generated for free.

To upgrade to photorealistic:
1. Wait for OpenAI tier upgrade (1-24 hours)
2. OR download photos manually (see alternatives above)
3. OR use the placeholder avatars (they work fine!)

## Need Help?

- **OpenAI Support**: https://help.openai.com
- **API Status**: https://status.openai.com
- **Documentation**: https://platform.openai.com/docs/guides/images
