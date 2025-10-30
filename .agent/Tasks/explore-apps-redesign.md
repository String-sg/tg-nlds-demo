# Explore Apps Redesign - Implementation Plan

**Feature**: All Apps Page Redesign (/explore)
**Status**: Planning
**Created**: October 30, 2025
**Branch**: explore-apps-redesign

---

## Overview

Redesign the "All Apps" page (/explore) to match the new wireframe design that includes:
1. Enhanced app card layout with logo placeholders and taglines
2. Individual app detail pages with comprehensive information
3. Breadcrumb navigation for detail pages
4. Improved visual design and user experience

---

## Design Analysis

### Wireframe 1: Current Structure (Image 1)
- **Page Title**: "Recommended for you" with contextual subtitle
- **Categories**:
  - Recommended for you (context-aware: exam period)
  - Classes and students
  - Parents and communications
  - School life & Admin
  - Growth and community
  - Digital innovation and enhancements
- **Layout**: Simple button-style cards with app names only
- **Content**: ~30+ apps across 6 categories

### Wireframe 2: New Discover Page Layout (Image 2)
- **Header**:
  - "Discover" title
  - Subtitle: "Find all MOE digital solutions for educator related jobs"
  - Search button (top right)
- **Card Design**:
  - Logo placeholder (dashed border, light gray background)
  - App name (bold, larger text)
  - Tagline/description below name
  - Clean white card with rounded corners
  - Hover/click interaction
- **Grid**: 2-3 columns responsive layout
- **Examples shown**:
  - SDT data tool: "See holistically. Act confidently."
  - Mark.ly: "Reimagining Marking with AI"
  - SEConnect: "SE growth, well-being & connectedness"
  - SCM: "xxxxx"

### Wireframe 3: App Detail Page (Image 3)
- **Navigation**: Back button (top left), Share button (top right)
- **Header Section**:
  - Large app icon/logo (square with rounded corners)
  - App name and subtitle
  - "Get" button with "In-App Purchases" note
- **Metadata Bar**:
  - Ratings (87 RATINGS, 4.9 stars)
  - Age (4+ Years Old)
  - Chart (No. 45, Productivity)
  - Developer (with icon)
  - Language (EN + 9 More)
  - Size (92 MB)
- **Content Sections**:
  - Large feature images/screenshots (2 columns)
  - Description text (full paragraph)
  - Developer info (website, support links)
  - Ratings & Reviews section (expandable)
- **Layout**: Similar to App Store detail pages

---

## Current Implementation Analysis

### Existing Code (`src/components/explore-content.tsx`)

**Current Features**:
- ✅ Search functionality with live filtering
- ✅ Category grouping with descriptions
- ✅ App card grid (3 columns)
- ✅ Icon + gradient backgrounds for each app
- ✅ Third-party badges
- ✅ Coming soon toast notifications
- ✅ Responsive design

**Current Data Structure**:
```typescript
interface App {
  key: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  gradient?: string
  thirdParty?: boolean
}
```

**Current Categories**:
1. Teacher workspace apps (7 apps)
2. Connected apps (3 apps)
3. More teaching tools (3 apps)

**Total Apps**: 13 apps

---

## Implementation Plan

### Phase 1: Data Model Enhancement

#### 1.1 Extend App Interface
Add new fields to support detail page:

```typescript
interface App {
  // Existing
  key: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  gradient?: string
  thirdParty?: boolean

  // New fields
  tagline: string                    // Short catchy phrase
  logo?: string                      // Optional logo image path
  fullDescription: string            // Multi-paragraph description
  developer: {
    name: string
    website?: string
    support?: string
  }
  metadata: {
    rating?: number                  // 0-5
    ratingCount?: number
    ageRating?: string               // e.g., "4+"
    chartPosition?: number
    chartCategory?: string           // e.g., "Productivity"
    languages: string[]
    size?: string                    // e.g., "92 MB"
  }
  features?: string[]                // Key features list
  screenshots?: string[]             // Feature images
  inAppPurchases?: boolean
  platforms?: string[]               // e.g., ["Mac", "iPad", "iPhone"]
}
```

#### 1.2 Update Mock Data
- Add taglines for all 13 existing apps
- Add full descriptions
- Add developer information
- Add metadata (ratings, languages, etc.)
- Keep it realistic and educator-focused

