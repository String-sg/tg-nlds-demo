# Explore Apps Content Update - Based on Wireframe

**Status**: In Progress
**Created**: October 30, 2025
**Reference**: Wireframe image showing complete app list

---

## Current Status

✅ **Completed:**
- Category names updated to match wireframe
- Category order updated
- Category descriptions updated
- Dialog placement fix applied

⚠️ **Partially Complete:**
- Some apps match wireframe (SDT Data Tool, Mark.ly, FormSG, LangBuddy, NotebookLM)
- Missing many apps from wireframe

❌ **To Do:**
- Add all missing apps from wireframe (25+ new apps)
- Remove apps not in wireframe
- Ensure app placement matches categories exactly

---

## Required App List (From Wireframe)

### 1. Recommended for you
**Context**: "Because it's an exam period"
- [ ] SDT Data Tool ✅ (exists but needs to be duplicated here)
- [ ] Mark.ly ✅ (exists but needs to be duplicated here)

### 2. Classes and students
- [ ] SDT Data Tool
- [ ] SEConnect (NEW - need to add)
- [ ] Attendance (SCM) (NEW - need to add)
- [ ] Mark.ly
- [ ] Appraiser (NEW - need to add)
- [ ] Teaching pal (AI assistant) (NEW - need to add)
- [ ] Student Development Integrated System (SDIS) (NEW - need to add)

### 3. Parents and communications
- [ ] All ears ✅ (exists)
- [ ] PG Messageages (NEW - need to add, note typo in wireframe)
- [ ] HeyTalia (NEW - need to add)

### 4. School life & Admin
Row 1:
- [ ] Allocate (NEW - need to add)
- [ ] RPA (Robotic Process Automation) (NEW - need to add)
- [ ] Student learning space (NEW - need to add)
- [ ] OnePlacement (OP) (NEW - need to add)
- [ ] GovEntry (NEW - need to add)

Row 2:
- [ ] iFAAS (NEW - need to add)
- [ ] iBENs (NEW - need to add)
- [ ] OneSchoolBus (OSB) (NEW - need to add)
- [ ] Timetable ✅ (exists)

### 5. Growth and community
- [ ] Glow (NEW - need to add)
- [ ] nLDS (NEW - need to add)
- [ ] Community (NEW - need to add)

### 6. Digital innovation and enhancements
Row 1:
- [ ] MIMS (NEW - need to add)
- [ ] iCON (NEW - need to add)
- [ ] SSOE: Secure Browser and Cloud PC (NEW - need to add)
- [ ] FormSG ✅ (exists)
- [ ] LangBuddy ✅ (exists)

Row 2:
- [ ] MS Teams (NEW - need to add)
- [ ] Google Chats (NEW - need to add)
- [ ] NotebookLM ✅ (exists)
- [ ] Gemini (NEW - need to add)

---

## Apps to Remove (Not in Wireframe)

Current apps that don't appear in wireframe:
- [ ] Record (not shown)
- [ ] Marking (not shown, only Mark.ly)
- [ ] Chat (not shown, replaced by Google Chats/MS Teams)
- [ ] Teach (not shown)
- [ ] Learn (not shown, functionality split into other apps)
- [ ] Assistant (not shown, replaced by Teaching pal)
- [ ] Termly checkin (not shown)

---

## Implementation Approach

### Option 1: Manual Data Entry (Recommended for Accuracy)
**Pros:**
- Most accurate, can carefully craft each app's data
- Can research real app information
- Better quality control

**Cons:**
- Time intensive (~2-3 hours for 25+ apps)
- Requires understanding each app

**Steps:**
1. Research each new app (check MOE/GovTech sites if available)
2. Write comprehensive taglines, descriptions, full descriptions
3. Add appropriate metadata, features, platforms
4. Assign appropriate icons and gradients
5. Test each app entry

### Option 2: Bulk Generation with Placeholders
**Pros:**
- Faster initial implementation
- Can refine later

**Cons:**
- May have generic/placeholder content
- Requires follow-up refinement

**Steps:**
1. Create all app entries with basic info
2. Use placeholder descriptions
3. Mark which apps need proper content
4. Refine over time

### Option 3: Hybrid Approach (Recommended)
**Pros:**
- Balance of speed and quality
- Prioritizes key apps

**Cons:**
- Still requires time

**Steps:**
1. **High Priority** - Apps users will likely click (SDT, Mark.ly, FormSG, etc):
   - Full comprehensive data
   - Research real information
   - Quality taglines and descriptions

2. **Medium Priority** - Common admin apps:
   - Good descriptions based on common knowledge
   - Appropriate metadata

