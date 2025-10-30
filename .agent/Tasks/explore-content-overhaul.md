# Explore Page Content Overhaul

**Date:** 2025-10-30
**Status:** Planning
**Priority:** High

## Overview

Complete overhaul of the /explore page app catalog to match the new wireframe designs. This involves restructuring categories, removing old apps, and adding 25+ new education apps.

## Current State Analysis

### Current Categories (3)
1. **Teacher workspace apps** (7 apps): Record, Marking, Timetable, Chat, Teach, Learn, Assistant
2. **Connected apps** (3 apps): All Ears, Termly Check-in, FormSG
3. **More teaching tools** (3 apps): LangBuddy, Mark.ly, NotebookLM

**Total Current Apps:** 13

### Target State (from Wireframes)

### Target Categories (6)
1. **Recommended for you** - "Because it&apos;s an exam period" (2 apps)
2. **Classes and students** - Tools for classroom management and student support (7 apps)
3. **Parents and communications** - Parent engagement and communication tools (3 apps)
4. **School life & Admin** - Administrative and operational systems (9 apps)
5. **Growth and community** - Professional development and community platforms (3 apps)
6. **Digital innovation and enhancements** - Digital tools and productivity platforms (9 apps)

**Total Target Apps:** 33 apps (some apps appear in multiple categories)

## Gap Analysis

### Apps to KEEP (6 apps)
- ✅ All Ears → moves to "Parents and communications"
- ✅ FormSG → moves to "Digital innovation and enhancements"
- ✅ LangBuddy → moves to "Digital innovation and enhancements"
- ✅ Mark.ly → appears in "Recommended for you" AND "Classes and students"
- ✅ NotebookLM → moves to "Digital innovation and enhancements"
- ✅ Timetable → moves to "School life & Admin"

### Apps to REMOVE (7 apps)
- ❌ Record
- ❌ Marking
- ❌ Chat
- ❌ Teach
- ❌ Learn
- ❌ Assistant
- ❌ Termly Check-in

### Apps to ADD (25 new apps)

#### Recommended for you (1 new)
1. **SDT Data Tool** (also appears in "Classes and students")

#### Classes and students (6 new)
2. **SEConnect** - Student engagement and connection platform
3. **Attendance (SCM)** - School Cockpit Management attendance system
4. **Appraiser** - Student appraisal and assessment tool
5. **Teaching pal (AI assistant)** - AI teaching assistant
6. **Student Development Integrated System (SDIS)** - Comprehensive student development tracking

#### Parents and communications (2 new)
7. **PG Messagees** - Parent-teacher messaging platform
8. **HeyTalia** - Parent communication and engagement tool

#### School life & Admin (8 new)
9. **Allocate** - Resource allocation and scheduling
10. **RPA (Robotic Process Automation)** - Process automation platform
11. **Student learning space** - Digital learning environment
12. **OnePlacement (OP)** - Student placement and tracking system
13. **GovEntry** - Government system access portal
14. **iFAAS** - Finance and accounting system
15. **iBENs** - Benefits and entitlements system
16. **OneSchoolBus (OSB)** - School transport management

#### Growth and community (3 new)
17. **Glow** - Professional learning and growth platform
18. **nLDS** - National Learning Design System
19. **Community** - Community engagement platform

#### Digital innovation and enhancements (5 new)
20. **MIMS** - Management information system
21. **iCON** - Integrated communication and collaboration platform
22. **SSOE: Secure Browser and Cloud PC** - Secure browsing and cloud computing
23. **MS Teams** - Microsoft Teams collaboration
24. **Google Chats** - Google Chat communication
25. **Gemini** - Google&apos;s AI assistant

## Implementation Plan

### Phase 1: Data Structure Preparation
**Estimated Time:** 2 hours

1. **Research app information** (1 hour)
   - Research each of the 25 new apps
   - Gather information about their purpose, features, and metadata
   - Identify official websites and support resources
   - Determine appropriate icons from lucide-react

2. **Define category structure** (30 min)
   - Update `categoryDescriptions` object with 6 new categories
   - Define category order in `appsByCategory`
   - Choose appropriate category icons

3. **Create app data template** (30 min)
   - Create standardized template for new app entries
   - Define default values for missing metadata
   - Establish naming conventions

### Phase 2: Content Authoring
**Estimated Time:** 6-8 hours

For each of the 25 new apps, author:
- `name`: Official app name
- `tagline`: One-line value proposition (5-10 words)
- `description`: Short description (1-2 sentences)
- `fullDescription`: Detailed description (2-3 paragraphs)
- `category`: Primary category
- `icon`: Appropriate lucide-react icon
- `gradient`: Tailwind gradient colors
- `thirdParty`: Boolean flag
- `developer`: Name, website, support URL
- `metadata`: Rating, age rating, languages, size
- `features`: 3-5 key features
- `platforms`: Supported platforms

**Breakdown:**
- ~20 minutes per app × 25 apps = 8.3 hours
- Can be reduced with batch processing and templates

### Phase 3: Code Implementation
**Estimated Time:** 2 hours

1. **Update category structure** (30 min)
   - Update `categoryDescriptions` object
   - Update `appsByCategory` array
   - Add new category icons

2. **Add new apps** (1 hour)
   - Add 25 new app objects to `apps` array
   - Ensure all required fields are populated
   - Verify icon imports