**Files to modify**:
- `src/components/explore-content.tsx` (data structure)

---

### Phase 2: List View Redesign

#### 2.1 Update Card Design
Transform existing cards to match wireframe 2:

**Changes**:
- Larger card size for better logo visibility
- Add logo placeholder section (64x64px, dashed border if no logo)
- Move icon to logo area (keep gradient for now)
- Display tagline prominently under app name
- Maintain existing hover effects
- Keep category organization

**Visual Specs**:
```tsx
Card Layout:
┌─────────────────────────────┐
│  ┌───────┐                  │
│  │       │  App Name        │
│  │ Logo  │  Tagline here... │
│  │       │                  │
│  └───────┘                  │
│                             │
│  [3rd party badge]          │
└─────────────────────────────┘
```

**Files to modify**:
- `src/components/explore-content.tsx` (card JSX, lines 251-281)

#### 2.2 Update Page Header
- Change title from implicit to "Discover"
- Add subtitle: "Find all MOE digital solutions for educator related jobs"
- Keep search bar functionality
- Move search to dedicated section

**Files to modify**:
- `src/components/explore-content.tsx` (header section, lines 194-222)

---

### Phase 3: App Detail Page

#### 3.1 Create Detail Page Component
New component: `src/components/explore/app-detail.tsx`

**Structure**:
```tsx
<div className="flex flex-col h-full">
  {/* Header with back/share buttons */}
  <AppDetailHeader />

  {/* Scrollable content */}
  <ScrollArea className="flex-1">
    {/* App info section */}
    <AppInfoSection />

    {/* Metadata bar */}
    <AppMetadataBar />

    {/* Screenshots/Features */}
    <AppScreenshots />

    {/* Description */}
    <AppDescription />

    {/* Developer info */}
    <AppDeveloperInfo />

    {/* Ratings & Reviews */}
    <AppReviews />
  </ScrollArea>
</div>
```

**Sub-components to create**:
1. `app-detail-header.tsx` - Navigation + share
2. `app-info-section.tsx` - Logo, name, get button
3. `app-metadata-bar.tsx` - Ratings, age, chart, etc.
4. `app-screenshots.tsx` - Feature images grid
5. `app-description.tsx` - Full text description
6. `app-developer-info.tsx` - Developer links
7. `app-reviews.tsx` - Ratings section (placeholder)

**Files to create**:
- `src/components/explore/app-detail.tsx`
- `src/components/explore/app-detail-header.tsx`
- `src/components/explore/app-info-section.tsx`
- `src/components/explore/app-metadata-bar.tsx`
- `src/components/explore/app-screenshots.tsx`
- `src/components/explore/app-description.tsx`
- `src/components/explore/app-developer-info.tsx`
- `src/components/explore/app-reviews.tsx`

#### 3.2 Routing Strategy
Since the app uses dynamic routing with `[[...slug]]`, integrate detail view into existing explore page:

**Options**:
1. **Modal/Dialog** (Recommended): Open detail in dialog overlay
   - Pros: No routing changes, smooth transition, maintains context
   - Cons: Less shareable (no unique URL per app)

2. **URL-based** (Future consideration): `/explore/:appKey`
   - Pros: Shareable URLs, browser back/forward
   - Cons: Requires routing updates, more complex

**Recommended Approach**: Start with Modal
- Use shadcn Dialog component
- Full-screen on mobile, large centered on desktop
- Maintain explore page state when closing

**Files to modify**:
- `src/components/explore-content.tsx` (add dialog integration)

#### 3.3 Breadcrumb Integration
Add breadcrumb support for detail view:

**Breadcrumb Pattern**:
```
Home > Explore > [App Name]
```

**Implementation**:
- Use existing breadcrumb system from `src/hooks/useBreadcrumbs.tsx`
- Add explore page breadcrumb when detail is open
- Clear breadcrumb when dialog closes

**Files to modify**:
- `src/components/explore/app-detail-header.tsx` (add breadcrumb)
- Potentially `src/hooks/useBreadcrumbs.tsx` (if explore not configured)

---

### Phase 4: Enhanced Features

#### 4.1 Search Enhancement
- Keep existing search functionality
- Consider adding filters (category, third-party, etc.)
- Add search results count
- Highlight search terms in results

**Files to modify**:
- `src/components/explore-content.tsx` (search section)

#### 4.2 App Categories Refinement
Match wireframe categories more closely:

**Proposed Category Update**:
```typescript
const categories = {
  recommended: 'Recommended for you',      // Context-aware
  classes: 'Classes and students',
  parents: 'Parents and communications',
  admin: 'School life & Admin',
  growth: 'Growth and community',
  digital: 'Digital innovation and enhancements'
}
```

**Add Context Logic**:
- Show "Recommended" section based on user context
- Examples: exam period, start of term, etc.
- Use mock logic for now (can connect to user preferences later)

**Files to modify**:
- `src/components/explore-content.tsx` (category system, lines 36-40, 172-189)

#### 4.3 Visual Polish
- Add subtle animations for card hover
- Smooth dialog open/close transitions
- Loading states for screenshots
- Skeleton loaders for detail page
- Empty states for missing data

---

## Technical Specifications

### Component Structure

```
src/components/
├── explore-content.tsx          # Main list view (update)
└── explore/
    ├── app-detail.tsx           # Main detail component (new)
    ├── app-detail-header.tsx    # Header with nav (new)
    ├── app-info-section.tsx     # Logo + name + CTA (new)
    ├── app-metadata-bar.tsx     # Stats bar (new)
    ├── app-screenshots.tsx      # Feature images (new)
    ├── app-description.tsx      # Full description (new)
    ├── app-developer-info.tsx   # Developer links (new)
    └── app-reviews.tsx          # Reviews section (new)
```

### Dependencies

**Existing** (no new installations):
- shadcn/ui Dialog component
- shadcn/ui ScrollArea
- shadcn/ui Button
- shadcn/ui Badge
- lucide-react icons

**New shadcn components to add** (if not present):
```bash
npx shadcn@latest add separator
npx shadcn@latest add avatar
```

### Styling Approach

**Design System**:
- Follow existing stone color palette
- Use Tailwind CSS 4 utilities
- Match homepage and classroom design language
- Ensure mobile responsiveness

**Key Classes**:
- Cards: `rounded-2xl`, `shadow-sm`, `hover:shadow-md`
- Text hierarchy: `text-sm`, `text-base`, `font-semibold`
- Spacing: `space-y-4`, `gap-3`, `px-8 py-10`
- Colors: `stone-900`, `stone-600`, `stone-400`, `stone-200`

---

## Implementation Phases & Timeline

### Phase 1: Foundation (Day 1)
- [x] Analyze wireframes
- [ ] Extend App interface with new fields
- [ ] Update mock data for all 13 apps
- [ ] Test data structure

**Deliverable**: Enhanced app data model

### Phase 2: List View (Day 1-2)
- [ ] Redesign app cards with logo placeholders
- [ ] Update page header (Discover title)
- [ ] Add tagline display
- [ ] Update category descriptions if needed
- [ ] Test responsive layout

**Deliverable**: Updated explore list page

### Phase 3: Detail Components (Day 2-3)
- [ ] Create folder structure `src/components/explore/`
- [ ] Build AppDetailHeader component
- [ ] Build AppInfoSection component
- [ ] Build AppMetadataBar component
- [ ] Build AppScreenshots component
- [ ] Build AppDescription component
- [ ] Build AppDeveloperInfo component
- [ ] Build AppReviews component (placeholder)
- [ ] Create main AppDetail wrapper

**Deliverable**: Complete detail page component set

### Phase 4: Integration (Day 3-4)
- [ ] Integrate Dialog into explore-content.tsx
- [ ] Connect card click to open detail
- [ ] Add breadcrumb support
- [ ] Test navigation flow
- [ ] Handle edge cases (missing data, loading states)

**Deliverable**: Working detail page with navigation

### Phase 5: Polish & Testing (Day 4-5)
- [ ] Add animations and transitions
- [ ] Implement loading states
- [ ] Test on mobile/tablet/desktop
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Cross-browser testing
- [ ] Performance optimization

**Deliverable**: Production-ready feature

---

## Mock Data Requirements

For each of the 13 apps, we need:

### Essential Data
- [x] name (existing)
- [x] key (existing)
- [x] icon (existing)
- [x] category (existing)
- [x] description (existing)
- [ ] tagline (new) - catchy one-liner
- [ ] fullDescription (new) - 2-3 paragraphs
- [ ] developer.name (new)
- [ ] metadata.languages (new) - array of languages