3. **Low Priority** - Niche/less accessed apps:
   - Basic but accurate information
   - Can be enhanced later

---

## App Data Template

For each new app, we need:

```typescript
{
  key: 'unique-key',
  name: 'App Name',
  tagline: 'Short catchy phrase (5-7 words)',
  description: 'One sentence description',
  fullDescription: `2-3 paragraphs:
    - What it does
    - Key benefits
    - Who it's for / how it helps`,
  icon: LucideIcon,  // Choose appropriate icon
  category: 'Category Name',
  gradient: 'from-color-N00 to-color-N00',
  developer: {
    name: 'MOE Division / Company',
    website: 'URL if available',
    support: 'Support URL if available',
  },
  metadata: {
    rating: 4.X,  // Between 4.0-4.9
    ratingCount: XXX,  // Realistic number
    ageRating: '4+',  // Usually 4+
    chartPosition: XX,  // 1-35
    chartCategory: 'Category',  // Education, Productivity, etc.
    languages: ['EN', 'ZH', 'MS', 'TA'],
    size: 'XX MB',  // Realistic size
  },
  features: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
    'Feature 4',
    'Feature 5',
  ],
  platforms: ['Web', 'iPad', 'iPhone', 'Mac', 'Android'],
  inAppPurchases: false,  // Usually false for MOE apps
  thirdParty: false,  // true for non-MOE apps
}
```

---

## Icon Suggestions

New icons needed (already imported):
- `Users` - For user/community apps (SEConnect, nLDS, Community)
- `Briefcase` - For professional/admin apps (Appraiser, iBENs)
- `School` - For education management (SDIS, OSB)
- `Building2` - For facility management (Allocate)
- `DollarSign` - For financial apps (iFAAS)
- `TrendingUp` - For growth/analytics (Glow)
- `Globe` - For web services (iCON)
- `Shield` - For security apps (SSOE, GovEntry)
- `MonitorSmartphone` - For device management (MIMS)
- `Video` - For video conferencing (MS Teams)
- `MessageCircle` - For messaging (HeyTalia, Google Chats)
- `Bot` - For AI assistants (RPA, Teaching pal)

---

## Testing Checklist

After adding all apps:
- [ ] All 6 categories display correctly
- [ ] Apps are in correct categories
- [ ] No duplicate keys
- [ ] All required fields present
- [ ] Icons display properly
- [ ] Gradients look good
- [ ] Click to detail works for all apps
- [ ] Search finds all apps
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] Mobile responsive layout works

---

## Next Steps

1. **Immediate** (Already Done):
   - ✅ Update category structure
   - ✅ Fix category order
   - ✅ Update category descriptions

2. **High Priority**:
   - Add Recommended section apps (SDT, Mark.ly duplicates)
   - Add key missing apps (SEConnect, Teaching pal, HeyTalia, etc.)
   - Remove apps not in wireframe

3. **Medium Priority**:
   - Complete all admin apps (Allocate, RPA, iFAAS, etc.)
   - Add all digital innovation apps

4. **Finalization**:
   - Review all app data for accuracy
   - Test all functionality
   - Update documentation

---

## Notes

- The wireframe shows ~30+ apps across 6 categories
- Current implementation has ~13 apps across 3 categories
- Need to add ~25 new apps and reorganize existing ones
- Some apps appear in multiple categories (SDT Data Tool, Mark.ly)
- Third-party apps: MS Teams, Google Chats, NotebookLM, Gemini, LangBuddy
- MOE apps should have @moe.gov.sg domains
- GovTech apps should have @gov.sg domains

---

## Estimated Effort

- **High Priority Apps** (7 apps): 1-2 hours
- **Medium Priority Apps** (10 apps): 2-3 hours
- **Low Priority Apps** (10+ apps): 2-3 hours
- **Testing & Refinement**: 1 hour

**Total**: 6-9 hours of focused work

---

## Success Criteria

✅ All apps from wireframe are present
✅ No apps absent from wireframe remain
✅ Categories match wireframe exactly
✅ App order within categories matches
✅ All apps have quality content
✅ Dialog detail view works for all apps
✅ Search functionality works
✅ Mobile/tablet responsive
✅ TypeScript strict mode passes
✅ Build succeeds

---

## Resources Needed

- Wireframe images (provided) ✅
- Access to real app information (MOE/GovTech sites) if available
- Icon library (lucide-react) ✅
- Time for content writing

---

**This is a significant content update task that requires dedicated time for quality implementation. The structural foundation is complete; what remains is comprehensive content authoring.**