3. **Remove old apps** (15 min)
   - Remove 7 apps not in wireframes
   - Clean up unused icon imports
   - Update app count

4. **Handle duplicate apps** (15 min)
   - Handle SDT Data Tool appearing in 2 categories
   - Handle Mark.ly appearing in 2 categories
   - Ensure consistent data across duplicates

### Phase 4: Testing & Validation
**Estimated Time:** 1 hour

1. **Visual testing** (30 min)
   - Verify all categories render correctly
   - Check card layout and spacing
   - Test dialog opening for each app
   - Verify gradient colors and icons

2. **Data validation** (30 min)
   - Ensure all apps have required fields
   - Check for TypeScript errors
   - Verify no broken icon imports
   - Test search/filter functionality (if exists)

### Phase 5: Documentation
**Estimated Time:** 30 min

1. Update `.agent/System/` docs with new app catalog structure
2. Update this task file with completion status
3. Document any deviations from wireframes
4. Create app catalog reference document

## Data Requirements

### App Data Template

```typescript
{
  key: 'app-name',
  name: 'App Name',
  tagline: 'One-line value proposition',
  description: 'Short 1-2 sentence description',
  fullDescription: 'Detailed 2-3 paragraph description explaining features, benefits, and use cases.',
  icon: IconName,
  category: 'Category Name',
  gradient: 'from-color-500 to-color-700',
  thirdParty: false, // or true
  developer: {
    name: 'Developer Name',
    website: 'https://developer.com',
    support: 'https://developer.com/support',
  },
  metadata: {
    rating: 4.5,
    ratingCount: 1200,
    ageRating: '4+',
    chartPosition: 15,
    chartCategory: 'Education',
    languages: ['EN', 'ZH', 'MS', 'TA'],
    size: '50 MB',
  },
  features: [
    'Feature 1 description',
    'Feature 2 description',
    'Feature 3 description',
  ],
  platforms: ['Web', 'iPad', 'iPhone'],
  inAppPurchases: false,
}
```

### Category Descriptions

```typescript
const categoryDescriptions: Record<string, string> = {
  'Recommended for you': "Because it's an exam period",
  'Classes and students': 'Tools for classroom management, student assessment, and academic support',
  'Parents and communications': 'Connect with parents and manage school-home communication',
  'School life & Admin': 'Administrative tools and school management systems',
  'Growth and community': 'Professional development and community engagement platforms',
  'Digital innovation and enhancements': 'Cutting-edge digital tools and productivity enhancers',
}
```

## Success Criteria

- [ ] All 6 categories are implemented
- [ ] All 25 new apps are added with complete data
- [ ] All 7 old apps are removed
- [ ] Apps appear in correct categories matching wireframes
- [ ] Duplicate apps (SDT Data Tool, Mark.ly) handled correctly
- [ ] All app cards render correctly with icons and gradients
- [ ] Dialog opens and displays app details for all apps
- [ ] No TypeScript errors
- [ ] All icon imports are valid
- [ ] Visual design matches wireframes
- [ ] Documentation is updated

## Risks & Mitigations

### Risk 1: Incomplete app information
**Mitigation:** Create reasonable placeholder data based on app names and categories. Can be refined later.

### Risk 2: Icon selection
**Mitigation:** Choose semantically appropriate lucide-react icons. Document icon choices for review.

### Risk 3: Duplicate app handling
**Mitigation:** SDT Data Tool and Mark.ly appear in multiple categories. Ensure data consistency by referencing same object or ensuring identical data.

### Risk 4: Time estimation
**Mitigation:** Content authoring for 25 apps may take longer than estimated. Consider batch processing and using AI assistance for initial drafts.

## Implementation Approach Options

### Option 1: Manual Content Authoring (Recommended for Quality)
- Research each app individually
- Write authentic, detailed descriptions
- Ensure accuracy and relevance
- **Time:** 8-10 hours
- **Quality:** High

### Option 2: Template-Based Approach (Recommended for Speed)
- Use standardized templates for all apps
- Fill in minimal required information
- Focus on getting structure right
- **Time:** 3-4 hours
- **Quality:** Medium

### Option 3: Hybrid Approach (RECOMMENDED)
- Research and fully author high-priority apps (Recommended section, common apps)
- Use templates for less common administrative apps
- Iterate and improve over time
- **Time:** 5-6 hours
- **Quality:** Medium-High

## Recommended Next Steps

1. **Get user confirmation** on implementation approach
2. **Clarify app information sources** - Should we research real apps or create placeholders?
3. **Decide on duplicate app handling** - Same object or separate entries?
4. **Begin Phase 1** - Data structure preparation and research
5. **Implement incrementally** - Category by category for easier review

## Questions for User

1. Should we research real information for these apps, or use reasonable placeholders?
2. For duplicate apps (SDT Data Tool, Mark.ly), should they reference the same data object?
3. Do you have any additional information or documentation about these apps?
4. What&apos;s the priority - speed or content quality?
5. Should we implement all at once, or category by category for review?

## Notes

- The wireframes show SDT Data Tool in both "Recommended for you" and "Classes and students"
- Mark.ly appears in both "Recommended for you" and "Classes and students"
- Many of these apps appear to be Singapore education system specific (MOE apps)
- Some apps are clearly third-party (MS Teams, Google Chats, Gemini, NotebookLM)
- Total unique apps: 31 (33 entries with 2 duplicates)