### Optional Data (nice to have)
- [ ] logo (image path or keep gradient)
- [ ] developer.website
- [ ] developer.support
- [ ] metadata.rating
- [ ] metadata.ratingCount
- [ ] metadata.ageRating
- [ ] metadata.chartPosition
- [ ] metadata.chartCategory
- [ ] metadata.size
- [ ] features (array of key features)
- [ ] screenshots (array of image paths)
- [ ] platforms (array)
- [ ] inAppPurchases (boolean)

**Note**: For MVP, we can use placeholder images/data for screenshots and some metadata.

---

## Example: Updated App Data

```typescript
{
  key: 'markly',
  name: 'Mark.ly',
  tagline: 'Reimagining Marking with AI',
  description: 'Automated marking and feedback tool',
  fullDescription: `Mark.ly is an AI-powered assessment tool that transforms how educators provide feedback to students. With advanced natural language processing, it can grade written assignments, provide constructive feedback, and identify learning gaps—all while maintaining the personal touch that students need.

The platform supports multiple assessment types including essays, short answers, and creative writing. Teachers can customize rubrics, set grading criteria, and review AI suggestions before finalizing marks. Mark.ly learns from your feedback style over time, becoming more aligned with your teaching philosophy.

Designed specifically for Singapore MOE educators, Mark.ly integrates seamlessly with existing systems and follows local curriculum guidelines. Save hours on marking while providing more detailed, actionable feedback to every student.`,
  icon: Check,
  category: 'More teaching tools',
  gradient: 'from-amber-400 to-amber-600',
  developer: {
    name: 'MOE Digital Innovation',
    website: 'https://markly.moe.gov.sg',
    support: 'https://support.markly.moe.gov.sg'
  },
  metadata: {
    rating: 4.7,
    ratingCount: 342,
    ageRating: '4+',
    chartPosition: 8,
    chartCategory: 'Education',
    languages: ['EN', 'ZH', 'MS', 'TA'],
    size: '45 MB'
  },
  features: [
    'AI-powered essay grading',
    'Customizable rubrics',
    'Batch marking support',
    'Detailed analytics',
    'Integration with Student Learning Space'
  ],
  platforms: ['Web', 'iPad', 'Mac'],
  inAppPurchases: false,
  thirdParty: false
}
```

---

## Design Patterns

### Card Interaction Pattern
```tsx
// List view card
<Card onClick={() => openAppDetail(app.key)}>
  <div className="flex items-start gap-4">
    <div className="logo-area">
      {app.logo ? (
        <img src={app.logo} alt={app.name} />
      ) : (
        <div className="logo-placeholder">
          <Icon />
        </div>
      )}
    </div>
    <div>
      <h3>{app.name}</h3>
      <p className="tagline">{app.tagline}</p>
    </div>
  </div>
</Card>
```

### Dialog Pattern
```tsx
<Dialog open={selectedApp !== null} onOpenChange={handleClose}>
  <DialogContent className="max-w-4xl h-[90vh]">
    <AppDetail app={selectedApp} />
  </DialogContent>
</Dialog>
```

### Breadcrumb Pattern
```tsx
<Breadcrumbs>
  <BreadcrumbItem onClick={() => navigate('/')}>Home</BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem onClick={handleClose}>Explore</BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem active>{app.name}</BreadcrumbItem>
</Breadcrumbs>
```

---

## Testing Checklist

### Functional Testing
- [ ] Search filters apps correctly
- [ ] Category grouping displays properly
- [ ] Card click opens detail dialog
- [ ] Back button closes detail
- [ ] Share button shows toast (placeholder)
- [ ] Breadcrumbs navigate correctly
- [ ] Get button shows toast (placeholder)
- [ ] All links are clickable
- [ ] Dialog closes on overlay click
- [ ] Dialog closes on Escape key

### Visual Testing
- [ ] Cards display logo/icon correctly
- [ ] Taglines are readable and properly sized
- [ ] Detail page matches wireframe layout
- [ ] Metadata bar displays all info
- [ ] Screenshots grid is responsive
- [ ] Text is properly aligned
- [ ] Hover effects work smoothly
- [ ] Animations are smooth, not jarring

