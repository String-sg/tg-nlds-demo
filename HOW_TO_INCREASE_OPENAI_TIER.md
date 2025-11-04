# How to Increase Your OpenAI Tier for DALL-E Access

## Current Situation

Your OpenAI account:
- ✅ Has $100 credit
- ✅ API key is valid
- ✅ GPT models work
- ❌ **Tier 0** - DALL-E disabled (0 images/min)

## Goal

Upgrade to **Tier 1** or higher to enable DALL-E 3 image generation.

---

## Method 1: Check & Add Payment Method (Most Common Issue)

### Step 1: Verify Payment Method

1. Go to: https://platform.openai.com/account/billing/payment-methods
2. Check if you have a **valid credit card** added
3. If not, click **"Add payment method"**

### Step 2: Add Credit (If Needed)

1. Go to: https://platform.openai.com/account/billing/overview
2. Click **"Add credits"**
3. Add **minimum $5** (you said you have $100, so this might already be done)
4. Confirm payment

**Important**: Having a credit balance is NOT the same as having spent money on API calls.

---

## Method 2: Establish API Usage History

New accounts need to **actually use the API** before tier upgrades.

### Option A: Make Multiple API Calls

Run this script to establish usage:

```bash
npx tsx scripts/establish-openai-usage.ts
```

This will:
- Make 10-20 GPT API calls
- Cost approximately $0.01 - $0.05
- Establish usage history
- Help trigger tier upgrade

### Option B: Use Your App Features

Use any OpenAI-powered features in your app:
- Chat with AI assistant
- Generate any content using GPT
- Use the `/ptm` prompt feature
- Any feature that calls OpenAI API

Cost: ~$0.01 per session

---

## Method 3: Contact OpenAI Support (Fastest)

If you've paid $100 but still have Tier 0, contact support:

### Step 1: Submit Support Request

1. Visit: https://help.openai.com/en/
2. Click **"Contact Us"** (bottom right chat icon)
3. Select: **API** → **Account & Billing**

### Step 2: Use This Template

```
Subject: Please Upgrade My Tier - Have $100 Credit But DALL-E Disabled

Hello,

I have added $100 credit to my OpenAI account but I'm still on Tier 0
with no DALL-E image generation access (0 images/minute).

Account Details:
- Organization ID: org-GFUeJVtgpNt0whiDT43kPVme
- Project ID: proj_eeAATzcg6kc2KYDUhwFnXZoP
- Credit Balance: $100
- Current Tier: Tier 0
- Issue: DALL-E 3 showing rate limit "0/1min"

Request:
Please upgrade my account to Tier 1 or higher to enable DALL-E access.
I need to generate student portrait images for my education application.

I have already:
- ✅ Added payment method
- ✅ Added $100 credit
- ✅ Made successful GPT API calls
- ❌ Still cannot use DALL-E (0 images/min limit)

Please investigate why my tier hasn't upgraded automatically.

Thank you!
```

**Expected Response Time**: 1-3 business days

---

## Method 4: Wait for Automatic Upgrade

After first payment, OpenAI typically upgrades tiers automatically:

- **Tier 0 → Tier 1**: Usually **instant** to **24 hours** after first payment
- **Tier 1 → Tier 2**: 7 days after spending $50
- **Tier 2 → Tier 3**: 7 days after spending $100

### If You Just Added Credit:

Wait **24 hours** and check again:
```bash
npx tsx scripts/test-openai-connection.ts
```

---

## Verification Steps

### Check Your Current Tier

1. Visit: https://platform.openai.com/account/limits
2. Look for:
   ```
   Usage tier: Tier X
   Images per minute: X
   ```

### Expected After Upgrade:

```
Usage tier: Tier 1
Images per minute: 5
RPM (requests per minute): 500
TPM (tokens per minute): 200,000
```

---

## Troubleshooting

### Issue 1: "I have $100 credit but still Tier 0"

**Problem**: Having a credit balance ≠ having spent money on API calls

**Solution**:
1. Make actual API calls (use the app or run test script)
2. Check if payment method is verified
3. Contact support if credit was added 24+ hours ago

### Issue 2: "Payment method declined"

**Solution**:
1. Check card is valid and has funds
2. Use a different credit card
3. Try PayPal if available
4. Contact your bank (they might block OpenAI charges)

### Issue 3: "Still Tier 0 after 48 hours"

**Solution**:
1. Contact OpenAI support immediately (Method 3 above)
2. Include payment confirmation/receipt
3. Ask for manual tier upgrade

### Issue 4: "I'm outside the US"

**Problem**: Some countries have restrictions

**Solution**:
1. Check: https://platform.openai.com/docs/supported-countries
2. Use VPN if needed (not recommended)
3. Contact support for country-specific issues

---

## Quick Reference: What Each Tier Gets

| Feature | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|--------|--------|--------|--------|--------|
| **Requirements** | Free | $5 paid | $50 + 7d | $100 + 7d | $500 + 14d |
| **DALL-E 3 (images/min)** | 0 ❌ | 5 ✅ | 10 ✅ | 20 ✅ | 30 ✅ |
| **GPT-4 (RPM)** | 500 | 5,000 | 5,000 | 10,000 | 10,000 |
| **Cost per image** | N/A | $0.04 | $0.04 | $0.04 | $0.04 |

---

## After Tier Upgrade

Once you see `Images per minute: 5` or higher:

```bash
# Test DALL-E access
npx tsx scripts/test-openai-connection.ts

# Generate 5 test avatars
npx tsx scripts/generate-student-avatars-from-db.ts --limit=5

# Generate all student avatars
npx tsx scripts/generate-student-avatars-from-db.ts --limit=50
```

---

## Important Notes

⚠️ **Credit ≠ Tier Upgrade**
- Adding $100 credit does NOT automatically upgrade tier
- You must SPEND money on API calls (even $0.01)
- Tier upgrades based on **actual usage**, not credit balance

⚠️ **Time Requirements**
- Tier 1: Immediate (after first payment + usage)
- Tier 2+: Requires 7-14 days waiting period

⚠️ **Payment Verification**
- Some banks block OpenAI charges
- Use a card that allows international transactions
- Check your bank statement for pending charges

---

## Recommended Action Plan

**Day 1 (Today):**
1. ✅ Check payment method is added
2. ✅ Run test script to establish usage
3. ✅ Submit support ticket (Method 3)

**Day 2:**
4. ✅ Check tier status
5. ✅ If still Tier 0, follow up with support

**Day 3-7:**
6. ✅ Wait for support response or automatic upgrade

**After Upgrade:**
7. ✅ Run test script to confirm DALL-E access
8. ✅ Generate student avatars!

---

## Support Resources

- **Limits Dashboard**: https://platform.openai.com/account/limits
- **Usage Dashboard**: https://platform.openai.com/usage
- **Billing**: https://platform.openai.com/account/billing/overview
- **Help Center**: https://help.openai.com/en/
- **Rate Limits Guide**: https://platform.openai.com/docs/guides/rate-limits
- **Status Page**: https://status.openai.com/

---

## Alternative: Use Free Placeholder Avatars

While waiting for tier upgrade, your app works perfectly with:
- ✅ Free cartoon-style avatars (DiceBear API)
- ✅ Sample avatars as fallbacks
- ✅ Initials for all students

No functionality is lost - only the photorealistic AI generation requires tier upgrade.