### Responsive Testing
- [ ] Mobile (375px): Single column, full-screen dialog
- [ ] Tablet (768px): 2 columns, large dialog
- [ ] Desktop (1280px): 3 columns, centered dialog
- [ ] Large desktop (1920px): Maintains max-width

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader announces app names
- [ ] Images have alt text
- [ ] Buttons have proper labels
- [ ] Color contrast meets WCAG AA
- [ ] Dialog traps focus properly

### Performance Testing
- [ ] Page loads quickly (<1s)
- [ ] Search is instant (no lag)
- [ ] Dialog opens smoothly
- [ ] Images lazy load
- [ ] No layout shifts

---

## Success Criteria

### Must Have (MVP)
✅ All 13 apps have taglines and full descriptions
✅ List view displays logo area with icon
✅ Card click opens detail dialog
✅ Detail page shows app info, metadata, description
✅ Back button closes detail
✅ Breadcrumbs show navigation path
✅ Responsive design works on all screen sizes
✅ Maintains existing search functionality

### Should Have
- Categories match wireframe more closely
- Loading states for detail page
- Smooth animations and transitions
- Developer info section with links
- Placeholder for ratings/reviews
- Screenshot/feature images section

### Nice to Have (Future)
- Actual logo images for apps
- Real screenshots/feature images
- Working share functionality
- Deep linking (URL-based detail pages)
- User reviews and ratings
- Installation/launch functionality
- Context-aware recommendations
- Filter by category, rating, etc.

---

## Risks & Mitigation

### Risk 1: Dialog Performance on Mobile
**Impact**: Large dialog content may cause performance issues
**Mitigation**:
- Use ScrollArea with virtual scrolling if needed
- Lazy load images
- Test on actual devices early

### Risk 2: Mock Data Maintenance
**Impact**: 13 apps × many new fields = lots of content to write
**Mitigation**:
- Start with essential fields only
- Add optional fields incrementally
- Use realistic but concise content

### Risk 3: Routing Complexity
**Impact**: Dialog approach may limit future features
**Mitigation**:
- Design with URL-based routing in mind
- Keep dialog logic separate from detail component
- Document migration path to full routing

### Risk 4: Design Consistency
**Impact**: New components may not match existing design system
**Mitigation**:
- Reference existing components (classroom, inbox)
- Use shared color/spacing tokens
- Regular visual QA reviews

---

## Future Enhancements

### Phase 2 (Post-Launch)
1. **URL-based Detail Pages**: `/explore/:appKey` for shareability
2. **Real Integration**: Connect to actual app launch/install
3. **User Preferences**: Personalized recommendations
4. **Context Awareness**: Smart suggestions based on time, workload
5. **Reviews System**: User ratings and feedback
6. **Search Filters**: Advanced filtering by category, rating, features

### Phase 3 (Long-term)
1. **App Categories Management**: Dynamic category system
2. **Featured Apps Carousel**: Highlight new or important apps
3. **Usage Analytics**: Track which apps are most popular
4. **Update Notifications**: Alert when apps have new features
5. **Quick Actions**: Launch apps directly from explore
6. **Collections**: Curated app bundles for specific workflows

---

## References

### Design Resources
- Wireframe 1: All apps category overview
- Wireframe 2: Discover page with card layout
- Wireframe 3: App detail page (App Store style)

### Code References
- Current explore: `src/components/explore-content.tsx`
- Breadcrumbs hook: `src/hooks/useBreadcrumbs.tsx`
- Dialog component: `src/components/ui/dialog.tsx`
- Card component: `src/components/ui/card.tsx`
- Similar detail pattern: `src/components/student-profile.tsx`

### Documentation
- Project guidelines: `CLAUDE.md`
- Architecture: `.agent/System/CURRENT_ARCHITECTURE.md`
- Development guide: `.agent/System/DEVELOPMENT_GUIDE.md`

---

## Notes

- This design is inspired by the App Store detail page pattern, which users are familiar with
- The modal approach allows us to implement quickly without routing changes
- All features maintain the existing "coming soon" toast pattern until backends are ready
- Focus on visual design and UX first, actual functionality can be connected later
- Keep all changes within the Conductor workspace directory structure

---

## Approval Checklist

Before implementation:
- [x] Wireframes analyzed and understood
- [x] Current codebase reviewed
- [x] Data model designed
- [x] Component structure planned
- [x] Technical approach validated
- [ ] **User approval received** ⬅️ WAITING FOR APPROVAL

After user approves, proceed with Phase 1 implementation.
